import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticateApiRequest } from "@/server/authenticated-api";
import { assertBillingOrigin } from "@/server/revenuecat";
import {
  createWhopCheckoutConfig,
  isWhopBillingConfigured,
  type WhopPlanKind,
} from "@/server/whop";
import { resolveRequestOrigin } from "@/server/whop-session";

import { PromoValidationError } from "@/server/promo";

const CheckoutBodySchema = z.object({
  planKind: z.enum(["monthly", "yearly", "family", "yearly_exit"]),
  promoCode: z.string().trim().min(2).max(40).optional(),
});

export const Route = createFileRoute("/api/whop/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          assertBillingOrigin(request);
        } catch (err) {
          if (err instanceof Response) return err;
          throw err;
        }

        const auth = await authenticateApiRequest(request, { allowFreeTier: true });
        if ("response" in auth) return auth.response;

        if (!isWhopBillingConfigured()) {
          return Response.json(
            {
              error:
                "Whop checkout is not configured yet. Add WHOP_API_KEY and WHOP_ACCOUNT_ID to Vercel environment variables.",
            },
            { status: 503 },
          );
        }

        let input: z.infer<typeof CheckoutBodySchema>;
        try {
          const raw = await request.text();
          if (raw.length > 4096) {
            return Response.json({ error: "Request is too large." }, { status: 413 });
          }
          input = CheckoutBodySchema.parse(JSON.parse(raw));
        } catch {
          return Response.json({ error: "Choose a valid subscription plan." }, { status: 400 });
        }

        try {
          const origin = resolveRequestOrigin(request);
          const created = await createWhopCheckoutConfig({
            userId: auth.user.userId,
            planKind: input.planKind,
            origin,
            whopUserId: auth.user.whopUserId ?? null,
            customerEmail: auth.user.email ?? null,
            promoCode: input.promoCode ?? null,
          });

          const headers = new Headers({
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          });
          if (auth.refreshedSetCookie) {
            headers.append("Set-Cookie", auth.refreshedSetCookie);
          }

          return new Response(
            JSON.stringify({
              checkoutConfigId: created.id,
              returnUrl: created.returnUrl,
              planKind: created.plan.kind,
              appliedPromo: created.appliedPromo,
              plan: {
                kind: created.plan.kind,
                title: created.plan.title,
                price: created.plan.priceDisplay,
                priceAmount: created.plan.priceAmount,
                period: created.plan.periodLabel,
                trialDays: created.plan.trialPeriodDays,
              },
            }),
            { status: 200, headers },
          );
        } catch (error) {
          if (error instanceof PromoValidationError) {
            return Response.json({ error: error.message }, { status: 400 });
          }
          console.error("[Whop Checkout] Failed to create checkout configuration:", error);
          return Response.json(
            { error: "Could not initialize checkout right now. Please try again." },
            { status: 502 },
          );
        }
      },
    },
  },
});
