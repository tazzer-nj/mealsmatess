import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password | MealMate" },
      { name: "description", content: "Choose a new password for your MealMate account." },
      { property: "og:title", content: "Reset password | MealMate" },
      { property: "og:description", content: "Choose a new password for your MealMate account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [oobCode, setOobCode] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("oobCode");
    if (!code) return;
    void verifyPasswordResetCode(auth, code)
      .then(() => {
        setOobCode(code);
        setReady(true);
      })
      .catch(() => toast.error("This password reset link is invalid or has expired."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated. Sign in with your new password.");
      navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
    } catch {
      toast.error("Could not update your password. Please request a new reset link and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link
          to="/auth"
          search={{ mode: "signin" }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
            <KeyRound className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-2xl font-medium tracking-tight text-foreground">
            Set a new password
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {ready
              ? "Choose a strong password of at least 8 characters."
              : "Waiting for your reset link… open this page from the link in your email."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-medium">
              New password
            </Label>
            <div className="relative flex items-center">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={!ready}
                className="h-11 rounded-xl pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-[13px] font-medium">
              Confirm password
            </Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              disabled={!ready}
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-xl bg-foreground text-background hover:opacity-90"
            disabled={busy || !ready}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
