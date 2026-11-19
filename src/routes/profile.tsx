import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  Share2,
  Shield,
  Star,
  User as UserIcon,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { firebaseData } from "@/lib/firebase-data";
import { auth, sendPasswordReset } from "@/lib/firebase";
import { saveUserProfile } from "@/lib/profile-avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getMyNotificationPreferences,
  registerMyPushToken,
  saveMyNotificationPreferences,
} from "@/lib/notifications.functions";
import { requestBrowserPushToken, revokeBrowserPushToken } from "@/lib/push-client";
import { useSession, signOutUnified } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GamificationCard } from "@/components/gamification-card";
import { ThemePicker } from "@/components/theme-picker";
import { ProfileAvatarUploader } from "@/components/profile-avatar-uploader";
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
      { property: "og:title", content: "Profile | MealMate" },
      {
        property: "og:description",
        content: "Manage your MealMate profile, preferences, subscription, and settings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Profile | MealMate" },
      {
        name: "description",
        content: "Manage your MealMate profile, preferences, subscription, and settings.",
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
  const [editProfileOpen, setEditProfileOpen] = useState(false);

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
      text: "Cook smarter with MealMate: recipes, planner, and AI in your kitchen.",
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

  const profileItems: Item[] = [
    {
      label: "Settings & Mia Voice",
      description: "Account, preferences, notifications, theme & Mia audio",
      icon: UserCog,
      to: "/settings",
    },
    {
      label: "Culinary preferences",
      description: "Update goals, dietary filters, allergies and cuisines",
      icon: UserIcon,
      to: "/settings",
    },
    {
      label: "MealMate Premium",
      description: "AI, recipes and meal plans · View subscription plans",
      icon: Star,
      to: "/premium",
    },
    {
      label: "Admin dashboard",
      description: "Subscribers, promos, revenue (admin only)",
      icon: Shield,
      to: "/admin",
    },
  ];

  const accountItems: Item[] = [
    {
      label: "Email",
      description: user?.email ?? "Not signed in",
      icon: Mail,
    },
    {
      label: "Change password",
      description: "We'll email you a secure reset link",
      icon: Lock,
      onClick: resetPassword,
    },
  ];

  const supportItems: Item[] = [
    {
      label: "Help Center",
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

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 overflow-x-hidden bg-background px-3.5 pb-28 pt-6 text-foreground sm:px-4 sm:pt-8">
      <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName ?? "Profile"}
                className="h-14 w-14 shrink-0 rounded-2xl border border-primary/25 object-cover shadow-xs ring-2 ring-primary/10 transition-transform duration-200 hover:scale-105"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-foreground">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-medium tracking-tight text-foreground">
                {user?.displayName || "Profile"}
              </h1>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email ?? "Sign in to sync your recipes"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditProfileOpen(true)}
            className="tap-spring rounded-xl border-border bg-secondary text-xs font-medium text-foreground hover:bg-muted"
          >
            Edit Profile
          </Button>
        </div>
      </div>
      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />

      {/* XP, levels, streaks & challenges */}
      <div className="mt-6">
        <GamificationCard />
      </div>

      <ThemePicker />
      <Section title="Profile & Controls" items={profileItems} />
      <Section title="Account" items={accountItems} />

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
        title="Region"
        items={[
          {
            label: "Currency",
            description: "Prices shown throughout the app",
            icon: DollarSign,
            trailing: (
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <Select value={currency} onValueChange={saveCurrency}>
                  <SelectTrigger className="h-9 w-[112px] rounded-xl border-border bg-secondary text-xs text-foreground sm:w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    className="border-border bg-popover text-popover-foreground"
                  >
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.code} · {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ),
          },
          {
            label: "App language",
            description: "Interface and recipe language",
            icon: Globe,
            trailing: (
              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <Select value={lang} onValueChange={saveLanguage}>
                  <SelectTrigger className="h-9 w-[122px] rounded-xl border-border bg-secondary text-xs text-foreground sm:w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    className="border-border bg-popover text-popover-foreground"
                  >
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
        ]}
      />

      <Section
        title="Privacy & Security"
        items={[
          {
            label: "Privacy Policy",
            description: "How we handle your data",
            icon: Shield,
            to: "/legal/privacy",
          },
          {
            label: "Change password",
            description: "Send a secure reset link to your email",
            icon: UserCog,
            onClick: resetPassword,
          },
        ]}
      />

      <Section title="Help & Support" items={supportItems} />
      <Section title="About MealMate" items={aboutItems} />
      <Section title="Terms & Privacy" items={legalItems} />

      <section className="mt-6 grid grid-cols-2 gap-3">
        <ActionCard icon={Star} label="Rate the app" onClick={rate} />
        <ActionCard icon={Share2} label="Share MealMate" onClick={share} />
      </section>

      {user && (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={signOut}
            className="h-12 w-full rounded-xl border-border bg-card text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        MealMate Consumer · Taz Technologies
      </p>
    </main>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      <ul className="overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((item, i) => (
          <li key={item.label} className={i > 0 ? "border-t border-border" : ""}>
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
    <div className="flex items-center gap-3 px-3.5 py-3.5 transition-colors duration-150 hover:bg-secondary sm:px-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight text-foreground">{item.label}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>
      {item.trailing ??
        (showChevron ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : null)}
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
      className="group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-[var(--periwinkle)] hover:bg-secondary"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </button>
  );
}

function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useSession();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      setPhotoURL(user.photoURL ?? "");
    }
  }, [user, open]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("You must be signed in to update your profile.");
      return;
    }
    setSaving(true);
    try {
      await saveUserProfile({
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      });
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const isUploadedDataUrl = photoURL.startsWith("data:image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Profile & Picture</DialogTitle>
          <DialogDescription>Update your display name and profile picture.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <ProfileAvatarUploader value={photoURL} onChange={setPhotoURL} />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Profile Picture URL (optional)
            </label>
            {isUploadedDataUrl ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
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
              <input
                type="text"
                inputMode="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
              />
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
