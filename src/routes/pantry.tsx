import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Refrigerator,
  Camera,
  ChefHat,
  Loader2,
  Search,
  Pencil,
  X,
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
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.quantity ?? "").toLowerCase().includes(term),
    );
  }, [items, search]);

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

  function startEdit(item: { id: string; name: string; quantity?: string | null }) {
    setEditing(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity ?? "");
  }

  async function saveEdit(id: string) {
    if (!user || !editName.trim()) return;
    try {
      const { error } = await firebaseData
        .from("pantry_items")
        .update({ name: editName.trim(), quantity: editQuantity.trim() || null })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setEditing(null);
      await client.invalidateQueries({ queryKey: ["pantry"] });
      toast.success("Ingredient updated");
    } catch {
      toast.error("Couldn't update that ingredient.");
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

  return (
    <main className="mm-page">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="mm-h1">Your pantry.</h1>
          <p className="mm-lead mt-2">Everything you have, ready for something delicious.</p>
        </div>
        <Link
          to="/scan"
          search={{ mode: "ingredients" }}
          className="mm-icon-btn flex-none"
          aria-label="Scan ingredients"
        >
          <Camera className="size-[19px]" strokeWidth={1.7} />
        </Link>
      </header>

      <div className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5">
          <Refrigerator className="size-3.5" strokeWidth={1.7} />
          {items.length} {items.length === 1 ? "ingredient" : "ingredients"}
        </span>
        {items.length > 0 ? (
          <Link
            to="/list"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:text-foreground"
          >
            Shopping list
          </Link>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
        className="mt-6 grid grid-cols-[minmax(0,1fr)_84px_48px] gap-2"
      >
        <Input
          aria-label="Ingredient"
          placeholder="Add an ingredient"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          className="h-12"
          required
        />
        <Input
          aria-label="Quantity"
          placeholder="Qty"
          value={quantity}
          maxLength={60}
          onChange={(e) => setQuantity(e.target.value)}
          className="h-12"
        />
        <button
          type="submit"
          className="grid size-12 place-items-center rounded-xl bg-white text-black transition-opacity disabled:opacity-40"
          aria-label="Add ingredient"
          disabled={busy || !name.trim()}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </form>

      {items.length > 4 ? (
        <div className="mm-search mt-3">
          <Search aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your pantry"
            aria-label="Search your pantry"
            className="mm-input"
          />
        </div>
      ) : null}

      <section className="mt-8" aria-live="polite">
        {isLoading ? (
          <div className="mm-stack">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mm-skeleton h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="mm-error">
            <p className="mm-body">We couldn't load your pantry.</p>
            <button
              type="button"
              className="mm-btn mm-btn--secondary mm-btn--sm"
              onClick={() => client.invalidateQueries({ queryKey: ["pantry"] })}
            >
              Try again
            </button>
          </div>
        ) : !items.length ? (
          <div className="mm-empty">
            <span className="mm-empty-icon">
              <Refrigerator className="size-5" strokeWidth={1.6} />
            </span>
            <h2 className="mm-h2">Your pantry is waiting.</h2>
            <p className="mm-meta max-w-[300px]">
              Add ingredients or scan your kitchen to get started.
            </p>
            <div className="mt-3 flex w-full max-w-[300px] flex-col gap-2">
              <Link to="/scan" search={{ mode: "ingredients" }} className="mm-btn mm-btn--primary">
                <Camera />
                Scan your kitchen
              </Link>
              <button
                type="button"
                className="mm-btn mm-btn--secondary"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>(
                    'input[aria-label="Ingredient"]',
                  );
                  input?.focus();
                }}
              >
                <Plus />
                Add an ingredient
              </button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mm-empty">
            <span className="mm-empty-icon">
              <Search className="size-5" strokeWidth={1.6} />
            </span>
            <h2 className="mm-h3">No matches for “{search}”</h2>
            <button
              type="button"
              className="mm-btn mm-btn--secondary mm-btn--sm"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="mm-group px-4">
            {filtered.map((item) => (
              <li key={item.id}>
                <div className="pantry-row">
                  {editing === item.id ? (
                    <div className="flex w-full flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        aria-label={`Name for ${item.name}`}
                        maxLength={120}
                        className="h-11"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          aria-label="Quantity"
                          placeholder="Quantity"
                          maxLength={60}
                          className="h-11"
                        />
                        <button
                          type="button"
                          className="mm-btn mm-btn--primary mm-btn--sm"
                          onClick={() => void saveEdit(item.id)}
                          disabled={!editName.trim()}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="mm-btn mm-btn--ghost mm-btn--sm"
                          onClick={() => setEditing(null)}
                          aria-label="Cancel editing"
                        >
                          <X />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="grid size-9 flex-none place-items-center rounded-lg border border-[#1e1e1e] bg-[#191919] text-[12px] font-medium uppercase text-muted-foreground">
                        {item.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-[15px] font-medium leading-snug">
                          {item.name}
                        </p>
                        <p className="mm-meta">{item.quantity || "No quantity set"}</p>
                      </div>
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#191919] hover:text-foreground"
                        aria-label={`Edit ${item.name}`}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="size-4" strokeWidth={1.7} />
                      </button>
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#191919] hover:text-[#e5484d]"
                        aria-label={`Remove ${item.name}`}
                        disabled={removing === item.id}
                        onClick={() => remove(item.id)}
                      >
                        {removing === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" strokeWidth={1.7} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {items.length > 0 ? (
        <div className="mt-8">
          <Button className="w-full rounded-xl" disabled={generating} onClick={() => void cook()}>
            {generating ? <Loader2 className="animate-spin" /> : <ChefHat />}
            Find recipes with these ingredients
          </Button>
          <p className="mm-meta mt-3 text-center">
            Mia will suggest a recipe and tell you what's still missing.
          </p>
        </div>
      ) : null}
    </main>
  );
}
