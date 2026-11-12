import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, CalendarDays, Flame, ImagePlus, Loader2, Plus, Sparkles, Utensils, X } from "lucide-react";
import { scanKitchen, scanDish, type ScannedDish } from "@/lib/ai.functions";
import { useSession } from "@/hooks/use-session";
import { firebaseData } from "@/lib/firebase-data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): { mode?: "ingredients" | "dish" } => ({
    mode: search["mode"] === "ingredients" ? "ingredients" : "dish",
  }),
  head: () => ({
    meta: [
      { title: "Food Scanner – MealMate" },
      {
        name: "description",
        content:
          "Point your camera at a dish to identify it, get nutrition facts, and add it to your meal planner.",
      },
      { property: "og:title", content: "Food Scanner – MealMate" },
      {
        property: "og:description",
        content: "Identify any dish, see its nutrition, and save it to your planner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type ScannedItem = { name: string; quantity?: string; category?: string };
type Mode = "dish" | "ingredients";
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Downscale to keep uploads fast on mobile networks. */
async function compressImage(dataUrl: string, max = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      if (scale === 1) return resolve(dataUrl);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function isoLocal(d: Date) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

function ScanPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "dish");
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ScannedItem[] | null>(null);
  const [dish, setDish] = useState<ScannedDish | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return d;
      }),
    [],
  );
  const [planDate, setPlanDate] = useState(() => isoLocal(new Date()));
  const [mealType, setMealType] = useState("Lunch");
  const [newItem, setNewItem] = useState("");
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function reset() {
    setItems(null);
    setDish(null);
    setPreview(null);
    setNewItem("");
    if (inputRef.current) inputRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setItems(null);
    setDish(null);
    try {
      const dataUrl = await compressImage(await fileToDataUrl(file));
      setPreview(dataUrl);
      if (mode === "dish") {
        const found = await scanDish({ data: { imageDataUrl: dataUrl } });
        if (!found.is_food) {
          toast.info("That doesn't look like a dish", {
            description: "Try a clear photo of a plated meal.",
          });
          setPreview(null);
          return;
        }
        setDish(found);
        if (found.meal_type && MEAL_TYPES.includes(found.meal_type)) setMealType(found.meal_type);
      } else {
        const found = await scanKitchen({ data: { imageDataUrl: dataUrl } });
        setItems(found);
        if (found.length === 0) {
          toast.info("Didn't spot any ingredients", {
            description: "Try a clearer, closer photo.",
          });
        }
      }
    } catch (err) {
      toast.error("Couldn't scan that photo", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveDishToPlanner() {
    if (!dish || !user || saving) return;
    setSaving(true);
    try {
      const { error: planErr } = await firebaseData.from("meal_plans").insert({
        user_id: user.id,
        plan_date: planDate,
        meal_type: mealType,
        custom_name: dish.name,
      });
      if (planErr) throw planErr;
      const { error: logErr } = await firebaseData.from("nutrition_logs").insert({
        user_id: user.id,
        name: dish.name,
        meal_type: mealType,
        logged_at: new Date(`${planDate}T12:00:00`).toISOString(),
        calories: dish.calories ?? null,
        protein_g: dish.protein_g ?? null,
        carbs_g: dish.carbs_g ?? null,
        fat_g: dish.fat_g ?? null,
        servings: 1,
      });
      if (logErr) throw logErr;
      queryClient.invalidateQueries({ queryKey: ["planner"] });
      toast.success(`${dish.name} added to ${mealType}`, {
        description: `${dish.calories ?? "–"} kcal logged`,
        action: { label: "Open planner", onClick: () => navigate({ to: "/planner" }) },
      });
      reset();
    } catch (err) {
      toast.error("Couldn't save to planner", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function addAllToPantry(options: { thenFindRecipes?: boolean } = {}) {
    if (!items || !user || saving) return;
    setSaving(true);
    try {
      const { error } = await firebaseData.from("pantry_items").insert(
        items.map((i) => ({
          user_id: user.id,
          name: i.name,
          quantity: i.quantity ?? null,
          category: i.category ?? null,
          source: "scan",
        })),
      );
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      toast.success(`Added ${items.length} item${items.length === 1 ? "" : "s"} to your pantry`);
      if (options.thenFindRecipes) {
        navigate({ to: "/pantry" });
      } else {
        reset();
      }
    } catch (err) {
      toast.error("Couldn't save to pantry", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  const macros = dish
    ? [
        { label: "Protein", value: dish.protein_g, unit: "g" },
        { label: "Carbs", value: dish.carbs_g, unit: "g" },
        { label: "Fat", value: dish.fat_g, unit: "g" },
        { label: "Fibre", value: dish.fiber_g, unit: "g" },
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Scan</p>
        <h1 className="mt-1 font-display text-3xl leading-tight tracking-tight">Scan your food</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Point your camera at a dish or at your ingredients. We'll identify them, count the nutrition
          and save them for you.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 text-sm">
        {(
          [
            { id: "dish", label: "Identify dish", icon: Utensils },
            { id: "ingredients", label: "Log ingredients", icon: Camera },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              reset();
            }}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-medium transition-colors ${
              mode === m.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {!preview ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Camera className="h-7 w-7" />
          </span>
          <p className="mt-4 text-base font-medium">Scan with your camera</p>
          <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {mode === "dish"
              ? "Snap a plated meal to identify it and get calories and macros."
              : "Take or upload a photo of your ingredients or groceries."}
          </p>
          <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2">
            <Button className="h-12 rounded-xl" onClick={() => inputRef.current?.click()}>
              <Camera className="mr-2 h-4 w-4" />
              Open camera
            </Button>
            <Button
              variant="secondary"
              className="h-12 rounded-xl"
              onClick={() => galleryRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Choose from gallery
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            We'll ask for camera access the first time you scan.
          </p>
        </div>
      ) : (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <img src={preview} alt="Scanned food" className="max-h-72 w-full object-cover" />
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm font-medium">
                {mode === "dish" ? "Looking at your dish…" : "Looking at your ingredients…"}
              </p>
              <span className="h-px w-24 animate-pulse bg-foreground/60" />
            </div>
          )}
          {!busy && (
            <button
              type="button"
              onClick={reset}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {busy && !preview && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparing your photo…
        </div>
      )}

      {dish && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">{dish.name}</h2>
              <p className="text-sm text-muted-foreground">
                {[dish.cuisine, dish.portion].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {Math.round(dish.confidence * 100)}% match
            </span>
          </div>
          {dish.description && <p className="mt-2 text-sm">{dish.description}</p>}

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-primary px-4 py-4 text-primary-foreground">
            <Flame className="h-6 w-6" />
            <div>
              <div className="font-display text-2xl leading-none">{dish.calories ?? "–"}</div>
              <div className="text-xs opacity-80">kcal per portion</div>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-4 gap-2">
            {macros.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-background px-2 py-3 text-center">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </dt>
                <dd className="font-display text-lg">
                  {m.value ?? "–"}
                  <span className="text-xs font-normal">{m.value != null ? m.unit : ""}</span>
                </dd>
              </div>
            ))}
          </dl>

          {dish.ingredients.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {dish.ingredients.map((ing, i) => (
                <li
                  key={`${ing}-${i}`}
                  className="rounded-lg border border-border px-2.5 py-1 text-xs"
                >
                  {ing}
                </li>
              ))}
            </ul>
          )}
          {dish.health_note && (
            <p className="mt-4 text-sm text-muted-foreground">{dish.health_note}</p>
          )}

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4" /> Save to planner
            </p>
            <div className="flex flex-wrap gap-2">
              <Select value={planDate} onValueChange={setPlanDate}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d, i) => (
                    <SelectItem key={isoLocal(d)} value={isoLocal(d)}>
                      {i === 0
                        ? "Today"
                        : i === 1
                          ? "Tomorrow"
                          : d.toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex gap-3">
              <Button onClick={saveDishToPlanner} disabled={saving} className="h-12 rounded-xl">
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add to planner
              </Button>
              <Button variant="secondary" className="h-12 rounded-xl" onClick={reset}>
                <Camera className="mr-2 h-4 w-4" />
                Scan again
              </Button>
            </div>
          </div>
        </section>
      )}

      {items && items.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">Found {items.length} ingredients</h2>
            <span className="text-xs text-muted-foreground">Review before saving</span>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {items.map((item, i) => (
              <li
                key={`${item.name}-${i}`}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  {item.quantity ? (
                    <p className="text-xs text-muted-foreground">{item.quantity}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setItems((prev) => (prev ?? []).filter((_, idx) => idx !== i))}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const name = newItem.trim();
              if (!name) return;
              setItems((prev) => [...(prev ?? []), { name }]);
              setNewItem("");
            }}
          >
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an ingredient"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            />
            <Button type="submit" variant="secondary" className="h-11 shrink-0 rounded-xl px-4">
              <Plus className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-2">
            <Button
              className="h-12 w-full rounded-xl"
              disabled={saving || items.length === 0}
              onClick={() => addAllToPantry({ thenFindRecipes: true })}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Find recipes with these ingredients
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="h-12 flex-1 rounded-xl"
                disabled={saving}
                onClick={() => addAllToPantry()}
              >
                Add to pantry
              </Button>
              <Button variant="secondary" className="h-12 flex-1 rounded-xl" onClick={reset}>
                Scan again
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
