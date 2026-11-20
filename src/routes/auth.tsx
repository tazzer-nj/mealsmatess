import { useHubSurface } from "@/components/hub/hub-context";
import { createFileRoute, useNavigate, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Mail, UtensilsCrossed } from "lucide-react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthMiaStage } from "@/components/auth-mia-stage";
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
import { isHardcodedAdminEmail } from "@/lib/admin-emails";
import { adminIsAdmin } from "@/lib/premium.functions";
import {
  extractAuthErrorMessage,
  getAuthErrorMessage,
  getFirebaseErrorCode,
} from "@/lib/auth-errors";

async function resolvePostAuthRoute(email?: string | null): Promise<"/" | "/onboarding"> {
  if (isHardcodedAdminEmail(email)) return "/";
  try {
    const res = await adminIsAdmin();
    if (res?.isAdmin) return "/";
  } catch {
    // Non-admins proceed to onboarding flow check.
  }
  return "/onboarding";
}

type AuthView = "entry" | "signin" | "signup";

async function ensureUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) {
  const userRef = doc(db, "users", user.uid);
  const path = `users/${user.uid}`;
  const safeEmail = (user.email ?? "").slice(0, 254);
  const safeDisplayName = (user.displayName || user.email?.split("@")[0] || "Chef").slice(0, 100);
  const safePhotoUrl = user.photoURL && user.photoURL.length <= 2048 ? user.photoURL : "";

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existing = snap.data() as Record<string, unknown>;
      // Never overwrite user-edited onboarding goal/displayName or server-managed preference docs.
      if ("preferences" in existing || existing["goal"] || existing["displayName"]) {
        return;
      }
      await setDoc(
        userRef,
        {
          id: user.uid,
          email: safeEmail,
          displayName: safeDisplayName,
          photoURL: safePhotoUrl,
          goal: "healthy_cooking",
        },
        { merge: true },
      );
      return;
    }

    await setDoc(
      userRef,
      {
        id: user.uid,
        email: safeEmail,
        displayName: safeDisplayName,
        photoURL: safePhotoUrl,
        goal: "healthy_cooking",
        createdAt: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Missing or insufficient permissions")) {
      const errInfo = {
        error: message,
        operationType: "write",
        path,
        authInfo: {
          userId: auth.currentUser?.uid ?? null,
          email: auth.currentUser?.email ?? null,
          emailVerified: auth.currentUser?.emailVerified ?? null,
        },
      };
      console.error("Firestore Error: ", JSON.stringify(errInfo));
    }
    throw error;
  }
}

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authentication | MealMate" },
      {
        name: "description",
        content: "Sign in or create your MealMate account to discover meals and plan effortlessly.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { mode?: "signin" | "signup" } =>
    s["mode"] === "signup" ? { mode: "signup" } : s["mode"] === "signin" ? { mode: "signin" } : {},
  component: AuthLayout,
});

export function AuthLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/auth" || pathname === "/auth/" ? <AuthPage /> : <Outlet />;
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
  const [view, setView] = useState<AuthView>(search.mode ?? "entry");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [heroFailed, setHeroFailed] = useState(false);

  useEffect(() => {
    if (search.mode) {
      setView((prev) => (search.mode && search.mode !== prev ? search.mode : prev));
    }
  }, [search.mode]);

  useEffect(() => {
    let active = true;
    void getRedirectResult(auth)
      .then(async (result) => {
        if (!active || !result?.user) return;
        try {
          await ensureUserProfile(result.user);
          toast.success("Welcome to MealMate!");
          const dest = await resolvePostAuthRoute(result.user.email);
          if (active) navigate({ to: dest, replace: true });
        } catch (error) {
          console.error("[Auth] Google redirect completion failed:", error);
          toast.error("Google sign-in completed, but your profile could not be loaded.");
        }
      })
      .catch((error) => {
        const msg = getAuthErrorMessage(error, "google");
        if (!msg) return;
        console.error("[Auth] Google redirect error:", error);
        toast.error(extractAuthErrorMessage(error, msg));
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    void resolvePostAuthRoute(user.email).then((dest) => {
      if (active) navigate({ to: dest, replace: true });
    });
    return () => {
      active = false;
    };
  }, [user, loading, navigate]);

  function clearErrors() {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setFormError("");
    setResetSent(false);
  }

  function switchView(next: AuthView) {
    setView(next);
    clearErrors();
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function signInWithGoogle() {
    if (busy) return;
    setBusy(true);
    clearErrors();
    try {
      const cred = await signInWithFirebaseGoogle();
      if (cred?.user) {
        try {
          await ensureUserProfile(cred.user);
        } catch (dbErr) {
          console.warn("[Auth] Could not create Firestore profile:", dbErr);
        }
        toast.success("Welcome to MealMate!");
        const dest = await resolvePostAuthRoute(cred.user.email);
        navigate({ to: dest, replace: true });
        return;
      }
    } catch (error) {
      const errMsg = getAuthErrorMessage(error, "google");
      if (!errMsg) return;
      console.error("[Auth] Google sign-in error:", error);
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword() {
    if (busy) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter your email address above so we can send a reset link.");
      toast.error("Enter a valid email address first.");
      return;
    }
    setBusy(true);
    setEmailError("");
    setFormError("");
    try {
      await sendFirebasePasswordReset(normalizedEmail);
      setResetSent(true);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error) {
      const msg = getAuthErrorMessage(error, "reset");
      setFormError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    clearErrors();

    const normalizedEmail = email.trim().toLowerCase();
    let hasFieldError = false;

    if (view === "signup" && !displayName.trim()) {
      setNameError("Enter your name so MealMate can personalize your experience.");
      hasFieldError = true;
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter a valid email address.");
      hasFieldError = true;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasFieldError = true;
    }
    if (view === "signup" && confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      hasFieldError = true;
    }
    if (hasFieldError) return;

    setBusy(true);
    try {
      if (view === "signup") {
        try {
          const cred = await signUpWithFirebaseEmail(normalizedEmail, password, displayName.trim());
          if (cred?.user) {
            try {
              await ensureUserProfile(cred.user);
            } catch (fsErr) {
              console.warn("[Auth] Could not initialize firestore user profile:", fsErr);
            }
            try {
              await sendEmailVerification(cred.user);
              toast.message("Verification link sent. Check your inbox to activate your account.");
            } catch {
              toast.success("Welcome to MealMate!");
            }
            const dest = await resolvePostAuthRoute(cred.user.email);
            navigate({ to: dest, replace: true });
            return;
          }
        } catch (fbErr: unknown) {
          const code = getFirebaseErrorCode(fbErr);
          if (code === "auth/email-already-in-use") {
            toast.error("An account with this email already exists. Sign in instead.");
            setView("signin");
            setPassword("");
            setConfirmPassword("");
            return;
          }
          throw fbErr;
        }
        toast.success("Welcome to MealMate!");
      } else {
        const cred = await signInWithFirebaseEmail(normalizedEmail, password);
        if (cred?.user) {
          try {
            await ensureUserProfile(cred.user);
          } catch (fsErr) {
            console.warn("[Auth] Could not verify firestore user profile:", fsErr);
          }
          toast.success("Welcome back!");
          const dest = await resolvePostAuthRoute(cred.user.email);
          navigate({ to: dest, replace: true });
          return;
        }
      }
    } catch (err) {
      console.error("[Auth] submit error:", err);
      const friendly = getAuthErrorMessage(err, view === "signup" ? "signup" : "signin");
      if (friendly) {
        setFormError(friendly);
        toast.error(friendly);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className={`${isHub ? "hub-auth " : ""}auth-redesign flex h-dvh w-full items-center justify-center bg-background px-3 py-2 sm:px-6 lg:py-8 overflow-hidden`}
    >
      <div className="grid w-full max-w-[1000px] grid-cols-1 overflow-hidden rounded-[20px] border border-border bg-card shadow-sm lg:grid-cols-12 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] lg:max-h-none">
        {/* Animated Mia Mascot & Fun Fact Stage */}
        <AuthMiaStage />

        {/* Authentication Workspace */}
        <section className="flex flex-col justify-center bg-card p-4 sm:p-8 lg:col-span-6 lg:p-10 overflow-y-auto">
          <div className="mx-auto w-full max-w-[380px]">
            {view === "entry" && (
              <div key="entry" className="auth-view-enter">
                <div className="mb-8">
                  <span className="inline-block text-xs font-medium tracking-wide text-[var(--periwinkle)]">
                    MealMate Consumer
                  </span>
                  <h1 className="mt-2 text-balance text-[28px] font-medium leading-[1.16] tracking-tight text-foreground sm:text-[32px]">
                    Let&apos;s get you cooking.
                  </h1>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    Discover better meals, plan effortlessly, and make every ingredient count with
                    Mia.
                  </p>
                </div>

                {formError && (
                  <p
                    className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-center text-[13px] leading-snug text-destructive"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={signInWithGoogle}
                    className="flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-foreground px-4 text-[14px] font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <GoogleMark />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => switchView("signin")}
                    className="flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-border bg-secondary px-4 text-[14px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Continue with Email</span>
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4 border-t border-border pt-5 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => switchView("signin")}
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:text-[var(--periwinkle)] hover:underline"
                  >
                    Sign in
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => switchView("signup")}
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:text-[var(--periwinkle)] hover:underline"
                  >
                    Create account
                  </button>
                </div>
              </div>
            )}

            {(view === "signin" || view === "signup") && (
              <div key={view} className="auth-view-enter">
                <div className="mb-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => switchView("entry")}
                    disabled={busy}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 -ml-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => switchView(view === "signin" ? "signup" : "signin")}
                    className="text-xs font-medium text-[var(--periwinkle)] transition-opacity hover:opacity-80"
                  >
                    {view === "signin" ? "Create account" : "Sign in instead"}
                  </button>
                </div>

                <div className="mb-6">
                  <h1 className="text-balance text-[26px] font-medium leading-[1.18] tracking-tight text-foreground sm:text-[28px]">
                    {view === "signin" ? "Welcome back." : "Create your account."}
                  </h1>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {view === "signin"
                      ? "Your next great meal starts here."
                      : "Set up your MealMate account in seconds."}
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {view === "signup" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[13px] font-medium text-foreground">
                        Name
                      </Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          if (nameError) setNameError("");
                        }}
                        placeholder="Thabo Mokoena"
                        className="auth-input"
                        aria-invalid={!!nameError}
                        disabled={busy}
                      />
                      {nameError && (
                        <p className="text-xs leading-snug text-destructive" role="alert">
                          {nameError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[13px] font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      placeholder="you@example.com"
                      className="auth-input"
                      aria-invalid={!!emailError}
                      disabled={busy}
                    />
                    {emailError && (
                      <p className="text-xs leading-snug text-destructive" role="alert">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[13px] font-medium text-foreground">
                        Password
                      </Label>
                      {view === "signin" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleForgotPassword}
                          className="text-xs font-medium text-muted-foreground transition-colors hover:text-[var(--periwinkle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete={view === "signin" ? "current-password" : "new-password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError("");
                        }}
                        placeholder="••••••••"
                        className="auth-input auth-input-password"
                        aria-invalid={!!passwordError}
                        disabled={busy}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordError ? (
                      <p className="text-xs leading-snug text-destructive" role="alert">
                        {passwordError}
                      </p>
                    ) : (
                      view === "signup" && (
                        <p className="text-xs text-muted-foreground">Minimum 6 characters.</p>
                      )
                    )}
                  </div>

                  {view === "signup" && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="confirm-password"
                        className="text-[13px] font-medium text-foreground"
                      >
                        Confirm password
                      </Label>
                      <div className="relative flex items-center">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (confirmPasswordError) setConfirmPasswordError("");
                          }}
                          placeholder="••••••••"
                          className="auth-input auth-input-password"
                          aria-invalid={!!confirmPasswordError}
                          disabled={busy}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={
                            showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                          }
                          className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)]"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {confirmPasswordError && (
                        <p className="text-xs leading-snug text-destructive" role="alert">
                          {confirmPasswordError}
                        </p>
                      )}
                    </div>
                  )}

                  {resetSent && (
                    <p
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs leading-snug text-emerald-600 dark:text-emerald-400"
                      role="status"
                    >
                      Password reset link sent to {email.trim().toLowerCase()}. Check your inbox.
                    </p>
                  )}

                  {formError && (
                    <p
                      className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-center text-xs leading-snug text-destructive"
                      role="alert"
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-foreground px-4 text-[14px] font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>{view === "signin" ? "Sign in" : "Create account"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-muted-foreground">or</span>
                    <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={signInWithGoogle}
                    className="flex h-11 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-border bg-secondary px-4 text-[14px] font-medium text-foreground transition-colors hover:border-foreground/25 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--periwinkle)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <GoogleMark />
                    <span>Continue with Google</span>
                  </button>
                </form>
              </div>
            )}

            <footer className="mt-7 border-t border-border pt-5 text-center">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
              <nav
                aria-label="Authentication footer links"
                className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground"
              >
                <Link
                  to="/about"
                  className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                >
                  Features
                </Link>
                <span aria-hidden="true" className="text-border">
                  |
                </span>
                <Link
                  to="/legal/privacy"
                  className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                >
                  Privacy
                </Link>
                <span aria-hidden="true" className="text-border">
                  |
                </span>
                <Link
                  to="/support"
                  className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                >
                  Help
                </Link>
                <span aria-hidden="true" className="text-border">
                  |
                </span>
                <Link
                  to="/legal/terms"
                  className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                >
                  Terms
                </Link>
                <span aria-hidden="true" className="text-border">
                  |
                </span>
                <Link
                  to="/auth/founder"
                  className="font-medium text-foreground transition-colors hover:text-[var(--periwinkle)] hover:underline hover:underline-offset-4"
                >
                  Founder &amp; Company
                </Link>
              </nav>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
