import { auth, waitForFirebaseAuth } from "@/lib/firebase";
import { SESSION_REFRESHED_EVENT } from "@/hooks/use-session";
import type { PremiumAccess } from "@/server/revenuecat";

export type WhopPlanKindClient = "monthly" | "yearly" | "family" | "yearly_exit";

export type WhopCheckoutSessionResponse = {
  checkoutConfigId: string;
  returnUrl: string;
  planKind: WhopPlanKindClient;
  appliedPromo?: {
    code: string;
    percentOff: number;
    discountedPriceAmount: number;
    discountedPriceDisplay: string;
  } | null;
  plan: {
    kind: WhopPlanKindClient;
    title: string;
    price: string;
    priceAmount: number;
    period: "month" | "year";
    trialDays: number;
  };
};

async function buildAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const fbUser = auth.currentUser ?? (await waitForFirebaseAuth());
    const token = fbUser ? await fbUser.getIdToken() : undefined;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {
    // Cookie-authenticated Whop sessions work without a Bearer token
  }
  return headers;
}

export async function createWhopCheckoutSession(
  planKind: WhopPlanKindClient,
  promoCode?: string | null,
): Promise<WhopCheckoutSessionResponse> {
  const headers = await buildAuthHeaders();
  const cleanPromo = promoCode?.trim();
  const response = await fetch("/api/whop/checkout", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({
      planKind,
      ...(cleanPromo ? { promoCode: cleanPromo } : {}),
    }),
  });

  const data = (await response.json().catch(() => null)) as
    (WhopCheckoutSessionResponse & { error?: string }) | null;
  if (!response.ok || !data?.checkoutConfigId) {
    throw new Error(data?.error || "Could not start Whop checkout right now.");
  }
  return data;
}

export async function verifyWhopCheckoutCompletion(
  paymentId?: string | null,
): Promise<PremiumAccess> {
  const headers = await buildAuthHeaders();
  const response = await fetch("/api/whop/verify", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(paymentId ? { paymentId } : {}),
  });

  const data = (await response.json().catch(() => null)) as
    (PremiumAccess & { error?: string }) | null;
  if (!response.ok || !data) {
    throw new Error(data?.error || "Could not verify your subscription right now.");
  }
  return data;
}

export async function cancelWhopSubscription(): Promise<{
  cancelled: boolean;
  periodEnd: string | null;
  access: PremiumAccess;
}> {
  const headers = await buildAuthHeaders();
  const response = await fetch("/api/whop/cancel", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({}),
  });
  const data = (await response.json().catch(() => null)) as {
    cancelled?: boolean;
    periodEnd?: string | null;
    access?: PremiumAccess;
    error?: string;
  } | null;
  if (!response.ok || !data?.cancelled || !data.access) {
    throw new Error(data?.error || "Could not cancel your Whop subscription right now.");
  }
  return {
    cancelled: true,
    periodEnd: data.periodEnd ?? null,
    access: data.access,
  };
}

export async function startWhopOAuthSignIn(returnTo = "/onboarding"): Promise<void> {
  if (typeof window === "undefined") return;

  const isIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const query = new URLSearchParams({
    returnTo,
    ...(isIframe ? { mode: "json", popup: "1" } : {}),
  });

  if (!isIframe) {
    window.location.assign(`/api/auth/whop?${query.toString()}`);
    return;
  }

  const res = await fetch(`/api/auth/whop?${query.toString()}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const payload = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!res.ok || !payload?.url) {
    throw new Error(payload?.error || "Whop sign-in is unavailable right now.");
  }

  const width = 520;
  const height = 680;
  const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
  const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
  const popup = window.open(
    payload.url,
    "mealmate_whop_oauth",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );

  if (!popup) {
    // Fallback to top-level redirect if popup was blocked
    window.location.assign(payload.url);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const pollClosed = window.setInterval(() => {
      if (popup.closed && !settled) {
        settled = true;
        cleanup();
        window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT));
        resolve();
      }
    }, 350);

    function cleanup() {
      window.clearInterval(pollClosed);
      window.removeEventListener("message", onMessage);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const msg = event.data as { type?: string; ok?: boolean; error?: string } | null;
      if (!msg || msg.type !== "mealmate:whop-auth") return;
      if (settled) return;
      settled = true;
      cleanup();
      if (msg.ok) {
        window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT));
        resolve();
      } else {
        reject(new Error(msg.error || "Whop sign-in was cancelled or failed."));
      }
    }

    window.addEventListener("message", onMessage);
  });
}
