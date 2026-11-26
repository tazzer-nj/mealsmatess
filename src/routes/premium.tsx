import { createFileRoute } from "@tanstack/react-router";
import { PremiumPaywall } from "@/components/premium-paywall";
export const Route = createFileRoute("/premium")({
  validateSearch: (search: Record<string, unknown>): { manage?: "1"; promo?: string } => ({
    ...(search["manage"] === "1" || search["manage"] === true ? { manage: "1" } : {}),
    ...(typeof search["promo"] === "string" && search["promo"].trim()
      ? { promo: search["promo"].trim().toUpperCase() }
      : {}),
  }),
  head: () => ({ meta: [{ title: "MealMate Premium" }] }),
  component: PremiumPaywall,
});
