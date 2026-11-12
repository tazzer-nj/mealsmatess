import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Crown,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  Moon,
  Share2,
  Shield,
  Sparkles,
  Star,
  Sun,
  User as UserIcon,
  UserCog,
  Volume2,
  VolumeX,
  Gauge,
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
import { usePremium } from "@/hooks/use-premium";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { GamificationCard } from "@/components/gamification-card";
import { ThemePicker } from "@/components/theme-picker";
import { useMiaPreferences } from "@/lib/mia-preferences";
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
        content: "Manage your MealMate account, currency, language, notifications, and privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Settings — MealMate" },
      {
        name: "description",
        content: "Manage your MealMate account, currency, language, notifications, and privacy.",
      },
    ],
  }),
  component: SettingsPage,
});

type IconType = typeof Shield;
type Item = {
  label: string;
  description?: string;
  icon: IconType;
  to?: string;
  href?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  tone?: "danger";
};

const CURRENCIES: { code: string; symbol: string; name: string }[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
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
  if (typeof navigator === "undefined") return "USD";
  const region =
    (Intl.DateTimeFormat().resolvedOptions() as { locale?: string }).locale
      ?.split("-")?.[1]
      ?.toUpperCase() ?? "";
  return REGION_CURRENCY[region] ?? "USD";
}

function SettingsPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPremium } = usePremium();
  const miaPrefs = useMiaPreferences();

  const { resolved, setMode } = useTheme();

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

  // Profile preferences sync to Firestore for signed-in users.
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

  const [currency, setCurrency] = useState<string>("USD");
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
      text: "Cook smarter with MealMate — recipes, planner, and AI in your kitchen.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  }

  function rate() {
    toast.success("Thanks for the love!", {
      description: "Ratings will open in the App Store once we ship.",
    });
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

  const accountItems: Item[] = [
    {
      label: "Profile",
      description: "Your details and sign-in method",
      icon: UserIcon,
      to: "/profile",
    },
    {
      label: "Email",
      description: user?.email ?? "Not signed in",
      icon: Mail,
    },
    {
      label: "Edit preferences",
      description: "Goals, tastes, allergies, time and budget",
      icon: UserCog,
      to: "/onboarding",
    },
    {
      label: "Change password",
      description: "We'll email you a secure reset link",
      icon: Lock,
      onClick: resetPassword,
    },
  ];

  const subscriptionItems: Item[] = [
    {
      label: "MealMate Premium",
      description: isPremium ? "Active — thank you for supporting MealMate" : "Unlock Mia and more",
      icon: Crown,
      to: "/premium",
    },
    {
      label: "Manage subscription",
      description: "Plans, billing and restore purchases",
      icon: Star,
      to: "/premium",
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
      description: "Get in touch with the team",
      icon: Mail,
      href: "mailto:support@mealmate.app",
    },
    {
      label: "Report an issue",
      description: "Tell us what went wrong",
      icon: Bell,
      href: "mailto:support@mealmate.app?subject=MealMate%20issue",
    },
  ];

  const aboutItems: Item[] = [
    { label: "About MealMate", description: "Version and credits", icon: Info, to: "/about" },
    {
      label: "Follow on Instagram",
      description: "@mealmate.sp",
      icon: Share2,
      href: "https://www.instagram.com/mealmate.sp",
    },
    {
      label: "Follow on TikTok",
      description: "@mealmate.sp",
      icon: Share2,
      href: "https://www.tiktok.com/@mealmate.sp",
    },
  ];

  const legalItems: Item[] = [
    {
      label: "Terms of Service",
      description: "The rules for using MealMate",
      icon: FileText,
      to: "/legal/terms",
    },
    {
      label: "Privacy Policy",
      description: "How we handle your data",
      icon: Shield,
      to: "/legal/privacy",
    },
  ];

  const initial = (user?.email ?? "M").trim().charAt(0).toUpperCase();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-8 sm:px-8">
      <header>
        <p className="mm-eyebrow">Settings</p>
        <h1 className="mt-2 mm-title">Account &amp; preferences.</h1>

        <div className="mt-6 flex items-center gap-4 rounded-[18px] border border-[#1E1E1E] bg-[#141414] p-4">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#1F1F1F] text-[17px] font-semibold text-white"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium">
              {user?.email ?? "Sign in to sync your recipes"}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#71717A]">
              {isPremium ? (
                <>
                  <Crown className="h-3.5 w-3.5" strokeWidth={1.75} /> Premium member
                </>
              ) : (
                "Free plan"
              )}
            </p>
          </div>
          {!isPremium && (
            <Button asChild className="h-10 px-4 text-[13px]">
              <Link to="/premium">Upgrade</Link>
            </Button>
          )}
        </div>
      </header>

      {/* XP, levels, streaks & challenges */}
      <GamificationCard />

      <Section title="Account" items={accountItems} />

      <Section title="Subscription" items={subscriptionItems} />

      <Section
        title="Mia"
        items={[
          {
            label: "Spoken replies",
            description: "Mia reads her answers out loud",
            icon: miaPrefs.voiceResponses ? Volume2 : VolumeX,
            trailing: (
              <Switch
                checked={miaPrefs.voiceResponses}
                onCheckedChange={(checked) => {
                  miaPrefs.setVoiceResponses(checked);
                  toast.success(checked ? "Mia will speak again" : "Mia is muted");
                }}
                aria-label="Spoken replies from Mia"
              />
            ),
          },
          {
            label: "Mute Mia",
            description: "Silence all spoken answers — only here, never in chat",
            icon: miaPrefs.voiceResponses ? VolumeX : Volume2,
            trailing: (
              <Switch
                checked={!miaPrefs.voiceResponses}
                onCheckedChange={(checked) => {
                  miaPrefs.setVoiceResponses(!checked);
                  toast.success(checked ? "Mia is muted" : "Mia will speak again");
                }}
                aria-label="Mute Mia"
              />
            ),
          },
          {
            label: "Speech speed",
            description: "How quickly Mia speaks",
            icon: Gauge,
            trailing: (
              <div onClick={(e) => e.stopPropagation()}>
                <Select
                  value={String(miaPrefs.speechRate)}
                  onValueChange={(v) => miaPrefs.setSpeechRate(Number(v))}
                >
                  <SelectTrigger className="h-9 w-[104px] rounded-[10px] text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="0.8">0.8×</SelectItem>
                    <SelectItem value="1">1×</SelectItem>
                    <SelectItem value="1.25">1.25×</SelectItem>
                    <SelectItem value="1.5">1.5×</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ),
          },
          {
            label: "Voice conversations",
            description: "Talk with Mia hands-free in chat",
            icon: Sparkles,
            to: "/chat",
          },
        ]}
      />

      <Section
        title="Preferences"
        items={[
          {
            label: resolved === "dark" ? "Dark appearance" : "Light appearance",
            description:
              resolved === "dark" ? "Easier on your eyes at night" : "Bright and airy interface",
            icon: resolved === "dark" ? Moon : Sun,
            trailing: (
              <Switch
                checked={resolved === "dark"}
                onCheckedChange={(v) => setMode(v ? "dark" : "light")}
                aria-label="Dark mode"
              />
            ),
          },
          {
            label: "Currency",
            description: "Prices shown throughout the app",
            icon: DollarSign,
            trailing: (
              <div onClick={(e) => e.stopPropagation()}>
                <Select value={currency} onValueChange={saveCurrency}>
                  <SelectTrigger className="h-9 w-[124px] rounded-[10px] text-[13px]">
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
                <Select value={lang} onValueChange={saveLanguage}>
                  <SelectTrigger className="h-9 w-[136px] rounded-[10px] text-[13px]">
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
          {
            label: "Dietary preferences",
            description: "Allergies and foods to avoid",
            icon: UserCog,
            to: "/onboarding",
          },
        ]}
      />

      <ThemePicker />

      <Section
        title="Notifications"
        items={[
          {
            label: "MealMate updates",
            description: "Show product announcements in your notification history",
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
            description: "Allow browser notifications on this device",
            icon: Bell,
            trailing: (
              <Switch
                checked={pushEnabled}
                disabled={
                  !user ||
                  !productUpdatesEnabled ||
                  notificationPreferences.isLoading ||
                  notificationBusy
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
        ]}
      />

      <Section
        title="Privacy &amp; security"
        items={[
          {
            label: "Privacy Policy",
            description: "How we handle your data",
            icon: Shield,
            to: "/legal/privacy",
          },
          {
            label: "Data controls",
            description: "Manage what MealMate stores",
            icon: Lock,
            to: "/legal/privacy",
          },
        ]}
      />

      <Section title="Support" items={supportItems} />
      <Section title="About MealMate" items={aboutItems} />
      <Section title="Terms &amp; privacy" items={legalItems} />

      <section className="mt-6 grid grid-cols-2 gap-2">
        <ActionCard icon={Star} label="Rate the app" onClick={rate} />
        <ActionCard icon={Share2} label="Share MealMate" onClick={share} />
      </section>

      {user && (
        <Button variant="danger" onClick={signOut} className="mt-8 w-full">
          <LogOut className="mr-2 h-[17px] w-[17px]" strokeWidth={1.75} />
          Sign out
        </Button>
      )}

      <p className="mt-8 text-center text-[11px] text-[#52525B]">MealMate · Made with care</p>
    </main>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2.5 px-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#71717A]">
        {title}
      </h2>
      <ul className="overflow-hidden rounded-[16px] border border-[#1E1E1E] bg-[#141414]">
        {items.map((item, i) => (
          <li key={item.label} className={i > 0 ? "border-t border-[#1E1E1E]" : ""}>
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
    <div className="flex min-h-[60px] items-center gap-3.5 px-4 py-3 transition-colors duration-150 hover:bg-[#171717]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[#A1A1AA]">
        <Icon className="h-[19px] w-[19px]" strokeWidth={1.6} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-tight text-white">{item.label}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-[12.5px] leading-snug text-[#71717A]">
            {item.description}
          </p>
        )}
      </div>
      {item.trailing ??
        (showChevron ? (
          <ChevronRight className="h-4 w-4 shrink-0 text-[#52525B]" strokeWidth={1.75} />
        ) : null)}
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
  // A trailing control (e.g. a Switch) is itself a button, so the row must not
  // also be a <button> — nested buttons are invalid HTML and break hydration.
  if (item.onClick && !item.trailing) {
    return (
      <button type="button" onClick={item.onClick} className="block w-full text-left">
        {body}
      </button>
    );
  }
  return <div>{body}</div>;
}

function ActionCard({
  icon: Icon,
  label,
  onClick,
}: {
  icon: IconType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 text-left transition-colors hover:border-[#262626] hover:bg-[#171717]"
    >
      <Icon className="h-[17px] w-[17px] shrink-0 text-[#A1A1AA]" strokeWidth={1.6} />
      <span className="text-[13.5px] font-medium text-white">{label}</span>
    </button>
  );
}
