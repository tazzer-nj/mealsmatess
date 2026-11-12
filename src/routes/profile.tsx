import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  CircleUser,
  Crown,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Mic,
  Moon,
  Share2,
  Shield,
  Sparkles,
  Sun,
  Trash2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseData } from "@/lib/firebase-data";
import { sendPasswordReset } from "@/lib/firebase";
import {
  getMyNotificationPreferences,
  registerMyPushToken,
  saveMyNotificationPreferences,
} from "@/lib/notifications.functions";
import { requestBrowserPushToken, revokeBrowserPushToken } from "@/lib/push-client";
import { useSession, signOutUnified } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { GamificationCard } from "@/components/gamification-card";
import { usePremium } from "@/hooks/use-premium";
import { useMia } from "@/hooks/use-mia";
import { isMiaMuted, setMiaMuted } from "@/lib/mia/mute";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Settings \u2014 MealMate" },
      {
        property: "og:description",
        content: "Manage your MealMate account, subscription, Mia voice, preferences and privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Settings — MealMate" },
      {
        name: "description",
        content: "Manage your MealMate account, subscription, Mia voice, preferences and privacy.",
      },
    ],
  }),
  component: SettingsPage,
});

const APP_VERSION = "1.0.0";
const SUPPORT_EMAIL = "support@mealmate.app";

type IconType = typeof Shield;
type Item = {
  label: string;
  description?: string;
  icon: IconType;
  to?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
};

const CURRENCIES: { code: string; symbol: string; name: string }[] = [
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
];

const LANGUAGES: { code: string; name: string }[] = [
  { code: "en", name: "English" },
  { code: "zu", name: "isiZulu" },
  { code: "af", name: "Afrikaans" },
  { code: "xh", name: "isiXhosa" },
  { code: "st", name: "Sesotho" },
  { code: "tn", name: "Setswana" },
  { code: "nso", name: "Sepedi" },
  { code: "ve", name: "Tshivenda" },
  { code: "ts", name: "Xitsonga" },
  { code: "ss", name: "Siswati" },
  { code: "nr", name: "isiNdebele" },
];

// Best-effort region → currency map for first-launch defaults.
const REGION_CURRENCY: Record<string, string> = {
  US: "USD",
  ZA: "ZAR",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  PT: "EUR",
  AT: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
  AU: "AUD",
  CA: "CAD",
  NZ: "NZD",
};

function detectCurrency(): string {
  if (typeof navigator === "undefined") return "ZAR";
  const region =
    (Intl.DateTimeFormat().resolvedOptions() as { locale?: string }).locale
      ?.split("-")?.[1]
      ?.toUpperCase() ?? "";
  return REGION_CURRENCY[region] ?? "USD";
}

function mailto(subject: string, body: string) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function SettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resolved, setMode } = useTheme();
  const { isPremium } = usePremium();
  const { voice, startVoice, stopVoice } = useMia();
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMiaMuted());
  }, []);

  const notificationPreferences = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: () => getMyNotificationPreferences(),
    enabled: !!user,
    staleTime: 30_000,
  });
  const productUpdatesEnabled = notificationPreferences.data?.productUpdatesEnabled ?? true;
  const pushEnabled = notificationPreferences.data?.pushEnabled ?? false;
  const [notificationBusy, setNotificationBusy] = useState(false);

  async function updateNotificationPreferences(
    change: Partial<{ productUpdatesEnabled: boolean; pushEnabled: boolean }>,
  ) {
    if (!user) {
      toast.error("Sign in to manage notification preferences.");
      return;
    }
    const current = {
      productUpdatesEnabled: notificationPreferences.data?.productUpdatesEnabled ?? true,
      pushEnabled: notificationPreferences.data?.pushEnabled ?? false,
    };
    const next = { ...current, ...change };
    if (!next.productUpdatesEnabled) next.pushEnabled = false;
    setNotificationBusy(true);
    let consentSaved = false;
    try {
      const token =
        next.pushEnabled && !current.pushEnabled ? await requestBrowserPushToken() : null;
      await saveMyNotificationPreferences({ data: next });
      consentSaved = next.pushEnabled;
      if (token) {
        await registerMyPushToken({ data: { token } });
      }
      if (!next.pushEnabled) await revokeBrowserPushToken().catch(() => undefined);
      await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
      toast.success(
        next.pushEnabled
          ? "Push notifications enabled for this account."
          : "Notification preferences saved.",
      );
    } catch (error) {
      if (consentSaved) {
        await saveMyNotificationPreferences({ data: current }).catch(() => undefined);
      }
      toast.error(
        error instanceof Error ? error.message : "Could not update notification preferences.",
      );
    } finally {
      setNotificationBusy(false);
    }
  }

  const { data: prefs } = useQuery({
    queryKey: ["profile-prefs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await firebaseData
        .from("profiles")
        .select("currency, locale")
        .eq("id", user!.id)
        .maybeSingle();
      return (data as { currency?: string; locale?: string } | null) ?? null;
    },
  });

  const [currency, setCurrency] = useState<string>("ZAR");
  const [lang, setLang] = useState<string>("en");
  useEffect(() => {
    const storedCur = window.localStorage.getItem("mealmate-currency");
    const storedLang = window.localStorage.getItem("mealmate-lang");
    setCurrency(prefs?.currency ?? storedCur ?? detectCurrency());
    setLang(prefs?.locale ?? storedLang ?? "en");
  }, [prefs]);

  async function saveCurrency(next: string) {
    setCurrency(next);
    window.localStorage.setItem("mealmate-currency", next);
    window.dispatchEvent(new CustomEvent("mealmate-currency-changed", { detail: next }));
    if (!user) return;
    const { error } = await firebaseData
      .from("profiles")
      .update({ currency: next } as never)
      .eq("id", user.id);
    if (error) {
      toast.error("Couldn't save currency", { description: error.message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
    queryClient.invalidateQueries({ queryKey: ["currency"] });
  }

  async function saveLanguage(next: string) {
    setLang(next);
    window.localStorage.setItem("mealmate-lang", next);
    window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: next }));
    if (!user) return;
    const { error } = await firebaseData
      .from("profiles")
      .update({ locale: next } as never)
      .eq("id", user.id);
    if (error) {
      toast.error("Couldn't save language", { description: error.message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
    queryClient.invalidateQueries({ queryKey: ["locale"] });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutUnified();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  async function share() {
    const url = "https://mealmate.app";
    const shareData = {
      title: "MealMate",
      text: "Cook smarter with MealMate — recipes, planner, and Mia in your kitchen.",
      url,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  }

  async function resetPassword() {
    if (!user?.email) {
      toast.error("No email on file");
      return;
    }
    try {
      await sendPasswordReset(user.email, `${window.location.origin}/reset-password`);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Couldn't send the reset email. Please try again.");
    }
  }

  const voiceActive = ["loading", "waiting", "listening", "thinking", "speaking"].includes(
    voice.state,
  );

  const accountItems: Item[] = [
    {
      label: "Email",
      description: user?.email ?? "Not signed in",
      icon: Mail,
    },
    {
      label: "Edit dietary preferences",
      description: "Goals, allergies, cuisines and skill level",
      icon: CircleUser,
      to: "/onboarding",
    },
    {
      label: "Change password",
      description: "We'll email you a secure reset link",
      icon: Lock,
      onClick: resetPassword,
    },
    {
      label: "Sign out",
      description: "Sign out of MealMate on this device",
      icon: LogOut,
      onClick: () => void signOut(),
    },
    {
      label: "Delete account",
      description: "Request permanent deletion of your account and data",
      icon: Trash2,
      danger: true,
      href: mailto(
        "Delete my MealMate account",
        "Please permanently delete my MealMate account and the data associated with it.\n\nAccount email: ",
      ),
    },
  ];

  const subscriptionItems: Item[] = [
    {
      label: "MealMate Premium",
      description: isPremium ? "Active on this account" : "Free plan · view what Premium includes",
      icon: Crown,
      to: "/premium",
    },
    {
      label: "Manage subscription",
      description: "Review your plan, restore access or check status",
      icon: Sparkles,
      to: "/premium",
    },
    {
      label: "Restore purchases",
      description: "Already subscribed? Re-check store entitlement",
      icon: Shield,
      to: "/premium",
    },
  ];

  const miaItems: Item[] = [
    {
      label: "Voice conversations",
      description: voiceActive ? "Mia is listening on this device" : "Hands-free voice is off",
      icon: Mic,
      trailing: (
        <Switch
          checked={voiceActive}
          disabled={!isPremium || muted}
          onCheckedChange={(checked) => (checked ? startVoice() : stopVoice())}
          aria-label="Voice conversations with Mia"
        />
      ),
    },
    {
      label: "Mute Mia",
      description: muted ? "Microphone and spoken replies are muted" : "Mia can listen and speak",
      icon: VolumeX,
      trailing: (
        <Switch
          checked={muted}
          onCheckedChange={(checked) => {
            setMiaMuted(checked);
            setMutedState(checked);
            if (checked) {
              stopVoice();
              toast.success("Mia is muted");
            } else {
              toast.success("Mia is unmuted");
            }
          }}
          aria-label="Mute Mia"
        />
      ),
    },
    {
      label: "Conversation settings",
      description: "Open the chat to review history and suggested prompts",
      icon: MessageCircle,
      to: "/chat",
    },
  ];

  const preferenceItems: Item[] = [
    {
      label: resolved === "dark" ? "Dark appearance" : "Light appearance",
      description:
        resolved === "dark" ? "Black surfaces, white text" : "Paper surfaces, black text",
      icon: resolved === "dark" ? Moon : Sun,
      trailing: (
        <Switch
          checked={resolved === "dark"}
          onCheckedChange={(v) => setMode(v ? "dark" : "light")}
          aria-label="Dark appearance"
        />
      ),
    },
    {
      label: "MealMate updates",
      description: "Product announcements in your notification history",
      icon: Bell,
      trailing: (
        <Switch
          checked={productUpdatesEnabled}
          disabled={!user || notificationPreferences.isLoading || notificationBusy}
          onCheckedChange={(checked) =>
            void updateNotificationPreferences({ productUpdatesEnabled: checked })
          }
          aria-label="MealMate product updates"
        />
      ),
    },
    {
      label: "Push notifications",
      description: "Allow notifications on this device",
      icon: Bell,
      trailing: (
        <Switch
          checked={pushEnabled}
          disabled={
            !user || !productUpdatesEnabled || notificationPreferences.isLoading || notificationBusy
          }
          onCheckedChange={(checked) =>
            void updateNotificationPreferences({ pushEnabled: checked })
          }
          aria-label="Push notifications"
        />
      ),
    },
    {
      label: "Notification history",
      description: "View unread and past MealMate updates",
      icon: Bell,
      to: "/notifications",
    },
    {
      label: "Currency",
      description: "Prices shown throughout the app",
      icon: DollarSign,
      trailing: (
        <div onClick={(e) => e.stopPropagation()}>
          <Select value={currency} onValueChange={(v) => void saveCurrency(v)}>
            <SelectTrigger className="h-9 w-[132px] rounded-lg border-[#303030] bg-[#141414] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      label: "Language",
      description: "Interface and recipe language",
      icon: Globe,
      trailing: (
        <div onClick={(e) => e.stopPropagation()}>
          <Select value={lang} onValueChange={(v) => void saveLanguage(v)}>
            <SelectTrigger className="h-9 w-[132px] rounded-lg border-[#303030] bg-[#141414] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  const privacyItems: Item[] = [
    {
      label: "Privacy policy",
      description: "How we handle your data",
      icon: Shield,
      to: "/legal/privacy",
    },
    {
      label: "Terms of service",
      description: "The rules for using MealMate",
      icon: FileText,
      to: "/legal/terms",
    },
    {
      label: "Your data",
      description: "Request a copy or deletion of your data",
      icon: Lock,
      href: mailto(
        "My MealMate data request",
        "Please send me a copy of the personal data MealMate holds for my account.\n\nAccount email: ",
      ),
    },
  ];

  const supportItems: Item[] = [
    {
      label: "Help centre",
      description: "Answers to common questions",
      icon: HelpCircle,
      to: "/support",
    },
    {
      label: "Contact support",
      description: SUPPORT_EMAIL,
      icon: Mail,
      href: `mailto:${SUPPORT_EMAIL}`,
    },
    {
      label: "Report an issue",
      description: "Tell us what went wrong",
      icon: MessageCircle,
      href: mailto("MealMate issue report", "What happened?\n\n\nWhat were you doing?\n\n"),
    },
    {
      label: "App version",
      description: `MealMate ${APP_VERSION}`,
      icon: Info,
      to: "/about",
    },
  ];

  return (
    <main className="mm-page">
      <h1 className="mm-h1">Settings</h1>

      <section className="settings-hero mt-5">
        <span className="settings-avatar">
          {(user?.displayName ?? user?.email ?? "M").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium">{user?.displayName ?? "Your account"}</p>
          <p className="truncate text-[12px] text-muted-foreground">
            {user?.email ?? "Sign in to sync your recipes"}
          </p>
          <span className="mm-tag mt-2 inline-flex">{isPremium ? "Premium" : "Free plan"}</span>
        </div>
      </section>

      <GamificationCard />

      <Section title="Account" items={accountItems} />
      <Section title="Subscription" items={subscriptionItems} />
      <Section title="Mia" items={miaItems} />
      <Section title="Preferences" items={preferenceItems} />
      <Section title="Privacy" items={privacyItems} />
      <Section title="Support" items={supportItems} />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void share()}
          className="mm-tile justify-center text-[13px] font-medium"
        >
          <Share2 className="size-4" strokeWidth={1.7} />
          Share MealMate
        </button>
        <Link to="/about" className="mm-tile justify-center text-[13px] font-medium">
          <Info className="size-4" strokeWidth={1.7} />
          About MealMate
        </Link>
      </div>

      {user ? (
        <Button
          variant="destructive"
          onClick={() => void signOut()}
          className="mt-6 h-12 w-full rounded-xl"
        >
          <LogOut />
          Sign out
        </Button>
      ) : null}

      <p className="mm-meta mt-8 text-center">MealMate · Version {APP_VERSION}</p>
    </main>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-7" aria-labelledby={`settings-${title}`}>
      <h2
        id={`settings-${title}`}
        className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {title}
      </h2>
      <ul className="mm-group">
        {items.map((item) => (
          <li key={item.label}>
            <Row item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ item }: { item: Item }) {
  const Icon = item.icon;
  const showChevron = !!(item.to || item.href) && !item.trailing;
  const body = (
    <div className="mm-group-row">
      <span className="mm-group-row-icon">
        <Icon className="size-[18px]" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`settings-row-title ${item.danger ? "text-[#e5484d]" : ""}`}>{item.label}</p>
        {item.description ? <p className="settings-row-desc">{item.description}</p> : null}
      </div>
      {item.trailing ??
        (showChevron ? <ChevronRight className="size-4 flex-none text-muted-foreground" /> : null)}
    </div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className="block"
      >
        {body}
      </a>
    );
  }
  if (item.to) {
    return (
      <Link to={item.to} className="block">
        {body}
      </Link>
    );
  }
  // A trailing control is itself a button, so the row must not also be a <button>.
  if (item.onClick && !item.trailing) {
    return (
      <button type="button" onClick={item.onClick} className="block w-full text-left">
        {body}
      </button>
    );
  }
  return <div>{body}</div>;
}
