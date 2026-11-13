import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function refresh() {
    return queryClient.invalidateQueries({ queryKey: ["grocery"] });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !user) return;
    await firebaseData.from("grocery_items").insert({ user_id: user.id, name: name.trim() });
    setName("");
    refresh();
  }

  async function toggle(id: string, checked: boolean) {
    await firebaseData.from("grocery_items").update({ checked }).eq("id", id);
    refresh();
  }

  async function remove(id: string) {
    await firebaseData.from("grocery_items").delete().eq("id", id);
    refresh();
  }

  async function clearChecked() {
    const finished = checkedCount;
    await firebaseData.from("grocery_items").delete().eq("checked", true);
    refresh();
    if (finished > 0 && user) {
      try {
        const res = await awardXp({ data: { action: "grocery_list_completed" } });
        if (res.awarded) {
          toast.success(`+${res.points} XP — grocery list done!`);
          queryClient.invalidateQueries({ queryKey: ["gamification"] });
        }
      } catch {
        /* XP is best-effort */
      }
    }
  }

  const checkedCount = items?.filter((i) => i.checked).length ?? 0;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 bg-background px-4 py-8 text-foreground">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground">
          <ShoppingCart className="h-5 w-5 text-[var(--periwinkle)]" />
        </span>
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">Grocery list</h1>
          <p className="text-sm text-muted-foreground">
            {items?.length ?? 0} items · {checkedCount} checked
          </p>
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
        ) : items.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Your list is empty. Add items or save ingredients from a recipe.
          </li>
        ) : (
          items.map((item, idx) => (
            <li
              key={item.id}
              style={{ animationDelay: `${Math.min(idx, 8) * 30}ms` }}
              className="rise-in flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={(v) => toggle(item.id, v === true)}
                aria-label={`Mark ${item.name} as ${item.checked ? "not done" : "done"}`}
              />
              <div className="flex-1">
                <span
                  className={`text-sm ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {item.name}
                </span>
                {item.quantity && (
                  <span className="ml-2 text-xs text-muted-foreground">{item.quantity}</span>
                )}
              </div>
              <button
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
