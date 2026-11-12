import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarDays,
  Camera,
  CameraOff,
  Check,
  Flame,
  ImagePlus,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { scanKitchen, scanDish, type ScannedDish } from "@/lib/ai.functions";
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
          "Point your camera at a dish or your ingredients to identify food, see nutrition and cook from what you have.",
      },
      { property: "og:title", content: "Food Scanner – MealMate" },
      {
        property: "og:description",
        content: "Identify a dish or scan your pantry ingredients with MealMate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScanPage,
});

type ScannedItem = { name: string; quantity?: string; category?: string };
type Mode = "dish" | "ingredients";
type CameraState = "idle" | "starting" | "live" | "denied" | "unsupported";
type Stage = "camera" | "preview" | "analysing" | "results";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(search.mode ?? "dish");
  const [stage, setStage] = useState<Stage>("camera");
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [dish, setDish] = useState<ScannedDish | null>(null);
  const [newItem, setNewItem] = useState("");
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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);

  async function startCamera() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraState("live");
    } catch {
      setCameraState("denied");
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      toast.info("The camera isn't ready yet", { description: "Give it a moment and try again." });
      return;
    }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    stopStream();
    setCameraState("idle");
    setPreview(dataUrl);
    setStage("preview");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    stopStream();
    setCameraState("idle");
    try {
      const dataUrl = await compressImage(await fileToDataUrl(file));
      setPreview(dataUrl);
      setStage("preview");
    } catch {
      toast.error("That photo couldn't be opened. Try another one.");
    }
  }

  async function analyse() {
    if (!preview) return;
    setStage("analysing");
    setDish(null);
    setItems([]);
    try {
      if (mode === "dish") {
        const found = await scanDish({ data: { imageDataUrl: preview } });
        if (!found.is_food) {
          toast.info("That doesn't look like a dish", {
            description: "Try a clear photo of a plated meal.",
          });
          reset();
          return;
        }
        setDish(found);
        if (found.meal_type && MEAL_TYPES.includes(found.meal_type)) setMealType(found.meal_type);
        setStage("results");
      } else {
        const found = await scanKitchen({ data: { imageDataUrl: preview } });
        setItems(found);
        setStage("results");
        if (found.length === 0) {
          toast.info("Didn't spot any ingredients", {
            description: "Try a clearer, closer photo, or add items by hand.",
          });
        }
      }
    } catch (err) {
      toast.error("Couldn't scan that photo", {
        description: err instanceof Error ? err.message : undefined,
      });
      setStage("preview");
    }
  }

  function reset() {
    stopStream();
    setItems([]);
    setDish(null);
    setPreview(null);
    setNewItem("");
    setStage("camera");
    setCameraState("idle");
    if (inputRef.current) inputRef.current.value = "";
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
    if (!user || saving || items.length === 0) return;
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
      return true;
    } catch (err) {
      toast.error("Couldn't save to pantry", {
        description: err instanceof Error ? err.message : undefined,
      });
      return false;
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

  const analysingLabel =
    mode === "dish" ? "Identifying your dish…" : "Looking at your ingredients…";

  return (
    <main className="mm-page">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mm-eyebrow">Camera</p>
          <h1 className="mm-h1 mt-2">
            {mode === "dish" ? "Identify a dish." : "Scan your ingredients."}
          </h1>
          <p className="mm-lead mt-2">
            {mode === "dish"
              ? "Point at a plated meal to name it, read the nutrition and plan it."
              : "Point at your fridge or pantry and we'll log what we can see."}
          </p>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-[#1e1e1e] bg-[#111111] p-1">
        {(
          [
            { id: "dish", label: "Dish", icon: Utensils },
            { id: "ingredients", label: "Ingredients", icon: Camera },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => {
              setMode(m.id);
              reset();
            }}
            className={`flex min-h-10 items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-colors ${
              mode === m.id ? "bg-white text-black" : "text-muted-foreground"
            }`}
          >
            <m.icon className="size-4" strokeWidth={1.7} />
            {m.label}
          </button>
        ))}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <section className="mt-5" aria-live="polite">
        {stage === "camera" && (
          <>
            <div className="cam-stage">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ display: cameraState === "live" ? "block" : "none" }}
              />
              {cameraState !== "live" && (
                <div className="absolute inset-0 grid place-items-center px-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="grid size-14 place-items-center rounded-full border border-[#262626] bg-[#141414] text-muted-foreground">
                      {cameraState === "denied" || cameraState === "unsupported" ? (
                        <CameraOff className="size-6" strokeWidth={1.6} />
                      ) : cameraState === "starting" ? (
                        <Loader2 className="size-6 animate-spin" />
                      ) : (
                        <Camera className="size-6" strokeWidth={1.6} />
                      )}
                    </span>
                    <p className="mm-body max-w-[260px]">
                      {cameraState === "denied"
                        ? "Camera access is blocked. Allow it in your browser settings, or upload a photo instead."
                        : cameraState === "unsupported"
                          ? "This device can't open a live camera. Upload a photo instead."
                          : cameraState === "starting"
                            ? "Opening your camera…"
                            : "Camera preview starts only when you allow it."}
                    </p>
                  </div>
                </div>
              )}
              {cameraState === "live" && <div className="cam-frame" aria-hidden="true" />}
            </div>

            <div className="mt-5 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="grid size-11 place-items-center rounded-full border border-[#262626] text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Upload from gallery"
              >
                <ImagePlus className="size-[19px]" strokeWidth={1.7} />
              </button>

              {cameraState === "live" ? (
                <button
                  type="button"
                  className="cam-shutter"
                  onClick={captureFrame}
                  aria-label="Capture photo"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => void startCamera()}
                  disabled={cameraState === "starting"}
                  className="mm-btn mm-btn--primary"
                >
                  <Camera />
                  Open camera
                </button>
              )}

              <span className="size-11" aria-hidden="true" />
            </div>
            <p className="mm-scan-legal mt-4 text-center">
              Photos are analysed by Mia to identify food. Nothing is posted publicly.
            </p>
          </>
        )}

        {(stage === "preview" || stage === "analysing") && preview && (
          <>
            <div className="cam-stage">
              <img src={preview} alt="Captured food" />
              {stage === "analysing" ? (
                <>
                  <div className="cam-frame" aria-hidden="true" />
                  <div className="cam-scanline" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-white">
                      <Loader2 className="size-4 animate-spin" />
                      {analysingLabel}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {stage === "preview" ? (
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={reset} className="mm-btn mm-btn--secondary flex-1">
                  <RotateCcw />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={() => void analyse()}
                  className="mm-btn mm-btn--primary flex-1"
                >
                  <Sparkles />
                  Analyse photo
                </button>
              </div>
            ) : (
              <p className="mm-meta mt-4 text-center">This usually takes a few seconds.</p>
            )}
          </>
        )}

        {stage === "results" && dish && (
          <div className="mt-1">
            <div className="flex items-start gap-4">
              {preview ? (
                <span className="size-20 flex-none overflow-hidden rounded-2xl bg-[#1a1a1a]">
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                </span>
              ) : null}
              <div className="min-w-0">
                <h2 className="mm-h2">{dish.name}</h2>
                <p className="mm-meta mt-1">
                  {[dish.cuisine, dish.portion].filter(Boolean).join(" · ") ||
                    "Identified from your photo"}
                </p>
                <span className="mm-tag mt-2 inline-flex">
                  {Math.round(dish.confidence * 100)}% match
                </span>
              </div>
            </div>

            {dish.description ? <p className="mm-body mt-4">{dish.description}</p> : null}

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#1e1e1e] bg-[#141414] px-4 py-3">
              <Flame className="size-5 text-muted-foreground" strokeWidth={1.7} />
              <div>
                <div className="text-2xl font-semibold leading-none tracking-[-0.03em]">
                  {dish.calories ?? "–"}
                </div>
                <div className="mm-meta mt-1">kcal per portion</div>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-4 gap-2">
              {macros.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-[#1e1e1e] bg-[#111111] px-2 py-3 text-center"
                >
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {m.label}
                  </dt>
                  <dd className="mt-1 text-[15px] font-medium">
                    {m.value ?? "–"}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {m.value != null ? m.unit : ""}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            {dish.ingredients.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {dish.ingredients.map((ing, i) => (
                  <li key={`${ing}-${i}`} className="mm-tag">
                    {ing}
                  </li>
                ))}
              </ul>
            ) : null}
            {dish.health_note ? <p className="mm-meta mt-4">{dish.health_note}</p> : null}

            <div className="mt-6 border-t border-[#1e1e1e] pt-5">
              <p className="mm-label mb-3 flex items-center gap-2">
                <CalendarDays className="size-4" strokeWidth={1.7} /> Save to planner
              </p>
              <div className="flex flex-wrap gap-2">
                <Select value={planDate} onValueChange={setPlanDate}>
                  <SelectTrigger className="h-11 w-40 rounded-xl border-[#303030] bg-[#141414]">
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
                  <SelectTrigger className="h-11 w-32 rounded-xl border-[#303030] bg-[#141414]">
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
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void saveDishToPlanner()} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Plus />}
                  Add to planner
                </Button>
                <Button variant="secondary" onClick={reset}>
                  <RotateCcw />
                  Scan again
                </Button>
              </div>
            </div>
          </div>
        )}

        {stage === "results" && !dish && (
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="mm-h2">
                {items.length > 0
                  ? `${items.length} ingredient${items.length === 1 ? "" : "s"} found`
                  : "Nothing found yet"}
              </h2>
              <span className="mm-tag">Review</span>
            </div>
            <p className="mm-meta mt-1">Edit anything before it goes into your pantry.</p>

            {items.length === 0 ? (
              <div className="mm-empty mt-4">
                <span className="mm-empty-icon">
                  <Search className="size-5" strokeWidth={1.6} />
                </span>
                <h3 className="mm-h3">Try another photo</h3>
                <p className="mm-meta max-w-[280px]">
                  A closer, brighter picture of the shelf usually helps. You can also add
                  ingredients by hand.
                </p>
                <button type="button" className="mm-btn mm-btn--secondary mt-2" onClick={reset}>
                  <RotateCcw />
                  Retake photo
                </button>
              </div>
            ) : (
              <>
                <ul className="mm-group mt-4 px-4">
                  {items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <div className="pantry-row">
                        <span className="grid size-9 flex-none place-items-center rounded-lg border border-[#1e1e1e] bg-[#191919] text-[12px] uppercase text-muted-foreground">
                          {item.name.slice(0, 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <input
                            value={item.name}
                            aria-label={`Ingredient ${index + 1}`}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === index ? { ...it, name: e.target.value } : it,
                                ),
                              )
                            }
                            className="w-full bg-transparent text-[15px] font-medium outline-none"
                          />
                          <input
                            value={item.quantity ?? ""}
                            aria-label={`Quantity for ${item.name}`}
                            placeholder="Add quantity"
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, i) =>
                                  i === index ? { ...it, quantity: e.target.value } : it,
                                ),
                              )
                            }
                            className="mm-meta w-full bg-transparent outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-[#e5484d]"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="size-4" strokeWidth={1.7} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newItem.trim()) return;
                    setItems((prev) => [...prev, { name: newItem.trim() }]);
                    setNewItem("");
                  }}
                >
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add an ingredient"
                    aria-label="Add an ingredient"
                    maxLength={120}
                  />
                  <button
                    type="submit"
                    className="grid size-12 flex-none place-items-center rounded-xl border border-[#303030] bg-[#111111] text-foreground"
                    aria-label="Add ingredient to list"
                  >
                    <Plus className="size-4" />
                  </button>
                </form>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    className="mm-btn mm-btn--primary"
                    disabled={saving}
                    onClick={async () => {
                      const ok = await addAllToPantry();
                      if (ok) reset();
                    }}
                  >
                    {saving ? <Loader2 className="animate-spin" /> : <Check />}
                    Confirm and add to pantry
                  </button>
                  <button
                    type="button"
                    className="mm-btn mm-btn--secondary"
                    disabled={saving}
                    onClick={async () => {
                      const ok = await addAllToPantry();
                      if (ok) await navigate({ to: "/pantry" });
                    }}
                  >
                    <Utensils />
                    Find recipes with these ingredients
                  </button>
                  <button type="button" className="mm-btn mm-btn--ghost" onClick={reset}>
                    <X />
                    Discard scan
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
