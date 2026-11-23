import { createFileRoute } from "@tanstack/react-router";
import { processWhopWebhookEvent, unwrapWhopWebhookEvent } from "@/server/whop";

export const Route = createFileRoute("/api/webhooks/whop")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(process.env["WHOP_WEBHOOK_SECRET"] ?? "").trim()) {
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const rawBody = await request.text();
        let event: { id?: string; type?: string; action?: string; data?: Record<string, unknown> };
        try {
          event = unwrapWhopWebhookEvent<typeof event>(rawBody, request.headers);
        } catch (error) {
          console.warn(
            "[Whop Webhook] Signature verification failed:",
            error instanceof Error ? error.message : String(error),
          );
          return new Response("Invalid webhook signature", { status: 401 });
        }

        try {
          const result = await processWhopWebhookEvent(event, request.headers.get("webhook-id"));
          return new Response(result.body, { status: result.status });
        } catch (error) {
          console.error(
            "[Whop Webhook] Processing error:",
            error instanceof Error ? error.message : String(error),
          );
          return new Response("Webhook processing failed", { status: 500 });
        }
      },
    },
  },
});
