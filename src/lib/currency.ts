// Centralised pricing service. All prices flow through here so a currency
// change instantly propagates everywhere in the UI.

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { firebaseData } from "@/lib/firebase-data";
import { useSession } from "@/hooks/use-session";
import { auth } from "@/lib/firebase";
import { getMyAccountSettings, saveMyAccountSettings } from "@/lib/account.functions";

export type CurrencyCode = "USD" | "ZAR" | "EUR" | "GBP" | "AUD" | "CAD" | "NZD";

export const CURRENCY_META: Record<CurrencyCode, { symbol: string; locale: string; name: string }> =
  {
    USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
    ZAR: { symbol: "R", locale: "en-ZA", name: "South African Rand" },
    EUR: { symbol: "€", locale: "en-IE", name: "Euro" },
    GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
    AUD: { symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
    CAD: { symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
    NZD: { symbol: "NZ$", locale: "en-NZ", name: "New Zealand Dollar" },
  };

// Static FX rates from USD. Live rates can replace this map later without
// touching any component code.
const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  ZAR: 18.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.52,
  CAD: 1.36,
  NZD: 1.65,
};

// Master price list — USD is canonical. RevenueCat / store products map
// to these keys.
export const PRICES_USD = {
  premium_monthly: 7.99,
  premium_annual: 74.99,
  family_monthly: 12.99,
  family_annual: 99.99,
  referral_reward_days: 14,
} as const;
export type PriceKey = keyof typeof PRICES_USD;

export const PRICES_ZAR: Record<PriceKey, number> = {
  premium_monthly: 189.0,
  premium_annual: 1399.0,
  family_monthly: 249.0,
  family_annual: 1899.0,
  referral_reward_days: 14,
};

export function convertFromUsd(amountUsd: number, to: CurrencyCode): number {
  const rate = USD_RATES[to] ?? 1;
  return amountUsd * rate;
}

export function formatPrice(
  amountUsd: number,
  currency: CurrencyCode,
  priceKey?: PriceKey,
): string {
  if (currency === "ZAR") {
    const val =
      priceKey && PRICES_ZAR[priceKey] ? PRICES_ZAR[priceKey] : convertFromUsd(amountUsd, "ZAR");
    return `R ${Math.round(val)}`;
  }
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.USD;
  const value = convertFromUsd(amountUsd, currency);
  try {
    return new Intl.NumberFormat(meta.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${meta.symbol} ${value.toFixed(2)}`;
  }
}

export function price(key: PriceKey, currency: CurrencyCode): string {
  return formatPrice(PRICES_USD[key], currency, key);
}

const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD",
  ZA: "ZAR",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  PT: "EUR",
  AT: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
  AU: "AUD",
  CA: "CAD",
  NZ: "NZD",
};

export function detectCurrency(): CurrencyCode {
  if (typeof navigator === "undefined") return "ZAR";
  const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  if (tz.includes("Johannesburg") || locale.toLowerCase().includes("za")) return "ZAR";
  const region = locale.split("-")?.[1]?.toUpperCase() ?? "";
  return REGION_CURRENCY[region] ?? "ZAR";
}

// ---- Hook: single source of truth for the user's active currency ----
export function useCurrency(): {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => Promise<void>;
} {
  const { user } = useSession();
  const [currency, setCurrencyState] = useState<CurrencyCode>("ZAR");

  const { data } = useQuery({
    queryKey: ["currency", user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (auth.currentUser) {
        const { data } = await firebaseData
          .from("profiles")
          .select("currency")
          .eq("id", user!.id)
          .maybeSingle();
        return (data as { currency?: string } | null)?.currency ?? null;
      }
      const settings = await getMyAccountSettings().catch(() => null);
      return settings?.currency ?? null;
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let stored: CurrencyCode | null = null;
    try {
      stored = window.localStorage.getItem("mealmate-currency") as CurrencyCode | null;
    } catch {
      stored = null;
    }
    const next = (data as CurrencyCode | null) ?? stored ?? detectCurrency();
    setCurrencyState(next);
  }, [data]);

  async function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("mealmate-currency", next);
      } catch {
        // Ignore storage errors in restricted WebViews
      }
      window.dispatchEvent(new CustomEvent("mealmate-currency-changed", { detail: next }));
    }
    if (user) {
      if (auth.currentUser) {
        await firebaseData
          .from("profiles")
          .upsert({ id: user.id, currency: next } as never, { onConflict: "id" });
      } else {
        await saveMyAccountSettings({ data: { currency: next } }).catch(() => undefined);
      }
    }
  }

  // Cross-component reactivity when currency changes without React state.
  useEffect(() => {
    function onChange(e: Event) {
      const d = (e as CustomEvent<CurrencyCode>).detail;
      if (d) setCurrencyState(d);
    }
    window.addEventListener("mealmate-currency-changed", onChange);
    return () => window.removeEventListener("mealmate-currency-changed", onChange);
  }, []);

  return { currency, setCurrency };
}
