import { createMiddleware, createServerOnlyFn } from "@tanstack/react-start";
import { requireFirebaseAuth } from "@/lib/firebase-auth-middleware";
import { loadFirebaseAdmin } from "@/lib/firebase-admin-access";
const billing = createServerOnlyFn(() => import("@/server/revenuecat"));
export const requirePremium = createMiddleware({ type: "function" })
  .middleware([requireFirebaseAuth])
  .server(async ({ context, next }) => {
    await (await billing()).requireActivePremium(context.userId, context.claims);
    const backend = await loadFirebaseAdmin();
    return next({
      context: {
        firebase: backend.firebaseUserDb(context.userId, { verifiedPremium: true }),
      },
    });
  });
