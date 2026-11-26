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
  Scale,
  Shield,
  Sliders,
  Tag,
  Trash2,
  Type,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { useSession, signOutUnified } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/components/theme-provider";
import { ThemeGallery } from "@/components/theme-gallery";
import { APP_FONTS, type AppFontId } from "@/lib/app-fonts";
import { createPurchaseSession, verifyMyPremium } from "@/lib/billing.functions";
import { redeemPromoCode } from "@/lib/premium.functions";
import { loadBillingStore } from "@/lib/billing-client";
import { useCurrency } from "@/lib/currency";
import { deleteUser } from "firebase/auth";
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db, sendPasswordReset as sendFirebasePasswordReset } from "@/lib/firebase";
import { firebaseData } from "@/lib/firebase-data";
import {
  deleteMyAccount,
  getMyAppSettings,
  saveMyAppSettings,
  type AppSettingsPayload,
} from "@/lib/preferences.functions";
import { saveUserProfile } from "@/lib/profile-avatar";
import { ProfileAvatarUploader } from "@/components/profile-avatar-uploader";
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
import { FEEDBACK_CATEGORIES, type FeedbackCategory } from "@/lib/feedback";
import { submitFeedbackReport } from "@/lib/feedback.functions";
import { IDENTITY_HABITS } from "@/lib/psychology";
import { hasAnalyticsConsent, setAnalyticsConsentLocal } from "@/lib/analytics-events";
import type { NotificationFrequency } from "@/lib/notifications.types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | MealMate" },
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
const PREF_INTOLERANCES = ["Lactose", "Gluten", "Fructose", "Histamine", "Sulfites"];
const PREF_LIFESTYLES = [
  "Home cook",
  "Busy weeknights",
  "Meal prepper",
  "Family cooking",
  "Fitness focused",
];
const PREF_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks", "Dessert"];
const PREF_BUDGETS = ["Budget friendly", "Moderate", "Flexible"];
const PREF_COOK_TIMES = ["Under 20 mins", "20 to 35 mins", "35 to 50 mins", "No rush"];
const PREF_HOUSEHOLD = ["1 person", "2 people", "3 to 4 people (family)", "5+ people"];

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
  const normalized = tier.toLowerCase();
  if (normalized.includes("family")) return "MealMate Family";
  if (normalized.includes("year") || normalized.includes("annual")) return "MealMate Yearly";
  if (normalized.includes("month")) return "MealMate Monthly";
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

function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, firebaseUser } = useSession();
  const { currency } = useCurrency();
  const { isPremium, tier, trialActive, entitlement } = usePremium();
  const { preferences, save: savePreferences } = usePreferences();
  const { font, setFont } = useTheme();

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPreferencesOpen, setEditPreferencesOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [reportProblemOpen, setReportProblemOpen] = useState(false);
  const [speechPrefsOpen, setSpeechPrefsOpen] = useState(false);

  // Profile & account form state
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Billing & promo state
  const [restoring, setRestoring] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [redeemingPromo, setRedeemingPromo] = useState(false);

  // Report state
  const [reportCategory, setReportCategory] = useState<FeedbackCategory>("Bug");
  const [reportText, setReportText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [dislikedDraft, setDislikedDraft] = useState("");

  // Mia speech & mic permission state
  const [voiceResponses, setVoiceResponses] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState("1.0");
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "prompt" | "unknown">(
    "unknown",
  );
  const [requestingMic, setRequestingMic] = useState(false);

  // Notification & privacy toggles
  const [mealReminders, setMealReminders] = useState(true);
  const [recipeAlerts, setRecipeAlerts] = useState(true);
  const [planningReminders, setPlanningReminders] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);
  const [pantryExpiryReminders, setPantryExpiryReminders] = useState(true);
  const [weeklyInspiration, setWeeklyInspiration] = useState(true);
  const [mealPlanSummaries, setMealPlanSummaries] = useState(true);
  const [challengeReminders, setChallengeReminders] = useState(false);
  const [notifFrequency, setNotifFrequency] = useState<NotificationFrequency>("weekly");
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [exportingData, setExportingData] = useState(false);

  // App localization
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [language, setLanguage] = useState("en");

  // Culinary preferences modal draft state
  const [draftPrefs, setDraftPrefs] = useState<FoodPreferences>(preferences);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const isGoogleUser = Boolean(
    firebaseUser?.providerData?.some((p) => p.providerId === "google.com"),
  );

  const readSettingStorage = (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writeSettingStorage = (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage may be restricted in in-app WebViews
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    setVoiceResponses(readSettingStorage("mealmate_voice_responses") !== "false");
    setIsMuted(readSettingStorage("mealmate_voice_muted") === "true");
    setSpeechSpeed(readSettingStorage("mealmate_speech_speed") ?? "1.0");
    setUnits((readSettingStorage("mealmate_units") as "metric" | "imperial") ?? "metric");
    setLanguage(readSettingStorage("mealmate-lang") ?? readSettingStorage("mealmate_lang") ?? "en");

    setMealReminders(readSettingStorage("mealmate_notif_meal_reminders") !== "false");
    setRecipeAlerts(readSettingStorage("mealmate_notif_recipe_alerts") !== "false");
    setPlanningReminders(readSettingStorage("mealmate_notif_planning") !== "false");
    setPromoAlerts(readSettingStorage("mealmate_notif_promo") === "true");
    setPantryExpiryReminders(readSettingStorage("mealmate_notif_pantry_expiry") !== "false");
    setWeeklyInspiration(readSettingStorage("mealmate_notif_weekly_insp") !== "false");
    setMealPlanSummaries(readSettingStorage("mealmate_notif_plan_summaries") !== "false");
    setChallengeReminders(readSettingStorage("mealmate_notif_challenges") === "true");
    const storedFreq = readSettingStorage("mealmate_notif_frequency");
    if (storedFreq === "daily" || storedFreq === "weekly" || storedFreq === "essential_only") {
      setNotifFrequency(storedFreq);
    }
    setAnalyticsConsent(hasAnalyticsConsent());

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
    const uid = user?.id;
    if (!uid) return;
    let cancelled = false;

    async function loadRemoteSettings(targetUid: string) {
      try {
        const remote = await getMyAppSettings();
        if (cancelled || !remote) return;
        applyHydratedSettings(remote);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        if (/Firebase Admin is not configured/i.test(msg) && auth.currentUser?.uid === targetUid) {
          try {
            const [userSnap, notifSnap] = await Promise.all([
              getDoc(doc(db, "users", targetUid)),
              getDoc(doc(db, "users", targetUid, "notification_settings", "preferences")),
            ]);
            if (cancelled) return;
            const userData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
            const notifData = notifSnap.exists()
              ? (notifSnap.data() as Record<string, unknown>)
              : {};
            const storedVoice = (userData["voice_preferences"] as Record<string, unknown>) ?? {};
            const storedNotif =
              (userData["notification_preferences"] as Record<string, unknown>) ?? {};
            applyHydratedSettings({
              units: userData["units"] === "imperial" ? "imperial" : "metric",
              locale: typeof userData["locale"] === "string" ? userData["locale"] : null,
              font: typeof userData["font"] === "string" ? userData["font"] : null,
              voice_preferences: {
                voiceResponses:
                  typeof storedVoice["voiceResponses"] === "boolean"
                    ? storedVoice["voiceResponses"]
                    : true,
                isMuted:
                  typeof storedVoice["isMuted"] === "boolean" ? storedVoice["isMuted"] : false,
                speechSpeed:
                  typeof storedVoice["speechSpeed"] === "string"
                    ? storedVoice["speechSpeed"]
                    : "1.0",
              },
              notification_preferences: {
                mealReminders:
                  typeof notifData["mealReminders"] === "boolean"
                    ? notifData["mealReminders"]
                    : typeof storedNotif["mealReminders"] === "boolean"
                      ? storedNotif["mealReminders"]
                      : true,
                recipeAlerts:
                  typeof notifData["recipeAlerts"] === "boolean"
                    ? notifData["recipeAlerts"]
                    : typeof storedNotif["recipeAlerts"] === "boolean"
                      ? storedNotif["recipeAlerts"]
                      : true,
                planningReminders:
                  typeof notifData["planningReminders"] === "boolean"
                    ? notifData["planningReminders"]
                    : typeof storedNotif["planningReminders"] === "boolean"
                      ? storedNotif["planningReminders"]
                      : true,
                promoAlerts:
                  typeof notifData["promoAlerts"] === "boolean"
                    ? notifData["promoAlerts"]
                    : typeof notifData["productUpdatesEnabled"] === "boolean"
                      ? notifData["productUpdatesEnabled"]
                      : typeof storedNotif["promoAlerts"] === "boolean"
                        ? storedNotif["promoAlerts"]
                        : false,
                pantryExpiryReminders:
                  typeof notifData["pantryExpiryReminders"] === "boolean"
                    ? notifData["pantryExpiryReminders"]
                    : typeof storedNotif["pantryExpiryReminders"] === "boolean"
                      ? storedNotif["pantryExpiryReminders"]
                      : true,
                weeklyInspiration:
                  typeof notifData["weeklyInspiration"] === "boolean"
                    ? notifData["weeklyInspiration"]
                    : typeof storedNotif["weeklyInspiration"] === "boolean"
                      ? storedNotif["weeklyInspiration"]
                      : true,
                mealPlanSummaries:
                  typeof notifData["mealPlanSummaries"] === "boolean"
                    ? notifData["mealPlanSummaries"]
                    : typeof storedNotif["mealPlanSummaries"] === "boolean"
                      ? storedNotif["mealPlanSummaries"]
                      : true,
                challengeReminders:
                  typeof notifData["challengeReminders"] === "boolean"
                    ? notifData["challengeReminders"]
                    : typeof storedNotif["challengeReminders"] === "boolean"
                      ? storedNotif["challengeReminders"]
                      : false,
                frequency:
                  notifData["frequency"] === "daily" ||
                  notifData["frequency"] === "weekly" ||
                  notifData["frequency"] === "essential_only"
                    ? notifData["frequency"]
                    : storedNotif["frequency"] === "daily" ||
                        storedNotif["frequency"] === "weekly" ||
                        storedNotif["frequency"] === "essential_only"
                      ? storedNotif["frequency"]
                      : "weekly",
                analyticsConsent:
                  typeof notifData["analyticsConsent"] === "boolean"
                    ? notifData["analyticsConsent"]
                    : typeof storedNotif["analyticsConsent"] === "boolean"
                      ? storedNotif["analyticsConsent"]
                      : true,
              },
            });
          } catch {
            // Keep local settings if Firestore read fails.
          }
        }
      }
    }

    function applyHydratedSettings(remote: {
      units?: "metric" | "imperial";
      locale?: string | null;
      font?: string | null;
      voice_preferences?: { voiceResponses: boolean; isMuted: boolean; speechSpeed: string };
      notification_preferences?: {
        mealReminders: boolean;
        recipeAlerts: boolean;
        planningReminders: boolean;
        promoAlerts: boolean;
        pantryExpiryReminders?: boolean;
        weeklyInspiration?: boolean;
        mealPlanSummaries?: boolean;
        challengeReminders?: boolean;
        frequency?: NotificationFrequency;
        analyticsConsent?: boolean;
      };
    }) {
      if (remote.units) {
        setUnits(remote.units);
        writeSettingStorage("mealmate_units", remote.units);
      }
      if (remote.locale) {
        setLanguage(remote.locale);
        writeSettingStorage("mealmate-lang", remote.locale);
        writeSettingStorage("mealmate_lang", remote.locale);
        window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: remote.locale }));
      }
      if (remote.voice_preferences) {
        setVoiceResponses(remote.voice_preferences.voiceResponses);
        setIsMuted(remote.voice_preferences.isMuted);
        setSpeechSpeed(remote.voice_preferences.speechSpeed);
        writeSettingStorage(
          "mealmate_voice_responses",
          String(remote.voice_preferences.voiceResponses),
        );
        writeSettingStorage("mealmate_voice_muted", String(remote.voice_preferences.isMuted));
        writeSettingStorage("mealmate_speech_speed", remote.voice_preferences.speechSpeed);
      }
      if (remote.notification_preferences) {
        const np = remote.notification_preferences;
        setMealReminders(np.mealReminders);
        setRecipeAlerts(np.recipeAlerts);
        setPlanningReminders(np.planningReminders);
        setPromoAlerts(np.promoAlerts);
        writeSettingStorage("mealmate_notif_meal_reminders", String(np.mealReminders));
        writeSettingStorage("mealmate_notif_recipe_alerts", String(np.recipeAlerts));
        writeSettingStorage("mealmate_notif_planning", String(np.planningReminders));
        writeSettingStorage("mealmate_notif_promo", String(np.promoAlerts));
        if (typeof np.pantryExpiryReminders === "boolean") {
          setPantryExpiryReminders(np.pantryExpiryReminders);
          writeSettingStorage("mealmate_notif_pantry_expiry", String(np.pantryExpiryReminders));
        }
        if (typeof np.weeklyInspiration === "boolean") {
          setWeeklyInspiration(np.weeklyInspiration);
          writeSettingStorage("mealmate_notif_weekly_insp", String(np.weeklyInspiration));
        }
        if (typeof np.mealPlanSummaries === "boolean") {
          setMealPlanSummaries(np.mealPlanSummaries);
          writeSettingStorage("mealmate_notif_plan_summaries", String(np.mealPlanSummaries));
        }
        if (typeof np.challengeReminders === "boolean") {
          setChallengeReminders(np.challengeReminders);
          writeSettingStorage("mealmate_notif_challenges", String(np.challengeReminders));
        }
        if (np.frequency) {
          setNotifFrequency(np.frequency);
          writeSettingStorage("mealmate_notif_frequency", np.frequency);
        }
        if (typeof np.analyticsConsent === "boolean") {
          setAnalyticsConsent(np.analyticsConsent);
          setAnalyticsConsentLocal(np.analyticsConsent);
        }
      }
    }

    void loadRemoteSettings(uid);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  async function persistAppSettings(patch: AppSettingsPayload): Promise<boolean> {
    if (!user?.id) return true;
    try {
      await saveMyAppSettings({ data: patch });
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
      await queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      if (/Firebase Admin is not configured/i.test(msg) && auth.currentUser?.uid === user.id) {
        try {
          const nowIso = new Date().toISOString();
          const userPatch: Record<string, unknown> = {
            id: user.id,
            updatedAt: nowIso,
            updated_at: nowIso,
          };
          if (patch.units !== undefined) userPatch["units"] = patch.units;
          if (patch.locale !== undefined) userPatch["locale"] = patch.locale;
          if (patch.font !== undefined) userPatch["font"] = patch.font;
          if (patch.voice_preferences !== undefined) {
            userPatch["voice_preferences"] = patch.voice_preferences;
          }
          if (patch.notification_preferences !== undefined) {
            userPatch["notification_preferences"] = patch.notification_preferences;
          }
          const writes: Promise<unknown>[] = [
            setDoc(doc(db, "users", user.id), userPatch, { merge: true }),
          ];
          if (patch.notification_preferences) {
            const np = patch.notification_preferences;
            writes.push(
              setDoc(
                doc(db, "users", user.id, "notification_settings", "preferences"),
                {
                  mealReminders: np.mealReminders,
                  recipeAlerts: np.recipeAlerts,
                  planningReminders: np.planningReminders,
                  promoAlerts: np.promoAlerts,
                  productUpdatesEnabled: np.promoAlerts,
                  ...(typeof np.pantryExpiryReminders === "boolean"
                    ? { pantryExpiryReminders: np.pantryExpiryReminders }
                    : {}),
                  ...(typeof np.weeklyInspiration === "boolean"
                    ? { weeklyInspiration: np.weeklyInspiration }
                    : {}),
                  ...(typeof np.mealPlanSummaries === "boolean"
                    ? { mealPlanSummaries: np.mealPlanSummaries }
                    : {}),
                  ...(typeof np.challengeReminders === "boolean"
                    ? { challengeReminders: np.challengeReminders }
                    : {}),
                  ...(np.frequency ? { frequency: np.frequency } : {}),
                  ...(typeof np.analyticsConsent === "boolean"
                    ? { analyticsConsent: np.analyticsConsent }
                    : {}),
                  updatedAt: nowIso,
                },
                { merge: true },
              ),
            );
          }
          await Promise.all(writes);
          await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
          await queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
    setPhotoURL(user?.photoURL ?? "");
  }, [user, editProfileOpen]);

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
      await saveUserProfile({
        userId: user.id,
        displayName: trimmed,
        photoURL: photoURL.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      toast.success("Profile updated");
      setEditProfileOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update profile. Please try again.",
      );
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
    field:
      | "dietary_restrictions"
      | "allergies"
      | "intolerances"
      | "favorite_foods"
      | "preferred_cuisines"
      | "lifestyles"
      | "preferred_meal_types",
    value: string,
  ) {
    setDraftPrefs((prev) => {
      const current = prev[field] ?? [];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  }

  function addDislikedIngredient() {
    const clean = dislikedDraft.trim();
    if (!clean) return;
    setDraftPrefs((prev) => ({
      ...prev,
      disliked_foods: prev.disliked_foods.includes(clean)
        ? prev.disliked_foods
        : [...prev.disliked_foods, clean],
    }));
    setDislikedDraft("");
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
      await queryClient.cancelQueries();
      queryClient.clear();
      await signOutUnified();
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
      let deletedOnServer = false;
      try {
        await deleteMyAccount();
        deletedOnServer = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        if (!/Firebase Admin is not configured/i.test(msg)) {
          throw err;
        }
      }

      if (!deletedOnServer) {
        const subcollections = [
          "favorites",
          "grocery",
          "pantry",
          "mealPlans",
          "nutritionLogs",
          "conversations",
          "plannerTemplates",
          "collections",
          "weeklyGoals",
          "notifications",
          "notification_settings",
        ];
        if (auth.currentUser?.uid === user.id) {
          await Promise.all(
            subcollections.map(async (sub) => {
              const snap = await getDocs(collection(db, "users", user.id, sub));
              await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
            }),
          );
          await Promise.all([
            deleteDoc(doc(db, "user_onboarding_profiles", user.id)).catch(() => undefined),
            deleteDoc(doc(db, "onboarding_answers", user.id)).catch(() => undefined),
            deleteDoc(doc(db, "onboarding_progress", user.id)).catch(() => undefined),
            deleteDoc(doc(db, "users", user.id)),
          ]);
        } else {
          const tables = [
            "favorites",
            "grocery_items",
            "pantry_items",
            "meal_plans",
            "nutrition_logs",
          ] as const;
          await Promise.all(
            tables.map((table) => firebaseData.from(table).delete().eq("user_id", user.id)),
          );
        }
      }

      if (typeof window !== "undefined") {
        try {
          for (const key of Object.keys(window.localStorage)) {
            if (key.startsWith("mealmate")) {
              window.localStorage.removeItem(key);
            }
          }
        } catch {
          // Storage may be restricted in in-app WebViews
        }
      }

      let requiresReauth = false;
      if (auth.currentUser) {
        try {
          await deleteUser(auth.currentUser);
        } catch (err) {
          const code = (err as { code?: string })?.code;
          if (code === "auth/requires-recent-login") {
            requiresReauth = true;
          } else {
            throw err;
          }
        }
      }
      await signOutUnified().catch(() => undefined);
      queryClient.clear();
      toast.success(
        requiresReauth
          ? "Your MealMate data was deleted. Sign back in once more to remove your login credential."
          : "Your account and personal data have been deleted.",
      );
      setDeleteAccountOpen(false);
      await navigate({ to: "/auth", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Could not delete account. Please contact support for assistance.",
      );
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
        const store = await loadBillingStore(identity, currency);
        await store.restore();
      }
      const access = await verifyMyPremium();
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
      }
      if (access.isPremium) {
        toast.success("Subscription restored and active.");
      } else {
        toast.info("No active store subscription found for this account.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error && /configured|available|REVENUECAT/i.test(error.message)
          ? error.message
          : "Could not restore purchases right now. Please try again.",
      );
    } finally {
      setRestoring(false);
    }
  }

  async function handleRedeemPromo(e: React.FormEvent) {
    e.preventDefault();
    const normalized = promoCode.trim().toUpperCase();
    if (!normalized || redeemingPromo) return;
    if (!user?.id) {
      toast.error("Sign in to redeem a promo code.");
      return;
    }
    setRedeemingPromo(true);
    try {
      const result = await redeemPromoCode({ data: { code: normalized } });
      if (result.kind === "percent_discount" && result.percentOff) {
        toast.success(`${result.percentOff}% discount ready — choose a plan to check out.`);
        setPromoCode("");
        setPromoOpen(false);
        await navigate({ to: "/premium", search: { promo: result.code } });
        return;
      }
      await verifyMyPremium().catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
      await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
      toast.success(result.message);
      setPromoCode("");
      setPromoOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Could not apply that promo code.",
      );
    } finally {
      setRedeemingPromo(false);
    }
  }

  async function toggleVoiceMute(muted: boolean) {
    const prev = isMuted;
    setIsMuted(muted);
    if (typeof window !== "undefined") {
      writeSettingStorage("mealmate_voice_muted", String(muted));
      if (muted && window.speechSynthesis) window.speechSynthesis.cancel();
    }
    const ok = await persistAppSettings({
      voice_preferences: { voiceResponses, isMuted: muted, speechSpeed },
    });
    if (!ok) {
      setIsMuted(prev);
      writeSettingStorage("mealmate_voice_muted", String(prev));
      toast.error("Couldn't save Mia audio setting to your account.");
      return;
    }
    toast.info(muted ? "Mia audio muted" : "Mia audio unmuted");
  }

  async function toggleVoiceResponses(val: boolean) {
    const prev = voiceResponses;
    setVoiceResponses(val);
    if (typeof window !== "undefined") {
      writeSettingStorage("mealmate_voice_responses", String(val));
      if (!val && window.speechSynthesis) window.speechSynthesis.cancel();
    }
    const ok = await persistAppSettings({
      voice_preferences: { voiceResponses: val, isMuted, speechSpeed },
    });
    if (!ok) {
      setVoiceResponses(prev);
      writeSettingStorage("mealmate_voice_responses", String(prev));
      toast.error("Couldn't save voice response setting to your account.");
      return;
    }
    toast.success(val ? "Voice responses enabled" : "Voice responses disabled");
  }

  async function handleSpeechSpeedChange(rate: string) {
    const prev = speechSpeed;
    setSpeechSpeed(rate);
    if (typeof window !== "undefined") {
      writeSettingStorage("mealmate_speech_speed", rate);
    }
    const ok = await persistAppSettings({
      voice_preferences: { voiceResponses, isMuted, speechSpeed: rate },
    });
    if (!ok) {
      setSpeechSpeed(prev);
      writeSettingStorage("mealmate_speech_speed", prev);
      toast.error("Couldn't save speech speed to your account.");
    }
  }

  async function handleUnitsChange(nextUnits: "metric" | "imperial") {
    const prev = units;
    setUnits(nextUnits);
    if (typeof window !== "undefined") {
      writeSettingStorage("mealmate_units", nextUnits);
    }
    const ok = await persistAppSettings({ units: nextUnits });
    if (!ok) {
      setUnits(prev);
      writeSettingStorage("mealmate_units", prev);
      toast.error("Couldn't save unit preference to your account.");
      return;
    }
    toast.success(
      `Units updated to ${nextUnits === "metric" ? "Metric (g, ml)" : "Imperial (oz, lb)"}`,
    );
  }

  async function handleLanguageChange(nextLang: string) {
    const prev = language;
    setLanguage(nextLang);
    if (typeof window !== "undefined") {
      writeSettingStorage("mealmate-lang", nextLang);
      writeSettingStorage("mealmate_lang", nextLang);
      window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: nextLang }));
    }
    const ok = await persistAppSettings({ locale: nextLang });
    if (!ok) {
      setLanguage(prev);
      writeSettingStorage("mealmate-lang", prev);
      writeSettingStorage("mealmate_lang", prev);
      window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: prev }));
      toast.error("Couldn't save language preference to your account.");
      return;
    }
    const names: Record<string, string> = {
      en: "English",
      zu: "isiZulu",
      af: "Afrikaans",
      xh: "isiXhosa",
    };
    toast.success(`Language set to ${names[nextLang] ?? nextLang}`);
  }

  function handleFontChange(nextFont: AppFontId) {
    setFont(nextFont);
    const match = APP_FONTS.find((item) => item.id === nextFont);
    toast.success(`Font set to ${match?.label ?? nextFont}`);
  }

  function buildNotificationPreferencesPayload(
    overrides?: Partial<{
      mealReminders: boolean;
      recipeAlerts: boolean;
      planningReminders: boolean;
      promoAlerts: boolean;
      pantryExpiryReminders: boolean;
      weeklyInspiration: boolean;
      mealPlanSummaries: boolean;
      challengeReminders: boolean;
      frequency: NotificationFrequency;
      analyticsConsent: boolean;
    }>,
  ) {
    return {
      mealReminders,
      recipeAlerts,
      planningReminders,
      promoAlerts,
      pantryExpiryReminders,
      weeklyInspiration,
      mealPlanSummaries,
      challengeReminders,
      frequency: notifFrequency,
      analyticsConsent,
      ...overrides,
    };
  }

  async function handleNotificationToggle(
    field:
      | "mealReminders"
      | "recipeAlerts"
      | "planningReminders"
      | "promoAlerts"
      | "pantryExpiryReminders"
      | "weeklyInspiration"
      | "mealPlanSummaries"
      | "challengeReminders",
    storageKey: string,
    setter: (v: boolean) => void,
    currentVal: boolean,
    val: boolean,
    label: string,
  ) {
    setter(val);
    if (typeof window !== "undefined") {
      writeSettingStorage(storageKey, String(val));
    }
    const nextPrefs = buildNotificationPreferencesPayload({ [field]: val });
    const ok = await persistAppSettings({ notification_preferences: nextPrefs });
    if (!ok) {
      setter(currentVal);
      if (typeof window !== "undefined") {
        writeSettingStorage(storageKey, String(currentVal));
      }
      toast.error(`Couldn't save ${label.toLowerCase()} to your account.`);
      return;
    }
    toast.success(`${label} ${val ? "enabled" : "turned off"}`);
  }

  async function handleNotificationFrequencyChange(nextFreq: NotificationFrequency) {
    const prev = notifFrequency;
    setNotifFrequency(nextFreq);
    writeSettingStorage("mealmate_notif_frequency", nextFreq);
    const nextPrefs = buildNotificationPreferencesPayload({ frequency: nextFreq });
    const ok = await persistAppSettings({ notification_preferences: nextPrefs });
    if (!ok) {
      setNotifFrequency(prev);
      writeSettingStorage("mealmate_notif_frequency", prev);
      toast.error("Couldn't save notification frequency.");
      return;
    }
    const labels: Record<NotificationFrequency, string> = {
      daily: "Daily reminders",
      weekly: "Weekly rhythm",
      essential_only: "Essential only",
    };
    toast.success(`Notification rhythm set to ${labels[nextFreq]}`);
  }

  async function handleAnalyticsConsentToggle(val: boolean) {
    const prev = analyticsConsent;
    setAnalyticsConsent(val);
    setAnalyticsConsentLocal(val);
    const nextPrefs = buildNotificationPreferencesPayload({ analyticsConsent: val });
    const ok = await persistAppSettings({ notification_preferences: nextPrefs });
    if (!ok) {
      setAnalyticsConsent(prev);
      setAnalyticsConsentLocal(prev);
      toast.error("Couldn't update analytics consent preference.");
      return;
    }
    toast.success(
      val
        ? "Privacy-conscious product analytics enabled"
        : "Product analytics paused for your account",
    );
  }

  async function handleExportData() {
    if (exportingData) return;
    setExportingData(true);
    try {
      const readSubcollection = async (sub: string) => {
        if (!user?.id || auth.currentUser?.uid !== user.id) return [];
        try {
          const snap = await getDocs(collection(db, "users", user.id, sub));
          return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          return [];
        }
      };

      const [favorites, pantry, mealPlans, collections, weeklyGoals] = await Promise.all([
        readSubcollection("favorites"),
        readSubcollection("pantry"),
        readSubcollection("mealPlans"),
        readSubcollection("collections"),
        readSubcollection("weeklyGoals"),
      ]);

      const data = {
        user: { id: user?.id, email: user?.email, displayName: user?.displayName },
        preferences,
        notificationPreferences: buildNotificationPreferencesPayload(),
        favorites,
        pantry,
        mealPlans,
        collections,
        weeklyGoals,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mealmate-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Complete kitchen data export downloaded");
    } finally {
      setExportingData(false);
    }
  }

  function handleClearCache() {
    queryClient.removeQueries();
    toast.success("Local cache cleared");
  }

  async function handleReportProblem() {
    const clean = reportText.trim();
    if (clean.length < 5) {
      toast.error("Please include a short description (at least 5 characters).");
      return;
    }
    setReporting(true);
    try {
      const report = await submitFeedbackReport({
        data: {
          category: reportCategory,
          title: `${reportCategory}: ${clean.slice(0, 80)}`,
          description: clean,
          routeContext: "/settings",
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["feedback-reports"] });
      setReportProblemOpen(false);
      setReportText("");
      toast.success(`Report logged (${report.reference_id})`, {
        description: "Track status anytime in Help Centre.",
        action: { label: "View", onClick: () => navigate({ to: "/support" }) },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit your report right now.");
    } finally {
      setReporting(false);
    }
  }

  const renewalDate = formatDate(entitlement?.periodEnd);
  const dietaryCount = preferences.dietary_restrictions.length;
  const allergyCount = preferences.allergies.length;
  const cuisineCount = preferences.favorite_foods.length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-x-hidden bg-background px-3.5 py-6 pb-28 text-foreground sm:px-4 sm:py-8">
      {/* Page Header */}
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4 sm:mb-8 sm:pb-5">
        <div className="min-w-0 flex-1">
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
          className="inline-flex h-10 shrink-0 items-center rounded-xl border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Profile
        </Link>
      </header>

      <div className="space-y-7 sm:space-y-8">
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
                {user?.provider === "whop"
                  ? "Whop Account"
                  : isGoogleUser
                    ? "Google"
                    : "Email & Password"}
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
              search={{ manage: "1" }}
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

            <div className="p-4 sm:px-5">
              <button
                type="button"
                onClick={() => setPromoOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left text-sm text-foreground"
              >
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-[var(--periwinkle)]" />
                  <span>Redeem promo code</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-muted-foreground transition-transform ${
                    promoOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {promoOpen && (
                <form
                  onSubmit={(e) => void handleRedeemPromo(e)}
                  className="mt-3 flex flex-col gap-2 sm:flex-row"
                >
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    aria-label="Promo code"
                    maxLength={40}
                    disabled={redeemingPromo}
                    className="h-10 rounded-xl border-border bg-secondary uppercase tracking-wide"
                  />
                  <Button
                    type="submit"
                    disabled={redeemingPromo || promoCode.trim().length < 2}
                    className="h-10 shrink-0 rounded-xl px-4 text-xs font-medium"
                  >
                    {redeemingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </form>
              )}
            </div>
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

            <div className="flex items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Scale size={16} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">Measurement units</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Ingredient weights and volumes
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 rounded-xl border border-border bg-secondary p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleUnitsChange("metric")}
                  className={`min-h-8 rounded-lg px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
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
                  className={`min-h-8 rounded-lg px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
                    units === "imperial"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Imperial
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Languages size={16} className="shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">Language</div>
                  <div className="truncate text-xs text-muted-foreground">
                    Interface &amp; recipe localisation
                  </div>
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-9 w-28 shrink-0 rounded-xl border-border bg-secondary text-xs text-foreground sm:w-32">
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
            <div className="p-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">Delivery rhythm</div>
                  <div className="text-xs text-muted-foreground">
                    Choose how often MealMate sends gentle kitchen reminders
                  </div>
                </div>
                <div className="flex shrink-0 rounded-xl border border-border bg-secondary p-0.5 text-xs">
                  {(
                    [
                      { id: "daily", label: "Daily" },
                      { id: "weekly", label: "Weekly" },
                      { id: "essential_only", label: "Essential" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => void handleNotificationFrequencyChange(opt.id)}
                      className={`min-h-8 rounded-lg px-2.5 py-1.5 font-medium transition-colors ${
                        notifFrequency === opt.id
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div className="flex items-center gap-3">
                <Bell size={16} className="text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium text-foreground">Planned meal reminders</div>
                  <div className="text-xs text-muted-foreground">
                    Gentle prompts for dishes you scheduled on your weekly plan
                  </div>
                </div>
              </div>
              <Switch
                checked={mealReminders}
                onCheckedChange={(v) =>
                  void handleNotificationToggle(
                    "mealReminders",
                    "mealmate_notif_meal_reminders",
                    setMealReminders,
                    mealReminders,
                    v,
                    "Planned meal reminders",
                  )
                }
                aria-label="Toggle meal reminders"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Pantry expiry reminders</div>
                <div className="text-xs text-muted-foreground">
                  Helpful alerts when pantry ingredients should be cooked soon
                </div>
              </div>
              <Switch
                checked={pantryExpiryReminders}
                onCheckedChange={(v) =>
                  void handleNotificationToggle(
                    "pantryExpiryReminders",
                    "mealmate_notif_pantry_expiry",
                    setPantryExpiryReminders,
                    pantryExpiryReminders,
                    v,
                    "Pantry expiry reminders",
                  )
                }
                aria-label="Toggle pantry expiry reminders"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Weekly cooking inspiration
                </div>
                <div className="text-xs text-muted-foreground">
                  Fresh seasonal collections and dishes tuned to your kitchen
                </div>
              </div>
              <Switch
                checked={weeklyInspiration}
                onCheckedChange={(v) =>
                  void handleNotificationToggle(
                    "weeklyInspiration",
                    "mealmate_notif_weekly_insp",
                    setWeeklyInspiration,
                    weeklyInspiration,
                    v,
                    "Weekly cooking inspiration",
                  )
                }
                aria-label="Toggle weekly cooking inspiration"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">Meal-plan summaries</div>
                <div className="text-xs text-muted-foreground">
                  End-of-week wrap-ups and fresh start encouragement
                </div>
              </div>
              <Switch
                checked={mealPlanSummaries}
                onCheckedChange={(v) =>
                  void handleNotificationToggle(
                    "mealPlanSummaries",
                    "mealmate_notif_plan_summaries",
                    setMealPlanSummaries,
                    mealPlanSummaries,
                    v,
                    "Meal-plan summaries",
                  )
                }
                aria-label="Toggle meal-plan summaries"
              />
            </div>

            <div className="flex items-center justify-between p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Optional cooking challenges
                </div>
                <div className="text-xs text-muted-foreground">
                  Weekly themed cooking prompts with zero pressure
                </div>
              </div>
              <Switch
                checked={challengeReminders}
                onCheckedChange={(v) =>
                  void handleNotificationToggle(
                    "challengeReminders",
                    "mealmate_notif_challenges",
                    setChallengeReminders,
                    challengeReminders,
                    v,
                    "Cooking challenge reminders",
                  )
                }
                aria-label="Toggle optional cooking challenges"
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
                  void handleNotificationToggle(
                    "recipeAlerts",
                    "mealmate_notif_recipe_alerts",
                    setRecipeAlerts,
                    recipeAlerts,
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
                  void handleNotificationToggle(
                    "planningReminders",
                    "mealmate_notif_planning",
                    setPlanningReminders,
                    planningReminders,
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
                  void handleNotificationToggle(
                    "promoAlerts",
                    "mealmate_notif_promo",
                    setPromoAlerts,
                    promoAlerts,
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
            Appearance &amp; Themes
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <div className="p-3.5 sm:p-5">
              <div className="mb-3.5">
                <div className="text-sm font-medium text-foreground">Theme gallery</div>
                <div className="text-xs text-muted-foreground">
                  Tap any theme to preview it live across MealMate, then tap Apply Theme to save to
                  your account.
                </div>
              </div>
              <ThemeGallery />
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

            <div className="flex items-center justify-between gap-3 p-4 sm:px-5">
              <div>
                <div className="text-sm font-medium text-foreground">
                  Privacy-conscious product analytics
                </div>
                <div className="text-xs text-muted-foreground">
                  Helps improve recipe matching without third-party ad tracking
                </div>
              </div>
              <Switch
                checked={analyticsConsent}
                onCheckedChange={(v) => void handleAnalyticsConsentToggle(v)}
                aria-label="Toggle privacy-conscious product analytics"
              />
            </div>

            <button
              type="button"
              disabled={exportingData}
              onClick={() => void handleExportData()}
              className="flex w-full items-center justify-between p-4 text-left text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60 sm:px-5"
            >
              <div className="flex items-center gap-3">
                <Download size={16} className="text-muted-foreground" />
                <div>
                  <div>{exportingData ? "Preparing data export…" : "Data export"}</div>
                  <div className="text-xs text-muted-foreground">
                    Download preferences, saved recipes, pantry, meal plans &amp; collections
                  </div>
                </div>
              </div>
              {exportingData ? (
                <Loader2 size={16} className="animate-spin text-foreground" />
              ) : (
                <ChevronRight size={16} className="text-muted-foreground" />
              )}
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
            <DialogTitle className="font-medium">Edit Profile &amp; Picture</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update your profile picture and display name used across MealMate and Mia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ProfileAvatarUploader value={photoURL} onChange={setPhotoURL} />
            <div>
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
            <div>
              <Label
                htmlFor="settingsPhotoUrl"
                className="text-xs font-medium text-muted-foreground"
              >
                Profile Picture URL (optional)
              </Label>
              {photoURL.startsWith("data:image/") ? (
                <div className="mt-1.5 flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs text-muted-foreground">
                  <span className="truncate font-medium text-foreground">
                    Custom device photo ready to save
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhotoURL("")}
                    className="ml-2 shrink-0 font-medium text-primary hover:underline"
                  >
                    Use URL instead
                  </button>
                </div>
              ) : (
                <Input
                  id="settingsPhotoUrl"
                  type="text"
                  inputMode="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1.5 h-11 rounded-xl border-border bg-secondary text-foreground"
                />
              )}
            </div>
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
              <Label className="text-xs font-medium text-muted-foreground">Intolerances</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_INTOLERANCES.map((item) => {
                  const active = (draftPrefs.intolerances ?? []).includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleDraftList("intolerances", item)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-amber-600 bg-amber-600 text-white"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Favourite cuisines &amp; flavours
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_CUISINES.map((cuisine) => {
                  const active =
                    draftPrefs.favorite_foods.includes(cuisine) ||
                    (draftPrefs.preferred_cuisines ?? []).includes(cuisine);
                  return (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => {
                        toggleDraftList("favorite_foods", cuisine);
                        toggleDraftList("preferred_cuisines", cuisine);
                      }}
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
                Disliked ingredients
              </Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={dislikedDraft}
                  onChange={(e) => setDislikedDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addDislikedIngredient();
                    }
                  }}
                  placeholder="e.g. cilantro, olives, liver"
                  className="h-10 flex-1 rounded-xl border-border bg-secondary text-xs text-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDislikedIngredient}
                  className="h-10 rounded-xl border-border text-xs"
                >
                  Add
                </Button>
              </div>
              {draftPrefs.disliked_foods.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {draftPrefs.disliked_foods.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setDraftPrefs((p) => ({
                          ...p,
                          disliked_foods: p.disliked_foods.filter((x) => x !== item),
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-foreground hover:border-destructive/40"
                    >
                      {item} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Dietary lifestyle &amp; routine
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_LIFESTYLES.map((style) => {
                  const active = (draftPrefs.lifestyles ?? []).includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleDraftList("lifestyles", style)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Preferred meal types
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_MEAL_TYPES.map((meal) => {
                  const active = (draftPrefs.preferred_meal_types ?? []).includes(meal);
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => toggleDraftList("preferred_meal_types", meal)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {meal}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Household size</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PREF_HOUSEHOLD.map((size) => {
                    const active = draftPrefs.household_size === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          setDraftPrefs((p) => ({
                            ...p,
                            household_size: size,
                            meals_per_day: size,
                          }))
                        }
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Budget preference
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PREF_BUDGETS.map((budget) => {
                    const active = draftPrefs.food_budget === budget;
                    return (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => setDraftPrefs((p) => ({ ...p, food_budget: budget }))}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {budget}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Typical cooking time
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PREF_COOK_TIMES.map((time) => {
                  const active = draftPrefs.cooking_time === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDraftPrefs((p) => ({ ...p, cooking_time: time }))}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Kitchen identity habit
              </Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {IDENTITY_HABITS.map((habit) => {
                  const active = draftPrefs.identity_habit === habit;
                  return (
                    <button
                      key={habit}
                      type="button"
                      onClick={() =>
                        setDraftPrefs((p) => ({
                          ...p,
                          identity_habit: p.identity_habit === habit ? null : habit,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {habit}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Weekly home-cooked meals target
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[2, 3, 4, 5, 7].map((n) => {
                  const active = (draftPrefs.weekly_cooking_goal ?? 4) === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDraftPrefs((p) => ({ ...p, weekly_cooking_goal: n }))}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {n} meals / week
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
                    onClick={() => void handleSpeechSpeedChange(rate)}
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
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Select
                value={reportCategory}
                onValueChange={(v) => setReportCategory(v as FeedbackCategory)}
              >
                <SelectTrigger className="mt-1.5 h-10 rounded-xl border-border bg-secondary text-xs text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <textarea
              rows={4}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="What happened? Which screen or recipe were you using?"
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
              disabled={reporting || reportText.trim().length < 5}
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
