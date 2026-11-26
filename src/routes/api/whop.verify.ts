import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticateApiRequest } from "@/server/authenticated-api";
import { assertBillingOrigin, verifyAccountAccess } from "@/server/revenuecat";
import { verifyAndActivateWhopCheckout } from "@/server/whop";

const VerifySchema = z
  .object({
    paymentId: z.string().trim().min(1).max(128).optional(),
  })
  .optional();

export const Route = createFileRoute("/api/whop/verify")({
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

        let input: z.infer<typeof VerifySchema>;
        try {
          const raw = await request.text();
          input = raw ? VerifySchema.parse(JSON.parse(raw)) : undefined;
        } catch {
          return Response.json({ error: "Invalid verification payload." }, { status: 400 });
        }

        try {
          const whopVerified = await verifyAndActivateWhopCheckout({
            userId: auth.user.userId,
            paymentId: input?.paymentId ?? null,
            whopUserId: auth.user.whopUserId ?? null,
          });
          const access = whopVerified.isPremium
            ? whopVerified
            : await verifyAccountAccess(auth.user.userId, undefined, {
                email: auth.user.email ?? null,
                whopUserId: auth.user.whopUserId ?? null,
              });

          const headers = new Headers({
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          });
          if (auth.refreshedSetCookie) {
            headers.append("Set-Cookie", auth.refreshedSetCookie);
          }

          return new Response(JSON.stringify(access), { status: 200, headers });
        } catch (error) {
          console.error("[Whop Verify] Subscription verification error:", error);
          return Response.json(
            { error: "Subscription verification is temporarily unavailable." },
            { status: 503 },
          );
        }
      },
    },
  },
});
