import { useHubSurface } from "@/components/hub/hub-context";
import { createFileRoute, useNavigate, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
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
      { title: "Authentication — MealMate" },
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

/** Google's brand button: official look, single primary entry point. */
function GoogleSignInButton({ busy, onClick }: { busy: boolean; onClick: () => void }) {
  return (
    <button type="button" className="auth-google" disabled={busy} onClick={onClick}>
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
      {busy ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : "Continue with Google"}
    </button>
  );
}

export function AuthLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/auth" || pathname === "/auth/" ? <AuthPage /> : <Outlet />;
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
    <main className={isHub ? "hub-auth auth-redesign" : "auth-redesign"}>
      <div className="auth-ambient" aria-hidden="true" />
      <div className="auth-shell">
        <header className="auth-brand">
          <MealMateLogo className="auth-logo" imageClassName="size-12 rounded-2xl" showName />
        </header>

        {/* Hero Visual Banner */}
        <div className="auth-hero-banner" aria-hidden="true">
          <RecipeImage recipe={{ name: "Creamy chicken alfredo" }} size="hero" priority />
          <div className="auth-hero-overlay">
            <span className="auth-hero-pill">
              <Sparkles size={13} className="text-periwinkle" />
              <span>Taste Intelligence</span>
            </span>
          </div>
        </div>

        <div className="auth-card">
          <p className="auth-eyebrow">Discover. Plan. Eat. Enjoy.</p>
          <h1 className="auth-tagline">Welcome to MealMate.</h1>
          <p className="auth-subtagline">Your next favourite meal starts here.</p>

          <GoogleSignInButton busy={busy} onClick={signInWithGoogle} />

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <div className="auth-mode-toggle">
            <button
              type="button"
              className={mode === "signin" ? "active" : ""}
              onClick={() => setMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "signup" && (
              <div className="auth-field">
                <Label htmlFor="name">Preferred name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Chef Thabo"
                  className="auth-input"
                  disabled={busy}
                />
              </div>
            )}
            <div className="auth-field">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
                disabled={busy}
              />
            </div>
            <div className="auth-field">
              <Label htmlFor="password">Password</Label>
              <div className="auth-password-wrap">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input auth-input-password"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="auth-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && <p className="auth-hint">At least 6 characters.</p>}
            </div>

            <button type="submit" className="auth-primary" disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signin" ? (
                "Continue with Email"
              ) : (
                "Create Account with Email"
              )}
            </button>

            {mode === "signin" && (
              <button
                type="button"
                className="auth-forgot"
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
              >
                Forgot password?
              </button>
            )}
          </form>

          <p className="auth-legal">
            By continuing, you agree to our{" "}
            <Link to="/legal/terms">Terms</Link> and{" "}
            <Link to="/legal/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
