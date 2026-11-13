import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  CalendarDays,
  Flame,
  Loader2,
  Plus,
  Utensils,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  ChefHat,
  Check,
} from "lucide-react";
import { scanKitchen, scanDish, type ScannedDish, generateRecipe } from "@/lib/ai.functions";
import { useSession } from "@/hooks/use-session";
import { firebaseData } from "@/lib/firebase-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pantryRecipeQuery } from "@/lib/pantry-recipe";

export const Route = createFileRoute("/scan")({
  validateSearch: (search: Record<string, unknown>): { mode?: "ingredients" | "dish" } => ({
    mode: search["mode"] === "dish" ? "dish" : "ingredients",
  }),
  head: () => ({
    meta: [
      { title: "Food & Ingredient Scanner – MealMate" },
      {
        name: "description",
        content:
          "Scan ingredients or dishes with your camera. AI detects items, counts nutrition, and plans meals.",
      },
      { property: "og:title", content: "Food & Ingredient Scanner – MealMate" },
      {
        property: "og:description",
        content: "Point your camera to detect ingredients, get nutrition facts, or cook with Mia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type ScannedItem = { id: string; name: string; quantity: string; category?: string };
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

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "ingredients");
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ScannedItem[] | null>(null);
  const [dish, setDish] = useState<ScannedDish | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");

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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  function reset() {
    setItems(null);
    setDish(null);
    setPreview(null);
    setNewItemName("");
    setNewItemQty("");
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function processImageFile(file: File) {
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
        const mappedItems: ScannedItem[] = found.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          name: item.name,
          quantity: item.quantity || "",
          category: item.category || "General",
        }));
        setItems(mappedItems);
        if (mappedItems.length === 0) {
          toast.info("No ingredients spotted", {
            description: "Try a clearer photo or add items manually below.",
          });
        } else {
          toast.success(`Identified ${mappedItems.length} ingredients`);
        }
      }
    } catch (err) {
      toast.error("Couldn't scan that photo", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processImageFile(file);
  }

  function updateItem(id: string, field: "name" | "quantity", value: string) {
    if (!items) return;
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function removeItem(id: string) {
    if (!items) return;
    setItems(items.filter((i) => i.id !== id));
  }

  function addItem() {
    if (!newItemName.trim()) return;
    const item: ScannedItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQty.trim(),
      category: "General",
    };
    setItems((prev) => (prev ? [...prev, item] : [item]));
    setNewItemName("");
    setNewItemQty("");
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

  async function addAllToPantry() {
    if (!items || items.length === 0 || !user || saving) return;
    setSaving(true);
    try {
      const validItems = items.filter((i) => i.name.trim().length > 0);
      const { error } = await firebaseData.from("pantry_items").insert(
        validItems.map((i) => ({
          user_id: user.id,
          name: i.name.trim(),
          quantity: i.quantity.trim() || null,
          category: i.category || null,
          source: "scan",
        })),
      );
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["pantry"] });
      toast.success(
        `Saved ${validItems.length} item${validItems.length === 1 ? "" : "s"} to pantry`,
      );
    } catch (err) {
      toast.error("Couldn't save to pantry", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  async function cookWithScannedIngredients() {
    if (!items || items.length === 0 || generatingRecipe) return;
    const ingredientNames = items.map((i) => i.name.trim()).filter(Boolean);
    if (!ingredientNames.length) return;

    setGeneratingRecipe(true);
    try {
      const promptQuery = pantryRecipeQuery(ingredientNames);
      const { slug } = await generateRecipe({ data: { query: promptQuery } });
      toast.success("Recipe generated!");
      await navigate({ to: "/recipe/$slug", params: { slug } });
    } catch (err) {
      toast.error("Mia couldn't generate a recipe right now", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setGeneratingRecipe(false);
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
    <main className="mx-auto w-full max-w-2xl flex-1 bg-background px-4 py-8 text-foreground">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-[var(--periwinkle)]">
          <Camera className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground">Food Scanner</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "ingredients"
              ? "Scan ingredients in your fridge or pantry to cook with Mia."
              : "Point your camera at a dish to identify calories and nutrition."}
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 text-sm">
        {(
          [
            { id: "ingredients", label: "Scan Ingredients", icon: Camera },
            { id: "dish", label: "Identify Dish", icon: Utensils },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMode(m.id);
              reset();
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 font-medium transition-all ${
              mode === m.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <m.icon className="h-4 w-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileInput}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Image Capture / Preview Card */}
      {!preview ? (
        <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary text-foreground">
            <Camera className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {mode === "ingredients" ? "Scan your ingredients" : "Photograph your dish"}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
              {mode === "ingredients"
                ? "Capture groceries or pantry shelves. Mia will extract each item, let you edit, and find recipes."
                : "Snap any plated meal to calculate calories, macronutrients, and save to your planner."}
            </p>
          </div>

          <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="h-12 rounded-xl bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => galleryInputRef.current?.click()}
              className="h-12 rounded-xl border-border bg-secondary px-6 font-medium text-foreground hover:bg-accent"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Choose from Gallery
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative">
            <img
              src={preview}
              alt="Scanned item preview"
              className="max-h-72 w-full object-cover"
            />

            {/* Laser scanning sweep animation when busy */}
            {busy && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]">
                <div className="absolute inset-x-0 h-1 animate-[bounce_1.5s_infinite] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_3px_rgba(255,255,255,0.7)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs font-medium text-white shadow-xl backdrop-blur-md">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>
                      {mode === "dish"
                        ? "Mia is analyzing your dish…"
                        : "Mia is detecting ingredients…"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Retake badge overlay */}
            {!busy && (
              <button
                type="button"
                onClick={reset}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md transition-colors hover:bg-black"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Retake
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dish Results Display */}
      {dish && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 text-foreground">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-medium tracking-tight text-foreground">{dish.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {[dish.cuisine, dish.portion].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              {Math.round(dish.confidence * 100)}% match
            </span>
          </div>

          {dish.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{dish.description}</p>
          )}

          {/* Calorie Card */}
          <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-border bg-secondary p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-[var(--periwinkle)]">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-semibold leading-none text-foreground">
                {dish.calories ?? "–"}{" "}
                <span className="text-xs font-normal text-muted-foreground">kcal</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Estimated per portion</div>
            </div>
          </div>

          {/* Macronutrients Grid */}
          <dl className="mt-3 grid grid-cols-4 gap-2">
            {macros.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-border bg-secondary p-3 text-center"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-foreground">
                  {m.value ?? "–"}
                  <span className="text-xs font-normal text-muted-foreground">
                    {m.value != null ? m.unit : ""}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          {/* Detected Ingredients */}
          {dish.ingredients.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Ingredients
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {dish.ingredients.map((ing, i) => (
                  <li
                    key={`${ing}-${i}`}
                    className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-foreground"
                  >
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {dish.health_note && (
            <p className="mt-4 rounded-xl border border-border bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
              {dish.health_note}
            </p>
          )}

          {/* Save to Planner Section */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="h-4 w-4" /> Save to meal planner
            </p>
            <div className="flex flex-wrap gap-2">
              <Select value={planDate} onValueChange={setPlanDate}>
                <SelectTrigger className="h-10 w-44 rounded-xl border-border bg-secondary text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
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
                <SelectTrigger className="h-10 w-36 rounded-xl border-border bg-secondary text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  {MEAL_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button
                onClick={saveDishToPlanner}
                disabled={saving}
                className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add to planner
              </Button>
              <Button
                variant="outline"
                className="h-11 rounded-xl border-border bg-secondary px-5 text-foreground hover:bg-accent"
                onClick={reset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Scan again
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Ingredient Results & Correction Editor */}
      {items && (
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 text-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium tracking-tight text-foreground">
                Detected Ingredients ({items.length})
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Review or correct detected items before saving or cooking.
              </p>
            </div>
          </div>

          {/* Editable List of Ingredients */}
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_100px_auto] items-center gap-2 rounded-xl border border-border bg-secondary p-2"
              >
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  placeholder="Ingredient name"
                  className="h-9 border-none bg-transparent px-2 text-sm text-foreground focus-visible:ring-0"
                />
                <Input
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                  placeholder="Qty"
                  className="h-9 rounded-lg border border-border bg-card px-2 text-center text-xs text-foreground focus-visible:ring-1"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add missing ingredient input row */}
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_100px_auto] items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 p-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add another ingredient…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              className="h-9 border-none bg-transparent px-2 text-sm text-foreground focus-visible:ring-0"
            />
            <Input
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              placeholder="Qty (optional)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addItem();
                }
              }}
              className="h-9 rounded-lg border border-border bg-card px-2 text-center text-xs text-foreground focus-visible:ring-1"
            />
            <button
              type="button"
              onClick={addItem}
              disabled={!newItemName.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
              aria-label="Add item"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={cookWithScannedIngredients}
              disabled={generatingRecipe || items.length === 0}
              className="h-12 flex-1 rounded-xl bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            >
              {generatingRecipe ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChefHat className="mr-2 h-4 w-4" />
              )}
              Cook with Mia
            </Button>
            <Button
              onClick={addAllToPantry}
              disabled={saving || items.length === 0}
              variant="outline"
              className="h-12 flex-1 rounded-xl border-border bg-secondary font-medium text-foreground hover:bg-accent"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Save all to Pantry
            </Button>
            <Button
              variant="outline"
              onClick={reset}
              className="h-12 rounded-xl border-border bg-secondary px-4 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
