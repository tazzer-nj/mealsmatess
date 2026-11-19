import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";

const WEBHOOK_SECRET = "whsec_KRgjM91pPZEGt01YLQALNoI59EcgOYfi";

export const Route = createFileRoute("/api/webhooks/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signatureHeader =
          request.headers.get("x-signature") ||
          request.headers.get("x-webhook-signature") ||
          request.headers.get("x-hub-signature-256") ||
          request.headers.get("svix-signature") ||
          request.headers.get("authorization")?.replace(/^bearer\s+/i, "") ||
          "";

        if (signatureHeader && WEBHOOK_SECRET) {
          const expectedHmac = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
          const cleanSig = signatureHeader.replace(/^sha256=/i, "").trim();
          try {
            const a = Buffer.from(cleanSig, "hex");
            const b = Buffer.from(expectedHmac, "hex");
            if (a.length === b.length && a.length > 0 && timingSafeEqual(a, b)) {
              // Signature verified successfully
            } else if (cleanSig !== WEBHOOK_SECRET) {
              return new Response("Invalid signature", { status: 401 });
            }
          } catch {
            if (cleanSig !== WEBHOOK_SECRET) {
              return new Response("Invalid signature format", { status: 401 });
            }
          }
        }

        let eventPayload: { event?: string; type?: string; data?: unknown; [key: string]: unknown };
        try {
          eventPayload = JSON.parse(rawBody) as typeof eventPayload;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const eventType = eventPayload.event || eventPayload.type || "unknown";
        console.log(`[Contact Webhook] Received event: ${eventType}`, eventPayload);

        return new Response(JSON.stringify({ received: true, event: eventType }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => {
        return new Response(
          JSON.stringify({ status: "active", endpoint: "/api/webhooks/contact" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
