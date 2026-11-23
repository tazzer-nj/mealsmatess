import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { myGroceryQuery } from "@/lib/queries";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { awardXp } from "@/lib/xp.functions";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: items } = useQuery({ ...myGroceryQuery(), enabled: !!user });
  const [name, setName] = useState("");
  const [sortMode, setSortMode] = useState<"aisle" | "alphabetical">("aisle");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["grocery"] });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !user) return;
    const { error } = await firebaseData
      .from("grocery_items")
      .insert({ user_id: user.id, name: name.trim() });
    if (error) {
      toast.error("Couldn't add item to grocery list");
      return;
    }
    setName("");
    refresh();
  }

  async function toggle(id: string, checked: boolean) {
    const { error } = await firebaseData.from("grocery_items").update({ checked }).eq("id", id);
    if (error) {
      toast.error("Couldn't update grocery item");
      return;
    }
    refresh();
  }

  async function remove(id: string) {
    const { error } = await firebaseData.from("grocery_items").delete().eq("id", id);
    if (error) {
      toast.error("Couldn't remove grocery item");
      return;
    }
    refresh();
  }

  async function clearChecked() {
    const finished = checkedCount;
    const { error } = await firebaseData.from("grocery_items").delete().eq("checked", true);
    if (error) {
      toast.error("Couldn't clear checked items");
      return;
    }
    refresh();
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

  const sortedItems = (() => {
    if (!items) return [];
    const copy = [...items];
    if (sortMode === "alphabetical") {
      return copy.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    } else {
      // Sort by aisle/category first, then checked state, then name
      return copy.sort((a, b) => {
        if (a.checked !== b.checked) return a.checked ? 1 : -1;
        const catA = (a.category || "Other").trim();
        const catB = (b.category || "Other").trim();
        if (catA !== catB) return catA.localeCompare(catB);
        return a.name.localeCompare(b.name);
      });
    }
  })();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 overflow-x-hidden bg-background px-3.5 py-6 text-foreground sm:px-4 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground">
            <ShoppingCart className="h-5 w-5 text-[var(--periwinkle)]" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Grocery list
            </h1>
            <p className="text-sm tabular-nums text-muted-foreground">
              {items?.length ?? 0} items · {checkedCount} checked
            </p>
          </div>
        </div>

        {/* Sort Toggle */}
        <div className="flex items-center rounded-xl border border-border bg-secondary/80 p-1">
          <button
            type="button"
            onClick={() => setSortMode("aisle")}
            className={`min-h-9 rounded-lg px-3.5 text-xs font-medium transition-all ${
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
            className={`min-h-9 rounded-lg px-3.5 text-xs font-medium transition-all ${
              sortMode === "alphabetical"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      <form onSubmit={addItem} className="mt-6 flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an item…"
          className="h-12 rounded-xl border-border bg-card text-foreground placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          className="h-12 rounded-xl bg-foreground px-4 text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {checkedCount > 0 && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChecked}
            className="rounded-lg text-xs text-muted-foreground hover:text-foreground"
          >
            Clear checked
          </Button>
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
            const showCategoryHeader =
              sortMode === "aisle" &&
              (idx === 0 ||
                (sortedItems[idx - 1].category || "Other").trim() !==
                  (item.category || "Other").trim());
            const categoryLabel = (item.category || "Other").trim();

            return (
              <Fragment key={item.id}>
                {showCategoryHeader && (
                  <li
                    role="presentation"
                    className="pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-[var(--periwinkle)]"
                  >
                    {categoryLabel}
                  </li>
                )}
                <li className="motion-reveal flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={(v) => toggle(item.id, v === true)}
                    aria-label={`Mark ${item.name} as ${item.checked ? "not done" : "done"}`}
                  />
                  <div className="min-w-0 flex-1 break-words">
                    <span
                      className={`text-sm ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                        {item.quantity}
                      </span>
                    )}
                    {sortMode === "alphabetical" && item.category && (
                      <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              </Fragment>
            );
          })
        )}
      </ul>
    </main>
  );
}
