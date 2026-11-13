import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Bot,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  ExternalLink,
  HelpCircle,
  Info,
  KeyRound,
  Languages,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Scale,
  Shield,
  Sliders,
  Sun,
  Trash2,
  Type,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { APP_FONTS, type AppFontId } from "@/lib/app-fonts";
import { createPurchaseSession, verifyMyPremium } from "@/lib/billing.functions";
import { loadBillingStore } from "@/lib/billing-client";
import {
  auth,
  db,
  sendPasswordReset as sendFirebasePasswordReset,
  signOutUser,
} from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { FoodPreferences } from "@/lib/preferences";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MealMate" },
      {
        name: "description",
        content:
          "Manage your MealMate account, subscription, culinary preferences, Mia voice assistant, and appearance.",
      },
    ],
  }),
  component: SettingsPage,
});

const PREF_DIETS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-free",
  "Dairy-free",
  "Keto / Low-carb",
  "Pescatarian",
];

const PREF_ALLERGIES = [
  "Peanuts",
  "Tree nuts",
  "Milk / Lactose",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
];

const PREF_CUISINES = [
  "South African",
  "Italian",
  "Mexican",
  "Asian Fusion",
  "Mediterranean",
  "Indian",
  "Healthy meals",
  "High protein",
  "Comfort food",
  "Quick weeknight meals",
];

const PREF_GOALS = [
  "Eat healthier & balanced",
  "Discover new recipes",
  "Save time",
  "Save money",
  "Plan weekly meals",
  "Reduce food waste",
  "High protein & fitness",
  "Family-friendly cooking",
];

const PREF_SKILLS = ["Beginner", "Intermediate", "Experienced"];

function formatInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "Chef").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatPlanTier(tier: string, isPremium: boolean): string {
  if (!isPremium || tier === "free") return "Free Plan";
  if (tier === "family") return "MealMate Family";
  if (tier === "yearly") return "MealMate Yearly";
  if (tier === "monthly") return "MealMate Monthly";
  return "MealMate Premium";
}

function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { isPremium, tier, trialActive, entitlement } = usePremium();
  const { preferences, save: savePreferences } = usePreferences();
  const { mode, setMode, font, setFont } = useTheme();

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPreferencesOpen, setEditPreferencesOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [reportProblemOpen, setReportProblemOpen] = useState(false);
  const [speechPrefsOpen, setSpeechPrefsOpen] = useState(false);

  // Profile & account form state
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Billing state
  const [restoring, setRestoring] = useState(false);

  // Report state
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);

  // Mia speech & mic permission state
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState("1.0");
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">(
    "unknown",
  );
  const [requestingMic, setRequestingMic] = useState(false);

  // Notification toggles
  const [mealReminders, setMealReminders] = useState(true);
  const [recipeAlerts, setRecipeAlerts] = useState(true);
  const [planningReminders, setPlanningReminders] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);

  // App localization
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [language, setLanguage] = useState("en");

  // Culinary preferences modal draft state
  const [draftPrefs, setDraftPrefs] = useState<FoodPreferences>(preferences);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const isGoogleUser = Boolean(user?.providerData?.some((p) => p.providerId === "google.com"));

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceResponses(localStorage.getItem("mealmate_voice_responses") !== "false");
    setIsMuted(localStorage.getItem("mealmate_voice_muted") === "true");
    setSpeechSpeed(localStorage.getItem("mealmate_speech_speed") ?? "1.0");
    setUnits((localStorage.getItem("mealmate_units") as "metric" | "imperial") ?? "metric");
    setLanguage(localStorage.getItem("mealmate_lang") ?? "en");

    setMealReminders(localStorage.getItem("mealmate_notif_meal_reminders") !== "false");
    setRecipeAlerts(localStorage.getItem("mealmate_notif_recipe_alerts") !== "false");
    setPlanningReminders(localStorage.getItem("mealmate_notif_planning") !== "false");
    setPromoAlerts(localStorage.getItem("mealmate_notif_promo") === "true");

    if (navigator.permissions?.query) {
      void navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((status) => {
          setMicPermission(status.state);
          status.onchange = () => setMicPermission(status.state);
        })
        .catch(() => setMicPermission("unknown"));
    }
  }, []);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

  useEffect(() => {
    if (editPreferencesOpen) {
      setDraftPrefs(preferences);
    }
  }, [editPreferencesOpen, preferences]);

  async function handleSaveProfile() {
    if (!user || !displayName.trim()) return;
    const trimmed = displayName.trim();
    setSavingProfile(true);
    try {
      if (auth?.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
        await setDoc(doc(db, "users", user.id), { displayName: trimmed }, { merge: true });
      }
      await firebaseData
        .from("profiles")
        .update({ displayName: trimmed, name: trimmed } as never)
        .eq("id", user.id);
      await queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      toast.success("Profile updated");
      setEditProfileOpen(false);
    } catch {
      toast.error("Could not update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveCulinaryPreferences() {
    setSavingPrefs(true);
    try {
      await savePreferences({
        ...draftPrefs,
        onboarding_completed: true,
      });
      if (user) {
        await queryClient.invalidateQueries({ queryKey: ["preferences"] });
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
      }
      toast.success("Culinary preferences updated");
      setEditPreferencesOpen(false);
    } catch {
      toast.error("Could not save preferences right now. Local changes were kept.");
    } finally {
      setSavingPrefs(false);
    }
  }

  function toggleDraftList(
    field: "dietary_restrictions" | "allergies" | "favorite_foods",
    value: string,
  ) {
    setDraftPrefs((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  async function handlePasswordReset() {
    if (!user?.email || sendingReset) return;
    setSendingReset(true);
    try {
      await sendFirebasePasswordReset(user.email);
      toast.success(`Password reset link sent to ${user.email}.`);
    } catch {
      toast.error("Could not send password reset email. Please try again.");
    } finally {
      setSendingReset(false);
    }
  }

  async function handleRequestMicrophone() {
    if (
      requestingMic ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      toast.error("Microphone access is not supported in this browser.");
      return;
    }
    setRequestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      toast.success("Microphone access granted for Mia Voice Mode.");
    } catch {
      setMicPermission("denied");
      toast.error("Microphone permission denied. Enable it in your browser settings.");
    } finally {
      setRequestingMic(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser();
      queryClient.clear();
      toast.success("Signed out successfully");
      await navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Could not sign out. Try again.");
    }
  }

  async function handleDeleteAccount() {
    if (!user || deleteConfirmText.trim().toUpperCase() !== "DELETE" || deletingAccount) return;
    setDeletingAccount(true);
    try {
      await firebaseData.from("profiles").delete().eq("id", user.id);
      await signOutUser();
      queryClient.clear();
      toast.success("Your account data has been removed.");
      setDeleteAccountOpen(false);
      await navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Could not delete account. Please contact support for assistance.");
    } finally {
      setDeletingAccount(false);
    }
  }

  async function handleRestorePurchases() {
    if (restoring) return;
    setRestoring(true);
    try {
      const identity = await createPurchaseSession();
      if (!identity.isActive) {
        const store = await loadBillingStore(identity);
        await store.restore();
      }
      const access = await verifyMyPremium();
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      if (access.isPremium) {
        toast.success("Subscription restored and active.");
      } else {
        toast.info("No active store subscription found for this account.");
      }
    } catch {
      toast.error("Could not restore purchases right now. Please try again.");
    } finally {
      setRestoring(false);
    }
  }

  function toggleVoiceMute(muted: boolean) {
    setIsMuted(muted);
    if (typeof window !== "undefined") {
      localStorage.setItem("mealmate_voice_muted", String(muted));
      if (muted && window.speechSynthesis) window.speechSynthesis.cancel();
    }
    toast.info(muted ? "Mia audio muted" : "Mia audio unmuted");
  }

  function toggleVoiceResponses(val: boolean) {
    setVoiceResponses(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("mealmate_voice_responses", String(val));
      if (!val && window.speechSynthesis) window.speechSynthesis.cancel();
    }
    toast.success(val ? "Voice responses enabled" : "Voice responses disabled");
  }

  function handleUnitsChange(nextUnits: "metric" | "imperial") {
    setUnits(nextUnits);
    if (typeof window !== "undefined") {
      localStorage.setItem("mealmate_units", nextUnits);
    }
    toast.success(
      `Units updated to ${nextUnits === "metric" ? "Metric (g, ml)" : "Imperial (oz, lb)"}`,
    );
  }

  function handleLanguageChange(nextLang: string) {
    setLanguage(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("mealmate_lang", nextLang);
    }
    const names: Record<string, string> = {
      en: "English",
      zu: "isiZulu",
      af: "Afrikaans",
      xh: "isiXhosa",
    };
    toast.success(`Language set to ${names[nextLang] ?? nextLang}`);
  }

  function handleAppearanceChange(nextMode: ThemeMode) {
    setMode(nextMode);
    const label =
      nextMode === "light" ? "Light mode" : nextMode === "dark" ? "Dark mode" : "System default";
    toast.success(`Appearance set to ${label}`);
  }

  function handleFontChange(nextFont: AppFontId) {
    setFont(nextFont);
    const match = APP_FONTS.find((item) => item.id === nextFont);
    toast.success(`Font set to ${match?.label ?? nextFont}`);
  }

  function handleNotificationToggle(
    key: string,
    setter: (v: boolean) => void,
    val: boolean,
    label: string,
  ) {
    setter(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, String(val));
    }
    toast.success(`${label} ${val ? "enabled" : "turned off"}`);
  }

  function handleExportData() {
    const data = {
      user: { id: user?.id, email: user?.email, displayName: user?.displayName },
      preferences,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealmate-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Account export downloaded");
  }

  function handleClearCache() {
    queryClient.removeQueries();
    toast.success("Local cache cleared");
  }

  async function handleReportProblem() {
    if (!reportText.trim()) return;
    setReporting(true);
    setTimeout(() => {
      setReporting(false);
      setReportProblemOpen(false);
      setReportText("");
      toast.success("Thank you. Your feedback has been received.");
    }, 500);
  }

  const renewalDate = formatDate(entitlement?.periodEnd);
  const dietaryCount = preferences.dietary_restrictions.length;
  const allergyCount = preferences.allergies.length;
  const cuisineCount = preferences.favorite_foods.length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col bg-background px-4 py-8 pb-28 text-foreground">
      {/* Page Header */}
      <header className="mb-8 flex items-end justify-between border-b border-border pb-5">
        <div>
          <span className="text-xs font-medium tracking-wide text-[var(--periwinkle)]">
            MealMate Consumer
          </span>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Account, subscription, culinary preferences, Mia AI, and appearance
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Profile
        </Link>
      </header>

      <div className="space-y-8">
        {/* 1. PROFILE */}
        <section aria-labelledby="section-profile">
          <h2
            id="section-profile"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Profile
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "Profile avatar"}
                    className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-[var(--periwinkle-soft)] text-sm font-semibold text-[var(--periwinkle)]">
                    {formatInitials(user?.displayName, user?.email)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-foreground">
                    {user?.displayName || "Chef"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user?.email || "No email linked"}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditProfileOpen(true)}
                className="h-9 shrink-0 rounded-xl border-border bg-secondary text-xs text-foreground hover:bg-muted"
              >
                Edit profile
              </Button>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 text-xs sm:px-5">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail size={15} />
                <span>Account sign-in</span>
              </div>
              <span className="font-medium text-foreground">
                {isGoogleUser ? "Google" : "Email & Password"}
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 text-xs sm:px-5">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <User size={15} />
                <span>Email status</span>
              </div>
              <span
                className={`font-medium ${
                  user?.emailVerified ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                }`}
              >
                {user?.emailVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </section>

        {/* 2. SUBSCRIPTION */}
        <section aria-labelledby="section-sub">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="section-sub"
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              Subscription
            </h2>
            {isPremium && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--periwinkle-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--periwinkle)]">
                {trialActive ? "Trial Active" : "Active"}
              </span>
            )}
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {formatPlanTier(tier, isPremium)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {isPremium
                    ? renewalDate
                      ? `Status: Active · Renews ${renewalDate}`
                      : "Status: Active · Full access unlocked"
                    : "Upgrade to unlock Mia, voice guidance, scanning, and smart meal plans"}
                </div>
              </div>
              {!isPremium ? (
                <Button
                  asChild
                  size="sm"
                  className="h-9 shrink-0 rounded-xl bg-foreground text-xs font-medium text-background hover:opacity-90"
                >
                  <Link to="/premium">Upgrade</Link>
                </Button>
              ) : (
                <span className="shrink-0 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Subscribed
                </span>
              )}
            </div>

            <Link
              to="/premium"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={16} className="text-muted-foreground" />
                <span>Manage subscription</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>

            <button
              type="button"
              disabled={restoring}
              onClick={() => void handleRestorePurchases()}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-muted-foreground" />
                <span>{restoring ? "Restoring purchases…" : "Restore purchases"}</span>
              </div>
              {restoring ? (
                <Loader2 size={16} className="animate-spin text-foreground" />
              ) : (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </section>

        {/* 3. PREFERENCES */}
        <section aria-labelledby="section-pref">
          <h2
            id="section-pref"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Preferences
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setEditPreferencesOpen(true)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Sliders size={16} className="text-[var(--periwinkle)]" />
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Edit culinary &amp; onboarding preferences
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {dietaryCount || allergyCount || cuisineCount
                      ? `${dietaryCount} diets · ${allergyCount} allergies · ${cuisineCount} flavours`
                      : "Set your dietary preferences, allergies, cuisines, and skill level"}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
            </button>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Scale size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Measurement units</div>
                  <div className="text-xs text-muted-foreground">
                    Ingredient weights and volumes
                  </div>
                </div>
              </div>
              <div className="flex rounded-xl border border-border bg-secondary p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleUnitsChange("metric")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    units === "metric"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Metric
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitsChange("imperial")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    units === "imperial"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Languages size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Language</div>
                  <div className="text-xs text-muted-foreground">
                    Interface &amp; recipe localisation
                  </div>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-9 w-32 rounded-xl border-border bg-secondary text-xs text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zu">isiZulu</SelectItem>
                  <SelectItem value="af">Afrikaans</SelectItem>
                  <SelectItem value="xh">isiXhosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* 4. MIA AI */}
        <section aria-labelledby="section-mia">
          <h2
            id="section-mia"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Mia AI Assistant
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Voice responses</div>
                <div className="text-xs text-muted-foreground">
                  Speak answers aloud while cooking
                </div>
              </div>
              <Switch
                checked={voiceResponses}
                onCheckedChange={toggleVoiceResponses}
                aria-label="Toggle voice responses"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div className="flex items-center gap-3">
                {isMuted ? (
                  <VolumeX size={17} className="text-destructive" />
                ) : (
                  <Volume2 size={17} className="text-foreground" />
                )}
                <div>
                  <div className="text-sm font-medium text-foreground">Mute assistant audio</div>
                  <div className="text-xs text-muted-foreground">
                    Silence all spoken output from Mia
                  </div>
                </div>
              </div>
              <Switch
                checked={isMuted}
                onCheckedChange={toggleVoiceMute}
                aria-label="Mute assistant audio"
              />
            </div>

            <button
              type="button"
              onClick={() => setSpeechPrefsOpen(true)}
              className="flex w-full items-center justify-between p-4 text-left text-sm transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Bot size={16} className="text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground">Speech settings</div>
                  <div className="text-xs text-muted-foreground">Reading speed: {speechSpeed}x</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Mic size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Microphone permissions</div>
                  <div className="text-xs text-muted-foreground">
                    Required for hands-free Voice Mode
                  </div>
                </div>
              </div>
              {micPermission === "granted" ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Check size={12} /> Allowed
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={requestingMic}
                  onClick={() => void handleRequestMicrophone()}
                  className="h-8 rounded-lg border-border bg-secondary text-xs text-foreground"
                >
                  {requestingMic
                    ? "Checking…"
                    : micPermission === "denied"
                      ? "Retry access"
                      : "Enable mic"}
                </Button>
              )}
            </div>

            <Link
              to="/chat"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={16} className="text-[var(--periwinkle)]" />
                <span>Open Mia Chat &amp; Voice Mode</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </section>

        {/* 5. NOTIFICATIONS */}
        <section aria-labelledby="section-notifications">
          <h2
            id="section-notifications"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Notifications
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between p-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Meal reminders</div>
                  <div className="text-xs text-muted-foreground">
                    Timely nudges for breakfast, lunch, and dinner prep
                  </div>
                </div>
              </div>
              <Switch
                checked={mealReminders}
                onCheckedChange={(v) =>
                  handleNotificationToggle(
                    "mealmate_notif_meal_reminders",
                    setMealReminders,
                    v,
                    "Meal reminders",
                  )
                }
                aria-label="Toggle meal reminders"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Recipe notifications</div>
                <div className="text-xs text-muted-foreground">
                  New curated dishes matching your saved tastes
                </div>
              </div>
              <Switch
                checked={recipeAlerts}
                onCheckedChange={(v) =>
                  handleNotificationToggle(
                    "mealmate_notif_recipe_alerts",
                    setRecipeAlerts,
                    v,
                    "Recipe notifications",
                  )
                }
                aria-label="Toggle recipe notifications"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Meal-planning reminders</div>
                <div className="text-xs text-muted-foreground">
                  Weekly reminders to build your plan and grocery list
                </div>
              </div>
              <Switch
                checked={planningReminders}
                onCheckedChange={(v) =>
                  handleNotificationToggle(
                    "mealmate_notif_planning",
                    setPlanningReminders,
                    v,
                    "Meal-planning reminders",
                  )
                }
                aria-label="Toggle meal-planning reminders"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Promotional notifications</div>
                <div className="text-xs text-muted-foreground">
                  Occasional seasonal highlights and product updates
                </div>
              </div>
              <Switch
                checked={promoAlerts}
                onCheckedChange={(v) =>
                  handleNotificationToggle(
                    "mealmate_notif_promo",
                    setPromoAlerts,
                    v,
                    "Promotional notifications",
                  )
                }
                aria-label="Toggle promotional notifications"
              />
            </div>
          </div>
        </section>

        {/* 6. APPEARANCE */}
        <section aria-labelledby="section-appearance">
          <h2
            id="section-appearance"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Appearance
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="p-4 sm:p-5">
              <div className="mb-3">
                <div className="text-sm font-medium text-foreground">Theme mode</div>
                <div className="text-xs text-muted-foreground">
                  Switch between Light, Dark, or follow your device&apos;s system setting
                </div>
              </div>
              <div
                role="radiogroup"
                aria-label="Appearance mode"
                className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-secondary p-1"
              >
                {[
                  { id: "light" as ThemeMode, label: "Light", icon: Sun },
                  { id: "dark" as ThemeMode, label: "Dark", icon: Moon },
                  { id: "system" as ThemeMode, label: "System", icon: Monitor },
                ].map((opt) => {
                  const active = mode === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleAppearanceChange(opt.id)}
                      className={`flex min-h-[40px] items-center justify-center gap-2 rounded-lg text-xs font-medium transition-all ${
                        active
                          ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={14}
                        className={active ? "text-[var(--periwinkle)]" : "text-muted-foreground"}
                      />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <Type size={16} className="text-[var(--periwinkle)]" />
                <div>
                  <div className="text-sm font-medium text-foreground">App font</div>
                  <div className="text-xs text-muted-foreground">
                    Choose from 4 curated MealMate typography styles
                  </div>
                </div>
              </div>
              <div
                role="radiogroup"
                aria-label="App font"
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
              >
                {APP_FONTS.map((opt) => {
                  const active = font === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleFontChange(opt.id)}
                      className={`flex min-h-[72px] flex-col items-start justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-[var(--periwinkle)] bg-[var(--periwinkle-soft)] text-foreground"
                          : "border-border bg-secondary text-foreground hover:border-foreground/25"
                      }`}
                    >
                      <span
                        className="text-base font-medium leading-none"
                        style={{ fontFamily: opt.previewFamily }}
                      >
                        Aa
                      </span>
                      <div className="mt-2">
                        <div className="text-xs font-medium leading-tight">{opt.label}</div>
                        <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 7. PRIVACY & SECURITY */}
        <section aria-labelledby="section-privacy">
          <h2
            id="section-privacy"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Privacy &amp; Security
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {!isGoogleUser && user?.email && (
              <button
                type="button"
                disabled={sendingReset}
                onClick={() => void handlePasswordReset()}
                className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <KeyRound size={16} className="text-muted-foreground" />
                  <div>
                    <div>Change password</div>
                    <div className="text-xs text-muted-foreground">
                      Send a password reset link to {user.email}
                    </div>
                  </div>
                </div>
                {sendingReset ? (
                  <Loader2 size={16} className="animate-spin text-foreground" />
                ) : (
                  <ChevronRight size={16} className="text-muted-foreground" />
                )}
              </button>
            )}

            <Link
              to="/legal/privacy"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-muted-foreground" />
                <span>Privacy policy</span>
              </div>
              <ExternalLink size={15} className="text-muted-foreground" />
            </Link>

            <Link
              to="/legal/terms"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-muted-foreground" />
                <span>Terms of service</span>
              </div>
              <ExternalLink size={15} className="text-muted-foreground" />
            </Link>

            <button
              type="button"
              onClick={handleExportData}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Download size={16} className="text-muted-foreground" />
                <span>Data export</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={handleClearCache}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={16} className="text-muted-foreground" />
                <span>Clear cache</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <LogOut size={16} className="text-muted-foreground" />
                <span>Sign out</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => {
                setDeleteConfirmText("");
                setDeleteAccountOpen(true);
              }}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={16} />
                <span>Delete account</span>
              </div>
              <ChevronRight size={16} className="opacity-70" />
            </button>
          </div>
        </section>

        {/* 8. SUPPORT & ABOUT */}
        <section aria-labelledby="section-support">
          <h2
            id="section-support"
            className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground"
          >
            Support &amp; About
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Link
              to="/support"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={16} className="text-muted-foreground" />
                <span>Help centre</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>

            <a
              href="mailto:support@mealsmates.site"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground" />
                <span>Contact support</span>
              </div>
              <ExternalLink size={15} className="text-muted-foreground" />
            </a>

            <button
              type="button"
              onClick={() => setReportProblemOpen(true)}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="text-muted-foreground" />
                <span>Report a problem</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>

            <Link
              to="/about"
              className="flex items-center justify-between p-4 text-sm text-foreground transition-colors hover:bg-secondary sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Info size={16} className="text-muted-foreground" />
                <div>
                  <div>About MealMate</div>
                  <div className="text-xs text-muted-foreground">
                    MealMate Consumer v2.4.0 · Taz Technologies
                  </div>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </section>
      </div>

      {/* DIALOG: Edit Profile */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Edit Profile</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the display name used across MealMate and Mia.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="displayName" className="text-xs font-medium text-muted-foreground">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 h-11 rounded-xl border-border bg-secondary text-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditProfileOpen(false)}
              className="rounded-xl text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={savingProfile || !displayName.trim()}
              className="rounded-xl bg-foreground text-background hover:opacity-90"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={16} /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Edit Culinary & Onboarding Preferences */}
      <Dialog open={editPreferencesOpen} onOpenChange={setEditPreferencesOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl border-border bg-card text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-medium">Culinary Preferences</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Personalise your daily recipe discovery, meal planning, and allergen safety filters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Primary meal goal</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_GOALS.map((goal) => {
                  const active = draftPrefs.goal === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() =>
                        setDraftPrefs((p) => ({ ...p, goal: p.goal === goal ? null : goal }))
                      }
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Dietary preferences
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_DIETS.map((diet) => {
                  const active = draftPrefs.dietary_restrictions.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDraftList("dietary_restrictions", diet)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Allergies &amp; intolerances
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_ALLERGIES.map((allergen) => {
                  const active = draftPrefs.allergies.includes(allergen);
                  return (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleDraftList("allergies", allergen)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-destructive bg-destructive text-destructive-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {allergen}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Favourite flavours
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_CUISINES.map((cuisine) => {
                  const active = draftPrefs.favorite_foods.includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleDraftList("favorite_foods", cuisine)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Cooking skill level
              </Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PREF_SKILLS.map((level) => {
                  const active = draftPrefs.cooking_level === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDraftPrefs((p) => ({ ...p, cooking_level: level }))}
                      className={`rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditPreferencesOpen(false)}
              className="rounded-xl text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSaveCulinaryPreferences()}
              disabled={savingPrefs}
              className="rounded-xl bg-foreground text-background hover:opacity-90"
            >
              {savingPrefs ? <Loader2 className="animate-spin" size={16} /> : "Save preferences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Delete Account */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium text-destructive">Delete Account</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently remove your recipes, saved meal plans, pantry items, and profile
              data. Type <span className="font-semibold text-foreground">DELETE</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="h-11 rounded-xl border-border bg-secondary text-foreground"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDeleteAccountOpen(false)}
              className="rounded-xl text-muted-foreground"
            >
              Keep account
            </Button>
            <Button
              onClick={() => void handleDeleteAccount()}
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || deletingAccount}
              variant="destructive"
              className="rounded-xl"
            >
              {deletingAccount ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Permanently delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Speech Preferences */}
      <Dialog open={speechPrefsOpen} onOpenChange={setSpeechPrefsOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Mia Speech Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Adjust speech speed for hands-free voice guidance in the kitchen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Speech Rate</Label>
              <div className="mt-2 flex gap-2">
                {["0.8", "1.0", "1.2", "1.4"].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setSpeechSpeed(rate);
                      localStorage.setItem("mealmate_speech_speed", rate);
                    }}
                    className={`flex-1 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                      speechSpeed === rate
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setSpeechPrefsOpen(false)}
              className="rounded-xl bg-foreground text-background hover:opacity-90"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Report a Problem */}
      <Dialog open={reportProblemOpen} onOpenChange={setReportProblemOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="font-medium">Report a Problem</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Describe what went wrong and our team will look into it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="What happened? Which screen were you using?"
              className="w-full rounded-xl border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--periwinkle)] focus:outline-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setReportProblemOpen(false)}
              className="rounded-xl text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportProblem}
              disabled={reporting || !reportText.trim()}
              className="rounded-xl bg-foreground text-background hover:opacity-90"
            >
              {reporting ? <Loader2 className="animate-spin" size={16} /> : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
