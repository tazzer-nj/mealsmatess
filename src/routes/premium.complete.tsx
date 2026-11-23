import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { getIntroCompletion, verifyMyPremium } from "@/lib/billing.functions";
import { MealMateLogo } from "@/components/mealmate-logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/premium/complete")({
  head: () => ({ meta: [{ title: "Subscription Confirmation | MealMate" }] }),
  component: PremiumCompletePage,
});

function PremiumCompletePage() {
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [statusParam, setStatusParam] = useState<"succeeded" | "failed" | "canceled" | "unknown">(
    "unknown",
  );
  const [verifying, setVerifying] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("status") ?? "").toLowerCase();
    if (raw === "succeeded" || raw === "failed" || raw === "canceled") {
      setStatusParam(raw);
    } else {
      setStatusParam("unknown");
    }
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setVerifying(false);
      return;
    }
    if (statusParam === "failed" || statusParam === "canceled") {
      setVerifying(false);
      return;
    }

    let cancelled = false;
    async function verifyAccess() {
      setVerifying(true);
      setErrorMessage("");
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const access = await verifyMyPremium();
          if (cancelled) return;
          if (access.isPremium) {
            queryClient.setQueryData(["entitlement", user!.id], access);
            await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
            await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user!.id] });
            setConfirmed(true);
            setVerifying(false);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          if (attempt === 3) {
            setErrorMessage(
              err instanceof Error ? err.message : "Could not verify subscription access yet.",
            );
          }
        }
        if (attempt < 3) {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      }
      if (!cancelled) setVerifying(false);
    }

    void verifyAccess();
    return () => {
      cancelled = true;
    };
  }, [sessionLoading, user, statusParam, queryClient]);

  async function continueAfterConfirm() {
    const introDone = await getIntroCompletion().catch(() => false);
    await navigate({ to: introDone ? "/" : "/welcome", replace: true });
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mb-5 flex justify-center">
          <MealMateLogo imageClassName="size-8 rounded-lg border border-border" showName />
        </div>

        {statusParam === "canceled" ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <XCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Checkout canceled</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No charge was made. Return to MealMate Premium whenever you&apos;re ready to start
              your 3-day free trial.
            </p>
            <Button className="mt-6 h-11 w-full rounded-xl" asChild>
              <Link to="/premium">Choose a plan</Link>
            </Button>
          </>
        ) : statusParam === "failed" ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Payment failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment could not be completed. Please try another payment method.
            </p>
            <Button className="mt-6 h-11 w-full rounded-xl" asChild>
              <Link to="/premium">Try again</Link>
            </Button>
          </>
        ) : verifying || sessionLoading ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--periwinkle-soft)] text-[var(--periwinkle)]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Confirming your subscription</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Verifying your MealMate Premium membership on our server…
            </p>
          </>
        ) : !user ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Sign in to confirm access</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to verify your subscription entitlement.
            </p>
            <Button className="mt-6 h-11 w-full rounded-xl" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </>
        ) : confirmed ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Welcome to MealMate Premium</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your subscription is active. Mia AI, Kitchen Scan, and Personalized Planning are now
              unlocked.
            </p>
            <Button
              className="mt-6 h-11 w-full rounded-xl"
              onClick={() => void continueAfterConfirm()}
            >
              Continue into MealMate
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Confirmation pending</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage ||
                "Your payment is still settling. Tap Check access again in a moment, or return to the paywall."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <Button className="h-11 w-full rounded-xl" onClick={() => window.location.reload()}>
                Check subscription access
              </Button>
              <Button variant="outline" className="h-11 w-full rounded-xl" asChild>
                <Link to="/premium">Back to plans</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
