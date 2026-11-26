import { createFileRoute } from "@tanstack/react-router";
import { authenticateApiRequest } from "@/server/authenticated-api";
import { assertBillingOrigin } from "@/server/revenuecat";
import { cancelWhopMembershipForUser, isWhopBillingConfigured } from "@/server/whop";

export const Route = createFileRoute("/api/whop/cancel")({
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
            { error: "Whop subscription cancellation is not configured on this server." },
            { status: 503 },
          );
        }

        try {
          const result = await cancelWhopMembershipForUser(auth.user.userId);
          return Response.json(result, {
            status: 200,
            headers: { "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("[Whop Cancel] Failed to cancel membership:", error);
          const msg =
            error instanceof Error && error.message
              ? error.message
              : "Could not cancel your Whop subscription right now. Try again or manage via Whop.";
          return Response.json({ error: msg }, { status: 400 });
        }
      },
    },
  },
});
