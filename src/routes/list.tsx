import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Edit2,
  Layers,
  Plus,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { myGroceryQuery, type GroceryRecord } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { PremiumFeatureLock } from "@/components/premium-feature-lock";
import { usePreferences } from "@/hooks/use-preferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { awardXp } from "@/lib/xp.functions";
import {
  DEFAULT_SHOPPING_CATEGORIES,
  SHOPPING_PREFS_EVENT,
  categorizeGroceryItem,
  combineQuantities,
  consolidateIngredients,
  normalizeAisleOrder,
  normalizeItemKey,
  readLocalShoppingPreferences,
  writeLocalShoppingPreferences,
  type ShoppingPreferences,
} from "@/lib/grocery-categorizer";

export const Route = createFileRoute("/list")({
  head: () => ({
    meta: [
      { title: "My grocery list | MealMate" },
      { name: "description", content: "Build and check off your personal MealMate grocery list." },
      { property: "og:title", content: "My grocery list | MealMate" },
      {
        property: "og:description",
        content: "Build and check off your personal MealMate grocery list.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListPage,
});

function ListPage() {
  const { user, loading } = useSession();
  const { isPremium, loading: premiumLoading } = usePremium();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { preferences, save: savePreferences } = usePreferences();
  const { data: items } = useQuery({ ...myGroceryQuery(), enabled: !!user && isPremium });

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("auto");
  const [sortMode, setSortMode] = useState<"aisle" | "alphabetical">("aisle");
  const [shoppingPrefs, setShoppingPrefs] = useState<ShoppingPreferences>(() =>
    readLocalShoppingPreferences(),
  );

  // Edit item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editCategory, setEditCategory] = useState<string>(DEFAULT_SHOPPING_CATEGORIES[0]);

  // Aisle order editor
  const [aisleDialogOpen, setAisleDialogOpen] = useState(false);
  const [draftAisles, setDraftAisles] = useState<string[]>(() =>
    normalizeAisleOrder(preferences.shopping?.aisle_order ?? shoppingPrefs.aisle_order),
  );
  const [savingAisles, setSavingAisles] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    const syncLocal = () => setShoppingPrefs(readLocalShoppingPreferences());
    window.addEventListener(SHOPPING_PREFS_EVENT, syncLocal);
    return () => window.removeEventListener(SHOPPING_PREFS_EVENT, syncLocal);
  }, []);

  const effectiveOverrides = useMemo(
    () => ({
      ...shoppingPrefs.category_overrides,
      ...(preferences.shopping?.category_overrides ?? {}),
    }),
    [preferences.shopping?.category_overrides, shoppingPrefs.category_overrides],
  );

  const aisleOrder = useMemo(
    () =>
      normalizeAisleOrder(
        preferences.shopping?.aisle_order?.length
          ? preferences.shopping.aisle_order
          : shoppingPrefs.aisle_order,
      ),
    [preferences.shopping?.aisle_order, shoppingPrefs.aisle_order],
  );

  const suggestedCategory = useMemo(
    () =>
      name.trim()
        ? categorizeGroceryItem(name, { overrides: effectiveOverrides })
        : DEFAULT_SHOPPING_CATEGORIES[0],
    [effectiveOverrides, name],
  );

  async function persistShoppingPrefs(next: ShoppingPreferences) {
    const written = writeLocalShoppingPreferences(next);
    setShoppingPrefs(written);
    if (user) {
      try {
        await savePreferences({
          ...preferences,
          shopping: {
            category_overrides: written.category_overrides,
            aisle_order: written.aisle_order,
          },
        });
      } catch {
        /* local copy saved */
      }
    }
  }

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["grocery"] });
  }

  function resolveItemCategory(item: GroceryRecord): string {
    return categorizeGroceryItem(item.name, {
      explicitCategory: item.category,
      overrides: effectiveOverrides,
    });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !user) return;
    const cleanName = name.trim();
    const cleanQty = quantity.trim() || null;
    const category =
      selectedCategory === "auto"
        ? categorizeGroceryItem(cleanName, { overrides: effectiveOverrides })
        : selectedCategory;

    // If user manually chose a category different from default heuristic, save override
    if (selectedCategory !== "auto") {
      const key = normalizeItemKey(cleanName);
      if (key) {
        const nextPrefs: ShoppingPreferences = {
          category_overrides: { ...effectiveOverrides, [key]: selectedCategory },
          aisle_order: aisleOrder,
        };
        void persistShoppingPrefs(nextPrefs);
      }
    }

    // Consolidate with existing unchecked item if it matches
    const normalizedNew = normalizeItemKey(cleanName).replace(/s$/, "");
    const existing = (items ?? []).find(
      (i) => !i.checked && normalizeItemKey(i.name).replace(/s$/, "") === normalizedNew,
    );

    if (existing) {
      const mergedQty = combineQuantities(existing.quantity, cleanQty);
      await firebaseData
        .from("grocery_items")
        .update({ quantity: mergedQty, category })
        .eq("id", existing.id);
      toast.success(`Updated ${existing.name}${mergedQty ? ` (${mergedQty})` : ""}`);
    } else {
      await firebaseData.from("grocery_items").insert({
        user_id: user.id,
        name: cleanName,
        quantity: cleanQty,
        category,
      });
    }

    setName("");
    setQuantity("");
    setSelectedCategory("auto");
    await refresh();
  }

  async function toggle(id: string, checked: boolean) {
    await firebaseData.from("grocery_items").update({ checked }).eq("id", id);
    await refresh();
  }

  async function remove(id: string) {
    await firebaseData.from("grocery_items").delete().eq("id", id);
    await refresh();
  }

  async function saveItemEdit(item: GroceryRecord) {
    const cleanQty = editQty.trim() || null;
    const nextCategory = editCategory;
    await firebaseData
      .from("grocery_items")
      .update({ quantity: cleanQty, category: nextCategory })
      .eq("id", item.id);

    const key = normalizeItemKey(item.name);
    if (key && nextCategory !== resolveItemCategory(item)) {
      await persistShoppingPrefs({
        category_overrides: { ...effectiveOverrides, [key]: nextCategory },
        aisle_order: aisleOrder,
      });
      toast.success(`Saved category override for "${item.name}" → ${nextCategory}`);
    } else {
      toast.success("Item updated");
    }

    setEditingId(null);
    await refresh();
  }

  async function clearChecked() {
    const finished = checkedCount;
    await firebaseData.from("grocery_items").delete().eq("checked", true);
    await refresh();
    if (finished > 0 && user) {
      try {
        const res = await awardXp({ data: { action: "grocery_list_completed" } });
        if (res.awarded) {
          toast.success(`+${res.points} XP · Grocery list done!`);
          queryClient.invalidateQueries({ queryKey: ["gamification"] });
        }
      } catch {
        /* XP is best-effort */
      }
    }
  }

  const checkedCount = items?.filter((i) => i.checked).length ?? 0;

  const duplicateCount = useMemo(() => {
    const unchecked = (items ?? []).filter((i) => !i.checked);
    const uniqueKeys = new Set(
      unchecked.map((i) => normalizeItemKey(i.name).replace(/s$/, "")).filter(Boolean),
    );
    return Math.max(0, unchecked.length - uniqueKeys.size);
  }, [items]);

  async function consolidateDuplicates() {
    if (!user || !items || duplicateCount === 0) return;
    const unchecked = items.filter((i) => !i.checked);
    const merged = consolidateIngredients(
      unchecked.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        category: resolveItemCategory(i),
      })),
      { overrides: effectiveOverrides },
    );
    await Promise.all(
      unchecked.map((i) => firebaseData.from("grocery_items").delete().eq("id", i.id)),
    );
    await firebaseData.from("grocery_items").insert(
      merged.map((m) => ({
        user_id: user.id,
        name: m.name,
        quantity: m.quantity,
        category: m.category,
      })),
    );
    toast.success(`Consolidated into ${merged.length} distinct items`);
    await refresh();
  }

  function moveAisle(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draftAisles.length) return;
    setDraftAisles((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      if (moved) copy.splice(nextIndex, 0, moved);
      return copy;
    });
  }

  async function saveAisleOrder() {
    setSavingAisles(true);
    try {
      await persistShoppingPrefs({
        category_overrides: effectiveOverrides,
        aisle_order: draftAisles,
      });
      toast.success("Aisle order saved to your account");
      setAisleDialogOpen(false);
    } finally {
      setSavingAisles(false);
    }
  }

  const aisleRank = useMemo(() => {
    const map = new Map<string, number>();
    aisleOrder.forEach((cat, idx) => map.set(cat.toLowerCase(), idx));
    return map;
  }, [aisleOrder]);

  const sortedItems = useMemo(() => {
    if (!items) return [];
    const copy = [...items];
    if (sortMode === "alphabetical") {
      return copy.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    }
    return copy.sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      const catA = resolveItemCategory(a);
      const catB = resolveItemCategory(b);
      if (catA !== catB) {
        const rankA = aisleRank.get(catA.toLowerCase()) ?? 999;
        const rankB = aisleRank.get(catB.toLowerCase()) ?? 999;
        if (rankA !== rankB) return rankA - rankB;
        return catA.localeCompare(catB);
      }
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sortMode, aisleRank, effectiveOverrides]);

  if (!loading && !premiumLoading && user && !isPremium) {
    return (
      <PremiumFeatureLock
        featureLabel="Smart Grocery List"
        title="Shop faster with sorted aisles"
        description="Auto-consolidate recipe quantities across 10 grocery aisles and keep custom aisle layouts with your 3-day free trial."
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 overflow-x-hidden bg-background px-3.5 py-6 pb-24 text-foreground sm:px-4 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground">
            <ShoppingCart className="h-5 w-5 text-[var(--periwinkle)]" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Grocery list
            </h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {items?.length ?? 0} items · {checkedCount} checked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setDraftAisles(aisleOrder);
              setAisleDialogOpen(true);
            }}
            className="h-10 rounded-xl border-border bg-card text-xs font-medium text-foreground hover:bg-secondary"
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Aisles
          </Button>

          <div className="flex items-center rounded-xl border border-border bg-secondary/80 p-1">
            <button
              type="button"
              onClick={() => setSortMode("aisle")}
              className={`min-h-8 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                sortMode === "aisle"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Aisle
            </button>
            <button
              type="button"
              onClick={() => setSortMode("alphabetical")}
              className={`min-h-8 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                sortMode === "alphabetical"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Add item form with optional quantity + smart category preview */}
      <form onSubmit={addItem} className="mt-6 space-y-2">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add item (e.g. tomatoes, dishwasher tablets)…"
            aria-label="Grocery item name"
            className="h-12 flex-1 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
          />
          <Input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            aria-label="Quantity"
            className="h-12 w-24 rounded-xl border-border bg-card text-center text-sm text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            aria-label="Add grocery item"
            className="h-12 min-w-12 rounded-xl bg-foreground px-4 text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {name.trim().length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              Category:{" "}
              <strong className="font-medium text-foreground">
                {selectedCategory === "auto" ? suggestedCategory : selectedCategory}
              </strong>
            </span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-8 w-52 rounded-lg border-border bg-secondary text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto ({suggestedCategory})</SelectItem>
                {DEFAULT_SHOPPING_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </form>

      {(checkedCount > 0 || duplicateCount > 0) && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          {duplicateCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void consolidateDuplicates()}
              className="h-9 rounded-xl border-border text-xs text-foreground"
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Combine {duplicateCount} duplicate{duplicateCount === 1 ? "" : "s"}
            </Button>
          )}
          {checkedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChecked}
              className="h-9 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            >
              Clear checked ({checkedCount})
            </Button>
          )}
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {items === undefined ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <Skeleton className="h-4 w-4 rounded bg-secondary" />
              <Skeleton className="h-4 max-w-[60%] flex-1 bg-secondary" />
            </li>
          ))
        ) : sortedItems.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Your list is empty. Add items or save ingredients from a recipe.
          </li>
        ) : (
          sortedItems.map((item, idx) => {
            const categoryLabel = resolveItemCategory(item);
            const prevCategory = idx > 0 ? resolveItemCategory(sortedItems[idx - 1]) : null;
            const showCategoryHeader =
              sortMode === "aisle" && (idx === 0 || prevCategory !== categoryLabel);
            const isEditing = editingId === item.id;

            return (
              <div key={item.id} className="space-y-1">
                {showCategoryHeader && (
                  <div className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--periwinkle)]">
                    {categoryLabel}
                  </div>
                )}
                <li
                  style={{ animationDelay: `${Math.min(idx, 8) * 20}ms` }}
                  className="rise-in flex flex-col gap-2 rounded-xl border border-border bg-card px-3.5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(v) => toggle(item.id, v === true)}
                      aria-label={`Mark ${item.name} as ${item.checked ? "not done" : "done"}`}
                    />
                    <div className="min-w-0 flex-1 break-words">
                      <span
                        className={`text-sm ${
                          item.checked ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.quantity && (
                        <span className="ml-2 text-xs font-medium text-muted-foreground tabular-nums">
                          · {item.quantity}
                        </span>
                      )}
                      {sortMode === "alphabetical" && (
                        <span className="ml-2 text-[11px] text-muted-foreground">
                          · {categoryLabel}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          setEditingId(null);
                        } else {
                          setEditingId(item.id);
                          setEditQty(item.quantity ?? "");
                          setEditCategory(categoryLabel);
                        }
                      }}
                      aria-label={`Edit ${item.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isEditing && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                      <Input
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        placeholder="Quantity (e.g. 500g)"
                        aria-label={`Edit quantity for ${item.name}`}
                        className="h-10 w-32 rounded-lg border-border bg-secondary text-xs text-foreground"
                      />
                      <Select value={editCategory} onValueChange={setEditCategory}>
                        <SelectTrigger className="h-10 min-w-[180px] flex-1 rounded-lg border-border bg-secondary text-xs text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_SHOPPING_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => void saveItemEdit(item)}
                          className="h-10 rounded-lg bg-foreground px-3 text-xs text-background"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="h-10 w-10 rounded-lg"
                          aria-label="Cancel edit"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              </div>
            );
          })
        )}
      </ul>

      {/* Custom Aisle Order Dialog */}
      <Dialog open={aisleDialogOpen} onOpenChange={setAisleDialogOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Customise aisle order</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Arrange supermarket sections to match the layout of your local store. Saved to your
              MealMate account.
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y divide-border rounded-xl border border-border bg-secondary/40">
            {draftAisles.map((cat, idx) => (
              <li key={cat} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                <span className="truncate font-medium">
                  <span className="mr-2 text-xs text-muted-foreground tabular-nums">
                    {idx + 1}.
                  </span>
                  {cat}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveAisle(idx, -1)}
                    aria-label={`Move ${cat} up`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === draftAisles.length - 1}
                    onClick={() => moveAisle(idx, 1)}
                    aria-label={`Move ${cat} down`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDraftAisles([...DEFAULT_SHOPPING_CATEGORIES])}
              className="rounded-xl text-xs text-muted-foreground"
            >
              Reset default
            </Button>
            <Button
              type="button"
              onClick={() => void saveAisleOrder()}
              disabled={savingAisles}
              className="rounded-xl bg-foreground text-background hover:opacity-90"
            >
              {savingAisles ? "Saving…" : "Save order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
