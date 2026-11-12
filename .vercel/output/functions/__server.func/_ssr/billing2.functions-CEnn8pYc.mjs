import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing2.functions-CEnn8pYc.js
var createPurchaseSession = createServerFn({ method: "POST" }).handler(createSsrRpc("bfbacec853c98f66cb43b3b500ca1b9ce802b6eec24246d6a728c748beede897"));
var verifyCheckout = createServerFn({ method: "POST" }).handler(createSsrRpc("f0b9df10baeca915f1693d3b226975f2c9c3f4178bcb64a0e41b1524364ad743"));
var verifyMyPremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("52a224bc104992aede1f5fe78be19777a7bf043111316dd47b2b91636ceb9e47"));
/** Redeem a lifetime promo code or VIP email code. Requires sign-in. */
var redeemPromoCode = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ code: stringType().trim().min(1).max(120) }).parse(value)).handler(createSsrRpc("9134b21fd113e4c4106e714f640652a3e1c3fdee1da68b8ac4bc3bab5787a0cd"));
var getIntroCompletion = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("cd199f59356be6ba5af24778eb595d9e5b39295ceeed9f38d2cc08abffeda819"));
var completeIntro = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("4897050e3c43a0df8e1ab703461bd8e13d31247792685dbe116be4acea975ccf"));
//#endregion
export { verifyCheckout as a, redeemPromoCode as i, createPurchaseSession as n, verifyMyPremium as o, getIntroCompletion as r, completeIntro as t };
