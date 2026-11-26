import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { verifyWhopCheckoutCompletion } from "@/lib/whop-client";
import { getIntroCompletion } from "@/lib/billing.functions";
import { MealMateLogo } from "@/components/mealmate-logo";

export const Route = createFileRoute("/premium/complete")({
  head: () => ({ meta: [{ title: "Checkout Status | MealMate Premium" }] }),
  validateSearch: (s: Record<string, unknown>): { status?: string; payment?: string } => ({
    status: typeof s["status"] === "string" ? s["status"] : undefined,
    payment: typeof s["payment"] === "string" ? s["payment"] : undefined,
  }),
  component: PremiumCompletePage,
});

type ViewState = "verifying" | "succeeded" | "pending" | "failed" | "canceled";

function PremiumCompletePage() {
  const search = Route.useSearch();
  const { user, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const statusParam = (search.status ?? "").toLowerCase();
  const paymentId = search.payment ?? null;

  const [viewState, setViewState] = useState<ViewState>(() => {
    if (statusParam === "canceled") return "canceled";
    if (statusParam === "failed") return "failed";
    return "verifying";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  async function verifyAccess() {
    setRetrying(true);
    setErrorMessage(null);
    setViewState("verifying");
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const access = await verifyWhopCheckoutCompletion(paymentId);
        if (access.isPremium) {
          if (user?.id) {
            queryClient.setQueryData(["entitlement", user.id], access);
            await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
            await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
          }
          setViewState("succeeded");
          return;
        }
        if (attempt < 2) {
          await new Promise((r) => window.setTimeout(r, 1200));
        }
      }
      setViewState("pending");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Could not verify your subscription right now.",
      );
      setViewState("pending");
    } finally {
      setRetrying(false);
    }
  }

  useEffect(() => {
    if (statusParam === "canceled") {
      setViewState("canceled");
      return;
    }
    if (statusParam === "failed") {
      setViewState("failed");
      return;
    }
    if (sessionLoading) return;
    if (!user) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    if (statusParam === "succeeded" || paymentId) {
      void verifyAccess();
    } else {
      setViewState("pending");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, paymentId, sessionLoading, user?.id]);

  async function continueToApp() {
    const introDone = await getIntroCompletion().catch(() => false);
    await navigate({ to: introDone ? "/" : "/welcome", replace: true });
  }

  return (
    <main className="premium-gate min-h-dvh bg-background px-4 py-12 text-foreground">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mb-5 flex justify-center">
          <MealMateLogo showName />
        </div>

        {viewState === "verifying" && (
          <div className="space-y-3 py-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Confirming your subscription</h1>
            <p className="text-sm text-muted-foreground">
              We&apos;re verifying your payment with Whop and unlocking MealMate Premium.
            </p>
          </div>
        )}

        {viewState === "succeeded" && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to MealMate Premium</h1>
            <p className="text-sm text-muted-foreground">
              Your subscription is active. Enjoy unlimited Mia AI coaching, kitchen scanning, and
              smart meal planning.
            </p>
            <button
              type="button"
              onClick={() => void continueToApp()}
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Continue into MealMate
            </button>
          </div>
        )}

        {viewState === "canceled" && (
          <div className="space-y-4 py-4">
            <XCircle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="text-2xl font-semibold tracking-tight">Checkout canceled</h1>
            <p className="text-sm text-muted-foreground">
              You weren&apos;t charged. Return to choose a plan whenever you&apos;re ready to start
              your 3-day free trial.
            </p>
            <Link
              to="/premium"
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Return to plans
            </Link>
          </div>
        )}

        {viewState === "failed" && (
          <div className="space-y-4 py-4">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="text-2xl font-semibold tracking-tight">Payment failed</h1>
            <p className="text-sm text-muted-foreground">
              Your payment method could not be charged and your subscription wasn&apos;t activated.
            </p>
            <Link
              to="/premium"
              className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90"
            >
              Try another payment method
            </Link>
          </div>
        )}

        {viewState === "pending" && (
          <div className="space-y-4 py-4">
            <RefreshCw className="mx-auto h-9 w-9 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              Waiting for subscription confirmation
            </h1>
            <p className="text-sm text-muted-foreground">
              {errorMessage ||
                "If you just finished checkout, it can take a moment for confirmation to arrive."}
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                disabled={retrying}
                onClick={() => void verifyAccess()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {retrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Check subscription access"
                )}
              </button>
              <Link
                to="/premium"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-secondary px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Back to plans
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
