import { useMemo, useState } from "react";
import { loadWhop } from "@whop/elements";
import { Checkout, CheckoutElement, WhopElements } from "@whop/elements-react";
import { Loader2, Lock, X } from "lucide-react";

type WhopCheckoutSheetProps = {
  checkoutConfigId: string;
  returnUrl: string;
  planTitle: string;
  priceLabel: string;
  trialDays: number;
  buyerEmail?: string | null;
  appliedPromo?: {
    code: string;
    percentOff: number;
  } | null;
  onClose: () => void;
  onComplete: (paymentId: string, receiptStatus?: string) => void | Promise<void>;
};

export function WhopCheckoutSheet({
  checkoutConfigId,
  returnUrl,
  planTitle,
  priceLabel,
  trialDays,
  buyerEmail,
  appliedPromo,
  onClose,
  onComplete,
}: WhopCheckoutSheetProps) {
  const [completing, setCompleting] = useState(false);

  const elements = useMemo(() => {
    if (typeof window === "undefined") return null;
    return loadWhop();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whop-checkout-title"
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/15 bg-[#0b1120] text-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="whop-checkout-title" className="truncate text-base font-semibold text-white">
                {planTitle}
              </h2>
              {appliedPromo && (
                <span className="inline-flex items-center rounded-md border border-emerald-400/35 bg-emerald-400/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">
                  {appliedPromo.code} · {appliedPromo.percentOff}% OFF
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
              <Lock className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
              <span>
                {trialDays > 0 ? `${trialDays}-day free trial · Then ${priceLabel}` : priceLabel}
              </span>
            </p>
          </div>

          <button
            type="button"
            aria-label="Close checkout"
            onClick={onClose}
            disabled={completing}
            className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-[#111a2e] text-slate-300 transition-colors hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {completing ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#818cf8]" />
              <p className="text-sm font-medium text-white">Confirming your subscription…</p>
              <p className="text-xs text-slate-400">Verifying your access with MealMate servers.</p>
            </div>
          ) : elements ? (
            <WhopElements elements={elements}>
              <Checkout
                key={checkoutConfigId}
                checkoutConfiguration={checkoutConfigId}
                returnUrl={returnUrl}
                onComplete={(payload) => {
                  const paymentId = payload.result === "payment" ? payload.paymentId : "";
                  setCompleting(true);
                  void Promise.resolve(onComplete(paymentId, payload.result)).finally(() => {
                    setCompleting(false);
                  });
                }}
                fallback={
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-300">
                    <Loader2 className="h-4 w-4 animate-spin text-[#818cf8]" />
                    <span>Loading secure checkout…</span>
                  </div>
                }
              >
                <CheckoutElement buyerEmail={buyerEmail ?? undefined} />
              </Checkout>
            </WhopElements>
          ) : (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-[#818cf8]" />
              <span>Preparing checkout…</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
