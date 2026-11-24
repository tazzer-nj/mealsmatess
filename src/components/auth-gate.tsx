import { useHubSurface } from "@/components/hub/hub-context";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Loader2, MailWarning } from "lucide-react";
import { useSession, signOutUnified } from "@/hooks/use-session";
import { auth } from "@/lib/firebase";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { reload, sendEmailVerification } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import { isHardcodedAdminEmail } from "@/lib/admin-emails";

// MealMate entry: auth → onboarding → paywall → app.
// Only these routes are reachable without a signed-in, verified user.
const PUBLIC_PREFIXES = [
  "/auth",
  "/reset-password",
  "/legal",
  "/about",
  "/support",
  "/ai-founder",
  ...(import.meta.env.DEV ? ["/dev"] : []),
];

// Inactive sessions are signed out after this window.
const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

export function AuthGate({
  children,
  publicHome = false,
}: {
  children: ReactNode;
  publicHome?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const isPublic =
    publicHome || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const needsAccount = !isPublic;

  // Inactivity timeout: sign out after N minutes of no interaction.
  useEffect(() => {
    if (!user) return;
    let lastActivity = Date.now();
    const bump = () => {
      lastActivity = Date.now();
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "keydown",
      "click",
      "touchstart",
      "scroll",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true, capture: true }));
    const iv = window.setInterval(async () => {
      if (Date.now() - lastActivity > INACTIVITY_MS) {
        window.clearInterval(iv);
        events.forEach((e) => window.removeEventListener(e, bump, { capture: true }));
        await signOutUnified();
        toast.message("Signed out due to inactivity.");
        navigate({ to: "/auth", replace: true });
      }
    }, 60 * 1000);
    return () => {
      window.clearInterval(iv);
      events.forEach((e) => window.removeEventListener(e, bump, { capture: true }));
    };
  }, [user, navigate]);

  if (!needsAccount) return <>{children}</>;

  if (loading) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 pt-6 pb-20">
        <div className="flex items-center justify-between">
          <Skeleton className="skeleton-shimmer h-9 w-40 rounded-xl" />
          <Skeleton className="skeleton-shimmer h-9 w-20 rounded-full" />
        </div>
        <Skeleton className="skeleton-shimmer h-14 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="skeleton-shimmer h-36 rounded-3xl" />
          <Skeleton className="skeleton-shimmer h-36 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (!user) {
    return <RedirectToAuth />;
  }

  // Email verification enforcement: block until confirmed_at or emailVerified is set (admins go straight in).
  const confirmed = Boolean(user.emailVerified) || isHardcodedAdminEmail(user.email);
  if (user.email && !confirmed) {
    return <VerifyEmailPrompt email={user.email} />;
  }

  return <>{children}</>;
}

function RedirectToAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/auth", replace: true });
  }, [navigate]);
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 pt-10 pb-20">
      <Skeleton className="skeleton-shimmer mx-auto h-10 w-44 rounded-xl" />
      <Skeleton className="skeleton-shimmer mx-auto h-64 w-full max-w-md rounded-2xl" />
    </main>
  );
}

function VerifyEmailPrompt({ email }: { email: string }) {
  const [busyAction, setBusyAction] = useState<"check" | "resend" | null>(null);

  async function confirmVerification() {
    const currentUser = auth.currentUser;
    if (!currentUser || busyAction) return;
    setBusyAction("check");
    try {
      await reload(currentUser);
      if (currentUser.emailVerified) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("mealmate:session-refreshed"));
        }
        toast.success("Email verified! Welcome to MealMate.");
      } else {
        toast.info("Your email is not verified yet. Check the link in your inbox.");
      }
    } catch {
      toast.error("Could not refresh your verification status. Please try again.");
    } finally {
      setBusyAction(null);
    }
  }

  async function resend() {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.email !== email) {
      toast.error("Sign in again before requesting a verification email.");
      return;
    }
    if (busyAction) return;
    setBusyAction("resend");
    try {
      await sendEmailVerification(currentUser);
      toast.success("Verification email sent. Check your inbox.");
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "signin"));
    } finally {
      setBusyAction(null);
    }
  }

  async function signOut() {
    await signOutUnified();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
          <MailWarning className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">Verify your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Open it in your inbox, then
          come back here.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            className="h-11 w-full rounded-xl bg-foreground text-background hover:opacity-90"
            disabled={busyAction !== null}
            onClick={() => void confirmVerification()}
          >
            {busyAction === "check" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "I verified my email"
            )}
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full rounded-xl border-border bg-secondary text-foreground hover:bg-muted"
            disabled={busyAction !== null}
            onClick={() => void resend()}
          >
            {busyAction === "resend" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Resend verification email"
            )}
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full rounded-xl text-muted-foreground hover:text-foreground"
            disabled={busyAction !== null}
            onClick={() => void signOut()}
          >
            Use a different account
          </Button>
        </div>
      </div>
    </main>
  );
}
