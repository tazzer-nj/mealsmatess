import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import {
  MIA_STUCK_LOADING_DELAY_MS,
  MiaLoadingCard,
  useHasInlineMiaLoadingCard,
} from "@/components/mia-loading-card";

/**
 * Automatically surfaces Mia with rotating culinary fun facts and 20% off for 2
 * perks only when loading persists for 2 minutes or more without clearing.
 */
export function GlobalLoadingCompanion() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const routerLoading = useRouterState({ select: (s) => s.isLoading });
  const hasInline = useHasInlineMiaLoadingCard();
  const busy = fetching > 0 || mutating > 0 || routerLoading;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!busy) setDismissed(false);
  }, [busy]);

  if (!busy || dismissed || hasInline) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(var(--app-nav-h,4.25rem)+16px)] z-40 mx-auto max-w-md sm:left-auto sm:right-20 sm:mx-0">
      <MiaLoadingCard
        active={busy}
        delayMs={MIA_STUCK_LOADING_DELAY_MS}
        variant="floating"
        onDismiss={() => setDismissed(true)}
        className="pointer-events-auto"
      />
    </div>
  );
}
