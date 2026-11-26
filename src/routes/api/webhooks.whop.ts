import { createFileRoute } from "@tanstack/react-router";
import { unwrapWebhook } from "@whop/sdk/helpers";
import {
  extractWhopEventTimestampIso,
  grantWhopPremiumAccess,
  resolveMealMateUserIdFromWhopPayload,
  revokeWhopPremiumAccess,
} from "@/server/whop";

type WhopWebhookEnvelope = {
  id?: string;
  type?: string;
  api_version?: string;
  timestamp?: string;
  account_id?: string;
  data?: Record<string, unknown>;
};

const ACTIVATION_EVENTS = new Set([
  "payment.succeeded",
  "app_payment.succeeded",
  "membership.created",
  "membership.activated",
  "membership.went_valid",
  "app_membership.went_valid",
  "invoice.paid",
  "setup_intent.succeeded",
]);

const REVOCATION_EVENTS = new Set([
  "membership.deactivated",
  "membership.went_invalid",
  "app_membership.went_invalid",
  "membership.canceled",
  "membership.cancelled",
  "membership.expired",
  "refund.created",
  "payment.refunded",
  "invoice.voided",
  "invoice.marked_uncollectible",
]);

export const Route = createFileRoute("/api/webhooks/whop")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const webhookSecret = (process.env["WHOP_WEBHOOK_SECRET"] ?? "").trim();
        if (!webhookSecret) {
          return Response.json(
            { error: "WHOP_WEBHOOK_SECRET is not configured." },
            { status: 500 },
          );
        }

        const rawBody = await request.text();
        let event: WhopWebhookEnvelope;
        try {
          event = unwrapWebhook<WhopWebhookEnvelope>(rawBody, {
            headers: Object.fromEntries(request.headers),
            key: webhookSecret,
          });
        } catch (error) {
          console.warn("[Whop Webhook] Signature verification failed:", error);
          return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
        }

        const eventType = String(event?.type ?? "").trim();
        const eventId = String(event?.id ?? "").trim();
        const data = (event?.data ?? {}) as Record<string, unknown>;

        if (!eventType) {
          return Response.json({ error: "Missing webhook event type." }, { status: 400 });
        }

        const userId = await resolveMealMateUserIdFromWhopPayload(data);
        if (!userId) {
          return Response.json({ received: true, skipped: "no_matching_user" }, { status: 200 });
        }

        const { firebaseAdmin } = await import("@/server/firebase-admin");
        const safeEventId = (eventId || `whop_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");

        if (eventId) {
          const { data: existingEvent } = await firebaseAdmin
            .from("subscription_events")
            .select("id,processed")
            .eq("rc_event_id", safeEventId)
            .maybeSingle();
          if (existingEvent && existingEvent.processed !== false) {
            return Response.json({ received: true, duplicate: true }, { status: 200 });
          }
          await firebaseAdmin.from("subscription_events").insert({
            user_id: userId,
            event_type: eventType,
            source: "whop",
            rc_event_id: safeEventId,
            payload: JSON.parse(JSON.stringify(event)),
            processed: false,
            claimed_at: new Date().toISOString(),
          });
        }

        const userObj =
          data["user"] && typeof data["user"] === "object"
            ? (data["user"] as Record<string, unknown>)
            : null;
        const planObj =
          data["plan"] && typeof data["plan"] === "object"
            ? (data["plan"] as Record<string, unknown>)
            : null;
        const membershipObj =
          data["membership"] && typeof data["membership"] === "object"
            ? (data["membership"] as Record<string, unknown>)
            : null;
        const metadata =
          data["metadata"] && typeof data["metadata"] === "object"
            ? (data["metadata"] as Record<string, unknown>)
            : null;

        const whopUserId =
          typeof data["user_id"] === "string"
            ? data["user_id"]
            : typeof userObj?.["id"] === "string"
              ? userObj["id"]
              : null;
        const membershipId =
          eventType.startsWith("membership.") || eventType.startsWith("app_membership.")
            ? typeof data["id"] === "string"
              ? data["id"]
              : null
            : typeof data["membership_id"] === "string"
              ? data["membership_id"]
              : typeof membershipObj?.["id"] === "string"
                ? membershipObj["id"]
                : null;
        const paymentId =
          eventType.startsWith("payment.") || eventType.startsWith("app_payment.")
            ? typeof data["id"] === "string"
              ? data["id"]
              : null
            : typeof data["payment_id"] === "string"
              ? data["payment_id"]
              : null;
        const planId =
          typeof data["variant_id"] === "string"
            ? data["variant_id"]
            : typeof planObj?.["id"] === "string"
              ? planObj["id"]
              : null;
        const planKind = typeof metadata?.["plan_kind"] === "string" ? metadata["plan_kind"] : null;
        const periodEnd = extractWhopEventTimestampIso(
          data["current_period_end"] ??
            data["renewal_period_end"] ??
            membershipObj?.["current_period_end"] ??
            membershipObj?.["renewal_period_end"] ??
            data["expires_at"],
        );

        if (ACTIVATION_EVENTS.has(eventType)) {
          const rawStatus = String(
            data["status"] ?? membershipObj?.["status"] ?? "active",
          ).toLowerCase();
          const isTrial = rawStatus === "trialing";
          const totalObj =
            data["total"] && typeof data["total"] === "object"
              ? (data["total"] as { amount?: unknown })
              : null;
          const amount =
            typeof data["total"] === "number"
              ? data["total"]
              : typeof totalObj?.["amount"] === "string"
                ? Number.parseFloat(totalObj["amount"]) || null
                : typeof data["final_amount"] === "number"
                  ? data["final_amount"]
                  : null;
          const currency = typeof data["currency"] === "string" ? data["currency"] : "USD";

          await grantWhopPremiumAccess({
            userId,
            whopUserId,
            membershipId,
            paymentId,
            planId,
            planKind,
            status: isTrial ? "trialing" : "active",
            periodEnd,
            trialEnd: isTrial ? periodEnd : null,
            autoRenew: data["cancel_at_period_end"] !== true,
            amount,
            currency,
            eventId: eventId || null,
          });

          const promoId = typeof metadata?.["promo_id"] === "string" ? metadata["promo_id"] : null;
          const promoCode =
            typeof metadata?.["promo_code"] === "string" ? metadata["promo_code"] : null;
          const promoPct = Number(metadata?.["promo_percent_off"] ?? 0) || 0;
          if (promoId && promoCode) {
            const { recordPromoRedemptionIfNeeded } = await import("@/server/promo");
            await recordPromoRedemptionIfNeeded({
              promoId,
              userId,
              code: promoCode,
              rewardKind: "percent_discount",
              percentOff: promoPct,
            }).catch(() => undefined);
          }
        } else if (REVOCATION_EVENTS.has(eventType)) {
          const isExpired = eventType.includes("expired");
          await revokeWhopPremiumAccess({
            userId,
            whopUserId,
            membershipId,
            reasonStatus: isExpired ? "expired" : "cancelled",
            periodEnd,
          });
        } else if (
          eventType === "membership.cancel_at_period_end_changed" ||
          eventType === "app_membership.cancel_at_period_end_changed"
        ) {
          const canceledAtPeriodEnd = data["cancel_at_period_end"] === true;
          if (canceledAtPeriodEnd) {
            await revokeWhopPremiumAccess({
              userId,
              whopUserId,
              membershipId,
              reasonStatus: "cancelled",
              cancelAtPeriodEndOnly: Boolean(periodEnd),
              periodEnd,
            });
          } else {
            await grantWhopPremiumAccess({
              userId,
              whopUserId,
              membershipId,
              planId,
              planKind,
              periodEnd,
              autoRenew: true,
            });
          }
        }

        if (eventId) {
          await firebaseAdmin
            .from("subscription_events")
            .update({ processed: true, completed_at: new Date().toISOString() })
            .eq("rc_event_id", safeEventId);
        }

        return Response.json({ received: true, event: eventType }, { status: 200 });
      },
    },
  },
});
