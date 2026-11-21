import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Refrigerator,
  Camera,
  ChefHat,
  Loader2,
  Search,
  Edit2,
  Check,
  X,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { myPantryQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { PremiumFeatureLock } from "@/components/premium-feature-lock";
import { generateRecipe } from "@/lib/ai.functions";
import { pantryRecipeQuery } from "@/lib/pantry-recipe";
import { categorizeGroceryItem } from "@/lib/grocery-categorizer";
import { getExpiryStatus } from "@/lib/pantry-matcher";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "Your Pantry | MealMate" },
      {
        name: "description",
        content: "Manage your ingredients and find a recipe using what you already have in stock.",
      },
      { property: "og:title", content: "Your Pantry | MealMate" },
      {
        property: "og:description",
        content: "Keep ingredients organised and cook from your pantry with Mia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PantryPage,
});

function PantryPage() {
  const { user, loading } = useSession();
  const { isPremium, loading: premiumLoading } = usePremium();
  const navigate = useNavigate();
  const client = useQueryClient();
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({ ...myPantryQuery(), enabled: !!user && isPremium });

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [sortByExpiry, setSortByExpiry] = useState(false);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const expiringCount = useMemo(
    () =>
      items.filter((i) => {
        const st = getExpiryStatus(i.expires_at).status;
        return st === "expiring" || st === "expired";
      }).length,
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    const list = q
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            (item.quantity && item.quantity.toLowerCase().includes(q)) ||
            (item.category && String(item.category).toLowerCase().includes(q)),
        )
      : [...items];

    if (!sortByExpiry) return list;

    return list.sort((a, b) => {
      const da = getExpiryStatus(a.expires_at).daysLeft ?? 9999;
      const db = getExpiryStatus(b.expires_at).daysLeft ?? 9999;
      return da - db;
    });
  }, [items, searchFilter, sortByExpiry]);

  async function add() {
    if (!user || !name.trim() || busy) return;
    setBusy(true);
    try {
      const cleanName = name.trim();
      const { error } = await firebaseData.from("pantry_items").insert({
        user_id: user.id,
        name: cleanName,
        quantity: quantity.trim() || null,
        category: categorizeGroceryItem(cleanName),
        expires_at: expiresAt || null,
        source: "manual",
      });
      if (error) throw error;
      setName("");
      setQuantity("");
      setExpiresAt("");
      await client.invalidateQueries({ queryKey: ["pantry"] });
      void import("@/lib/analytics-events")
        .then(({ dispatchAnalyticsEvent }) =>
          dispatchAnalyticsEvent({
            userId: user.id,
            eventName: "pantry_item_added",
            entityId: cleanName.toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 64),
            metadata: { source: "manual", hasExpiry: Boolean(expiresAt) },
          }),
        )
        .catch(() => undefined);
      toast.success("Ingredient added to pantry");
    } catch {
      toast.error("Couldn't add that ingredient. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: {
    id: string;
    name: string;
    quantity?: string | null;
    expires_at?: string | null;
  }) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity || "");
    setEditExpiresAt(item.expires_at ? item.expires_at.slice(0, 10) : "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditQuantity("");
    setEditExpiresAt("");
  }

  async function saveEdit(id: string) {
    if (!user || !editName.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const cleanName = editName.trim();
      const { error } = await firebaseData
        .from("pantry_items")
        .update({
          name: cleanName,
          quantity: editQuantity.trim() || null,
          category: categorizeGroceryItem(cleanName),
          expires_at: editExpiresAt || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await client.invalidateQueries({ queryKey: ["pantry"] });
      cancelEdit();
      toast.success("Updated ingredient");
    } catch {
      toast.error("Couldn't update ingredient.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function remove(id: string) {
    if (!user) return;
    setRemoving(id);
    try {
      const { error } = await firebaseData
        .from("pantry_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await client.invalidateQueries({ queryKey: ["pantry"] });
      toast.success("Item removed");
    } catch {
      toast.error("Couldn't remove that ingredient.");
    } finally {
      setRemoving(null);
    }
  }

  async function cook() {
    const prioritized = [...items]
      .sort((a, b) => {
        const da = getExpiryStatus(a.expires_at).daysLeft ?? 9999;
        const db = getExpiryStatus(b.expires_at).daysLeft ?? 9999;
        return da - db;
      })
      .map((item) => item.name);
    const query = pantryRecipeQuery(prioritized);
    if (!query || generating) return;
    setGenerating(true);
    try {
      const { slug } = await generateRecipe({ data: { query } });
      await navigate({ to: "/recipe/$slug", params: { slug } });
    } catch {
      toast.error("Mia couldn't generate a recipe right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (!loading && !premiumLoading && user && !isPremium) {
    return (
      <PremiumFeatureLock
        featureLabel="Smart Pantry"
        title="Cook from what you already have"
        description="Track pantry inventory, catch ingredients before they expire, and match recipes automatically with your 3-day free trial."
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 overflow-x-hidden bg-background px-3.5 py-6 pb-24 text-foreground sm:px-4 sm:py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Your Pantry
          </h1>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {items.length} {items.length === 1 ? "ingredient" : "ingredients"} logged
            {expiringCount > 0 ? ` · ${expiringCount} expiring soon` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Scan ingredients"
          >
            <Link to="/scan" search={{ mode: "ingredients" }} aria-label="Scan ingredients">
              <Camera className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Shopping list"
          >
            <Link to="/list" aria-label="Shopping list">
              <ShoppingBag className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Add Ingredient Form with optional expiry date */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mt-6 space-y-2 rounded-2xl border border-border bg-card p-2.5"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_88px_44px] gap-1.5 sm:grid-cols-[minmax(0,1fr)_110px_44px] sm:gap-2">
          <Input
            aria-label="Ingredient name"
            placeholder="Add ingredient (e.g. spinach, chicken)"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            className="h-11 border-none bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            required
          />
          <Input
            aria-label="Quantity"
            placeholder="Qty (e.g. 250g)"
            value={quantity}
            maxLength={60}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-11 rounded-xl border border-border bg-secondary px-3 text-center text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1"
          />
          <Button
            type="submit"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="Add ingredient"
            disabled={busy || !name.trim()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 pt-2 text-xs text-muted-foreground">
          <label htmlFor="pantry-expiry" className="shrink-0">
            Expiry date (optional):
          </label>
          <input
            id="pantry-expiry"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="h-8 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground"
          />
        </div>
      </form>

      {/* Search & Expiry Sort when items exist */}
      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {items.length > 3 && (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search pantry or category…"
                className="h-10 rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1"
              />
            </div>
          )}
          <Button
            type="button"
            variant={sortByExpiry ? "default" : "outline"}
            size="sm"
            onClick={() => setSortByExpiry((v) => !v)}
            className="h-10 rounded-xl border-border text-xs"
          >
            {sortByExpiry ? "Sorted: Expiring soon" : "Sort by expiry"}
          </Button>
        </div>
      )}

      {/* List Container */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm">Loading your ingredients…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Couldn't load your pantry.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-border bg-card text-foreground hover:bg-secondary"
              onClick={() => client.invalidateQueries({ queryKey: ["pantry"] })}
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary text-muted-foreground">
              <Refrigerator className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-medium text-foreground">Your pantry is empty</h2>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              Add staples manually above or tap the camera icon to instantly scan your shelves.
            </p>
            <Button
              asChild
              className="mt-5 rounded-xl bg-primary px-5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/scan" search={{ mode: "ingredients" }}>
                <Camera className="mr-2 h-3.5 w-3.5" />
                Scan Ingredients Now
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isEditing = editingId === item.id;
              const expiry = getExpiryStatus(item.expires_at);
              const categoryLabel = item.category || categorizeGroceryItem(item.name);

              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-foreground transition-all hover:border-foreground/20"
                >
                  {isEditing ? (
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Ingredient name"
                        className="h-10 min-w-[120px] flex-1 rounded-lg border-border bg-secondary px-2.5 text-sm text-foreground"
                        autoFocus
                      />
                      <Input
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="Qty"
                        className="h-10 w-20 shrink-0 rounded-lg border-border bg-secondary px-2 text-center text-xs text-foreground sm:w-24"
                      />
                      <input
                        type="date"
                        aria-label="Edit expiry date"
                        value={editExpiresAt}
                        onChange={(e) => setEditExpiresAt(e.target.value)}
                        className="h-10 rounded-lg border border-border bg-secondary px-2 text-xs text-foreground"
                      />
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => saveEdit(item.id)}
                          disabled={savingEdit || !editName.trim()}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:bg-primary/90"
                          title="Save changes"
                        >
                          {savingEdit ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums">
                          {categoryLabel}
                          {item.quantity ? ` · ${item.quantity}` : ""}
                          {expiry.label ? (
                            <span
                              className={
                                expiry.status === "expired"
                                  ? " font-medium text-destructive"
                                  : expiry.status === "expiring"
                                    ? " font-medium text-amber-600 dark:text-amber-400"
                                    : ""
                              }
                            >
                              {` · ${expiry.label}`}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          disabled={removing === item.id}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                          title="Delete"
                        >
                          {removing === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {filteredItems.length === 0 && searchFilter && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No ingredients matched &ldquo;{searchFilter}&rdquo;.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {items.length > 0 && (
        <div className="mt-8 space-y-2.5">
          <Button
            asChild
            className="h-12 w-full rounded-2xl bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Link to="/recipes" search={{ pantry: "1" }}>
              <Sparkles className="mr-2 h-4 w-4" />
              Find matching recipes ({items.length} items)
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-2xl border-border bg-card text-xs font-medium text-foreground hover:bg-secondary"
            disabled={generating}
            onClick={cook}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChefHat className="mr-2 h-4 w-4" />
            )}
            Create custom recipe with Mia
          </Button>
        </div>
      )}
    </main>
  );
}
