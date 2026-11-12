import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Refrigerator,
  Camera,
  ChefHat,
  Loader2,
  Search,
  ArrowRight,
  ListChecks,
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
        content: "Manage your ingredients and find a recipe using what you already have.",
      },
      { property: "og:title", content: "Your Pantry — MealMate" },
      {
        property: "og:description",
        content: "Keep ingredients organised and cook from your pantry with MealMate.",
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
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

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
    } catch {
      toast.error("Couldn't add that ingredient. Please try again.");
    } finally {
      setBusy(false);
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
      toast.error("The chef couldn't find a recipe right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const needle = filter.trim().toLowerCase();
  const visible = needle ? items.filter((i) => i.name.toLowerCase().includes(needle)) : items;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-10 pt-8 sm:px-8">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mm-eyebrow">Your kitchen</p>
          <h1 className="mt-2 mm-title">Your pantry.</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-[#A1A1AA]">
            Everything you have, ready for something delicious.
          </p>
        </div>
        <Link
          to="/scan"
          search={{ mode: "ingredients" }}
          aria-label="Scan ingredients"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1F1F1F]"
        >
          <Camera className="h-[19px] w-[19px]" strokeWidth={1.75} />
        </Link>
      </header>

      <div className="mt-7 flex items-baseline gap-2">
        <span className="text-[22px] font-semibold tracking-[-0.02em]">{items.length}</span>
        <span className="text-[13px] text-[#71717A]">
          {items.length === 1 ? "ingredient on hand" : "ingredients on hand"}
        </span>
      </div>

      {/* Add ingredient */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mt-5 grid grid-cols-[minmax(0,1fr)_84px_auto] gap-2"
      >
        <Input
          aria-label="Ingredient"
          placeholder="Add an ingredient"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          aria-label="Quantity"
          placeholder="Qty"
          value={quantity}
          maxLength={60}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Button
          type="submit"
          aria-label="Add ingredient"
          disabled={busy || !name.trim()}
          className="h-12 w-12 px-0"
        >
          {busy ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
          )}
        </Button>
      </form>

      {items.length > 0 && (
        <div className="relative mt-3">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]"
            strokeWidth={1.75}
          />
          <Input
            aria-label="Search your pantry"
            placeholder="Search your pantry"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-11"
          />
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mm-skeleton h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="mm-empty">
            <p className="text-[15px] font-medium">We couldn&apos;t load your pantry</p>
            <p className="mt-1 text-[13px] text-[#A1A1AA]">
              Check your connection and try again — nothing was lost.
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => void client.invalidateQueries({ queryKey: ["pantry"] })}
            >
              Try again
            </Button>
          </div>
        ) : !items.length ? (
          <div className="mm-empty">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#A1A1AA]">
              <Refrigerator className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p className="mt-5 text-[17px] font-medium">Your pantry is waiting.</p>
            <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-[#A1A1AA]">
              Add ingredients or scan your kitchen to get started.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="secondary">
                <Link to="/scan" search={{ mode: "ingredients" }}>
                  <Camera className="mr-2 h-[17px] w-[17px]" strokeWidth={1.75} /> Scan ingredients
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/list">
                  <ListChecks className="mr-2 h-[17px] w-[17px]" strokeWidth={1.75} /> Shopping list
                </Link>
              </Button>
            </div>
          </div>
        ) : !visible.length ? (
          <div className="mm-empty">
            <p className="text-[15px] font-medium">No match for “{filter.trim()}”</p>
            <p className="mt-1 text-[13px] text-[#A1A1AA]">Try a different word.</p>
            <Button variant="ghost" className="mt-4" onClick={() => setFilter("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((item) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 transition-colors hover:border-[#262626]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium capitalize text-white">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#71717A]">
                    {item.quantity || "No quantity set"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  disabled={removing === item.id}
                  onClick={() => void remove(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#1F1F1F] hover:text-[#F87171] disabled:opacity-50"
                >
                  {removing === item.id ? (
                    <Loader2 className="h-[17px] w-[17px] animate-spin" />
                  ) : (
                    <Trash2 className="h-[17px] w-[17px]" strokeWidth={1.75} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recipe integration */}
      {items.length > 0 && (
        <section className="mt-8 rounded-[18px] border border-[#1E1E1E] bg-[#111111] p-5">
          <h2 className="text-[16px] font-medium">Cook from what you have</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#A1A1AA]">
            Mia will build a recipe around your pantry and tell you exactly what&apos;s still
            missing.
          </p>
          <Button
            className="mt-4 w-full"
            disabled={!items.length || generating}
            onClick={() => void cook()}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-[17px] w-[17px] animate-spin" /> Building your recipe…
              </>
            ) : (
              <>
                <ChefHat className="mr-2 h-[17px] w-[17px]" strokeWidth={1.75} /> Find recipes with
                these ingredients
              </>
            )}
          </Button>
          <Link
            to="/list"
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white"
          >
            View shopping list <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}
    </main>
  );
}
