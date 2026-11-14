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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { myPantryQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { generateRecipe } from "@/lib/ai.functions";
import { pantryRecipeQuery } from "@/lib/pantry-recipe";

export const Route = createFileRoute("/pantry")({
  head: () => ({
    meta: [
      { title: "Your Pantry — MealMate" },
      {
        name: "description",
        content: "Manage your ingredients and find a recipe using what you already have in stock.",
      },
      { property: "og:title", content: "Your Pantry — MealMate" },
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
  const { user } = useSession();
  const navigate = useNavigate();
  const client = useQueryClient();
  const { data: items = [], isLoading, error } = useQuery({ ...myPantryQuery(), enabled: !!user });

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return items;
    const q = searchFilter.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.quantity && item.quantity.toLowerCase().includes(q)),
    );
  }, [items, searchFilter]);

  async function add() {
    if (!user || !name.trim() || busy) return;
    setBusy(true);
    try {
      const { error } = await firebaseData.from("pantry_items").insert({
        user_id: user.id,
        name: name.trim(),
        quantity: quantity.trim() || null,
        source: "manual",
      });
      if (error) throw error;
      setName("");
      setQuantity("");
      await client.invalidateQueries({ queryKey: ["pantry"] });
      toast.success("Ingredient added to pantry");
    } catch {
      toast.error("Couldn't add that ingredient. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: { id: string; name: string; quantity?: string | null }) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditQuantity("");
  }

  async function saveEdit(id: string) {
    if (!user || !editName.trim() || savingEdit) return;
    setSavingEdit(true);
    try {
      const { error } = await firebaseData
        .from("pantry_items")
        .update({
          name: editName.trim(),
          quantity: editQuantity.trim() || null,
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
    const query = pantryRecipeQuery(items.map((item) => item.name));
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

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 bg-background px-4 py-8 text-foreground">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Your Pantry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "ingredient" : "ingredients"} logged and ready to
            cook.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Add Ingredient Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mt-6 grid grid-cols-[minmax(0,1fr)_90px_auto] gap-2 rounded-2xl border border-border bg-card p-2"
      >
        <Input
          aria-label="Ingredient name"
          placeholder="Add an ingredient (e.g. olive oil, chicken)"
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
      </form>

      {/* Search Filter when items exist */}
      {items.length > 3 && (
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search your pantry ingredients…"
            className="h-10 rounded-xl border border-border bg-card pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1"
          />
        </div>
      )}

      {/* List Container */}
      <div className="mt-6">
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
              return (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-foreground transition-all hover:border-foreground/20"
                >
                  {isEditing ? (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Ingredient name"
                        className="h-9 rounded-lg border-border bg-secondary px-2 text-sm text-foreground"
                        autoFocus
                      />
                      <Input
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        placeholder="Qty"
                        className="h-9 w-24 rounded-lg border-border bg-secondary px-2 text-center text-xs text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        disabled={savingEdit || !editName.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:bg-primary/90"
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
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground hover:text-foreground"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        {item.quantity && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.quantity}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-all hover:bg-secondary hover:text-foreground group-hover:opacity-100"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          disabled={removing === item.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
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
                No ingredients matched "{searchFilter}".
              </p>
            )}
          </div>
        )}
      </div>

      {/* Cook with Mia Button */}
      {items.length > 0 && (
        <div className="mt-8 space-y-3">
          <Button
            className="h-12 w-full rounded-2xl bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90"
            disabled={generating}
            onClick={cook}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChefHat className="mr-2 h-4 w-4" />
            )}
            Find a recipe with Mia ({items.length} items)
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-2xl border-border bg-card text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Link to="/list">View Shopping List</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
