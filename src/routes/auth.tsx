import { useHubSurface } from "@/components/hub/hub-context";
import { createFileRoute, useNavigate, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecipeImage } from "@/components/recipe-image";
import {
  getRedirectResult,
  auth,
  signInWithGoogle as signInWithFirebaseGoogle,
  signInWithEmail as signInWithFirebaseEmail,
  signUpWithEmail as signUpWithFirebaseEmail,
  sendPasswordReset as sendFirebasePasswordReset,
  db,
} from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sendEmailVerification } from "firebase/auth";

async function ensureUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const profile = {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName || user.email?.split("@")[0] || "Chef",
    photoURL: user.photoURL ?? "",
    goal: "healthy_cooking",
  };

  await setDoc(
    userRef,
    snap.exists()
      ? profile
      : {
          ...profile,
          id: user.uid,
          email: user.email ?? "",
          displayName: user.displayName || user.email?.split("@")[0] || "Chef",
          photoURL: user.photoURL ?? "",
          goal: "healthy_cooking",
          createdAt: new Date().toISOString(),
        },
    { merge: true },
  );
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — MealMate" },
      {
        name: "description",
        content: "Sign in or create your MealMate account to personalize meals and dining.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { mode?: "signin" | "signup" } =>
    s["mode"] === "signup" ? { mode: "signup" } : s["mode"] === "signin" ? { mode: "signin" } : {},
  component: AuthLayout,
});

function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

function getGoogleSignInErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? (error as { code?: unknown }).code
      : undefined;

  if (code === "auth/unauthorized-domain") {
    const hostname = typeof window === "undefined" ? "this site" : window.location.hostname;
    return `Google sign-in is not enabled for ${hostname}. Add this domain under Firebase Authentication settings.`;
  }

  if (code === "auth/internal-error") {
    return "Google could not finish signing in. Check that Google sign-in is enabled and this site is listed in Firebase Authentication's authorized domains.";
  }

  return extractErrorMessage(
    error,
    "Google sign-in is unavailable. Please use email and password.",
  );
}

export function AuthLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/auth" || pathname === "/auth/" ? <AuthPage /> : <Outlet />;
}

function GoogleMark() {
  return (
    <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AuthPage() {
  const isHub = useHubSurface();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void getRedirectResult(auth)
      .then(async (result) => {
        if (!active || !result?.user) return;
        try {
          await ensureUserProfile(result.user);
          toast.success("Welcome to MealMate!");
          navigate({ to: "/onboarding", replace: true });
        } catch (error) {
          console.error("[Auth] Google redirect completion failed:", error);
          toast.error("Google sign-in completed, but your profile could not be loaded.");
        }
      })
      .catch((error) => {
        if (error?.code === "auth/popup-closed-by-user") return;
        console.error("[Auth] Google redirect error:", error);
        toast.error(extractErrorMessage(error, "Google sign-in is unavailable."));
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/onboarding", replace: true });
  }, [user, loading, navigate]);

  async function signInWithGoogle() {
    if (busy) return;
    setBusy(true);
    try {
      const cred = await signInWithFirebaseGoogle();
      if (cred?.user) {
        try {
          await ensureUserProfile(cred.user);
        } catch (dbErr) {
          console.warn("[Auth] Could not create Firestore profile:", dbErr);
        }
        toast.success("Welcome to MealMate!");
        navigate({ to: "/onboarding", replace: true });
        return;
      }
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "auth/popup-closed-by-user") {
        return;
      }
      console.error("[Auth] Google sign-in error:", error);
      toast.error(getGoogleSignInErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || password.length < 6) {
        toast.error("Enter a valid email and a password with at least 6 characters.");
        return;
      }

      if (mode === "signup") {
        try {
          const cred = await signUpWithFirebaseEmail(normalizedEmail, password, displayName);
          if (cred?.user) {
            try {
              await ensureUserProfile(cred.user);
            } catch (fsErr) {
              console.warn("[Auth] Could not initialize firestore user profile:", fsErr);
            }
            await sendEmailVerification(cred.user);
            toast.message("Check your inbox to verify your email and finish setting up MealMate.");
            navigate({ to: "/onboarding", replace: true });
            return;
          }
        } catch (fbErr: any) {
          if (fbErr?.code === "auth/email-already-in-use") {
            toast.error("An account with this email already exists. Sign in instead.");
            setMode("signin");
            setPassword("");
            return;
          }
          throw fbErr;
        }
        toast.success("Welcome to MealMate!");
      } else {
        try {
          const cred = await signInWithFirebaseEmail(normalizedEmail, password);
          if (cred?.user) {
            toast.success("Welcome back!");
            navigate({ to: "/onboarding", replace: true });
            return;
          }
        } catch (fbErr: any) {
          if (
            fbErr?.code === "auth/user-not-found" ||
            fbErr?.code === "auth/invalid-credential" ||
            fbErr?.code === "auth/wrong-password"
          ) {
            throw new Error("Invalid email or password.");
          }
          throw fbErr;
        }
      }
    } catch (err) {
      console.error("[Auth] submit error:", err);
      const message = extractErrorMessage(err, "Authentication failed").toLowerCase();
      toast.error(
        message.includes("invalid login credentials") ||
          message.includes("invalid email or password") ||
          message.includes("auth/wrong-password") ||
          message.includes("auth/user-not-found")
          ? "Invalid email or password."
          : message.includes("email not confirmed")
            ? "Please verify your email before signing in."
            : message.includes("already registered") || message.includes("already exists")
              ? "An account with this email already exists. Sign in instead."
              : message.includes("pwned") || message.includes("weak")
                ? "That password is too weak or has appeared in a data breach. Choose another."
                : message.includes("rate limit")
                  ? "Too many attempts. Please wait a minute and try again."
                  : extractErrorMessage(err, "Authentication failed"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={isHub ? "hub-auth premium-flow" : "premium-flow"}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[420px] flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        <header className="flex flex-col items-center text-center">
          <MealMateLogo className="justify-center" imageClassName="size-14 rounded-[18px]" />
          <h1 className="mt-6 text-[27px] font-semibold leading-tight tracking-[-0.025em] text-white">
            Welcome to MealMate.
          </h1>
          <p className="mt-2 text-[14.5px] text-[#A1A1AA]">Your next favourite meal starts here.</p>
        </header>

        <div className="mt-7 overflow-hidden rounded-[20px] border border-[#1E1E1E]">
          <div className="relative aspect-[16/9] w-full">
            <RecipeImage recipe={{ name: "Creamy chicken alfredo" }} size="hero" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-7">
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={busy}
            className="mm-btn mm-btn-primary mm-btn-block gap-2.5"
          >
            {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <GoogleMark />}
            <span>{busy ? "Signing in…" : "Continue with Google"}</span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#1E1E1E]" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#71717A]">or</span>
            <span className="h-px flex-1 bg-[#1E1E1E]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="mb-1.5 block text-[12.5px] text-[#A1A1AA]">
                  Preferred name
                </Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Chef Thabo"
                  autoComplete="name"
                  disabled={busy}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="mb-1.5 block text-[12.5px] text-[#A1A1AA]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <Label htmlFor="password" className="text-[12.5px] text-[#A1A1AA]">
                  Password
                </Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      if (!email) {
                        toast.error("Enter your email first, then tap forgot password.");
                        return;
                      }
                      setBusy(true);
                      try {
                        await sendFirebasePasswordReset(email.trim().toLowerCase());
                        toast.success("Check your inbox for a reset link.");
                      } catch {
                        toast.error(
                          "Could not send the reset email. Please check the address and try again.",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="text-[12px] text-[#71717A] transition-colors hover:text-white"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-12"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-[#71717A] transition-colors hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
              {mode === "signup" && (
                <p className="mt-1.5 text-[11.5px] text-[#71717A]">At least 6 characters.</p>
              )}
            </div>

            <button type="submit" className="mm-btn mm-btn-secondary mm-btn-block" disabled={busy}>
              {busy ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : mode === "signin" ? (
                "Continue with email"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-[#A1A1AA]">
            {mode === "signin" ? "New to MealMate?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="mt-auto pt-8 text-center text-[11px] leading-relaxed text-[#52525B]">
          By continuing, you agree to our{" "}
          <Link to="/legal/terms" className="text-[#71717A] transition-colors hover:text-white">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" className="text-[#71717A] transition-colors hover:text-white">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
