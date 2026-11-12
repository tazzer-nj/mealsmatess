import { b as setCookie$1, d as getCookie, f as getRequest, l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/billing.functions-BjevPJH9.js
var billing = () => import("./revenuecat-C1ChHDlc.mjs");
var COOKIE = "mealmate_purchase";
var createPurchaseSession_createServerFn_handler = createServerRpc({
	id: "bfbacec853c98f66cb43b3b500ca1b9ce802b6eec24246d6a728c748beede897",
	name: "createPurchaseSession",
	filename: "src/lib/billing.functions.ts"
}, (opts) => createPurchaseSession.__executeServer(opts));
var createPurchaseSession = createServerFn({ method: "POST" }).handler(createPurchaseSession_createServerFn_handler, async () => {
	let userId;
	const authorization = getRequest().headers.get("authorization");
	if (authorization) {
		const match = /^Bearer\s+(.+)$/i.exec(authorization);
		if (!match) throw new Response("Unauthorized", { status: 401 });
		try {
			userId = (await (await loadFirebaseAdmin()).verifyFirebaseIdToken(match[1])).uid;
		} catch {
			throw new Response("Unauthorized", { status: 401 });
		}
	}
	const service = await billing();
	service.assertBillingOrigin(getRequest());
	const identity = await service.purchaseIdentity(getCookie(COOKIE), userId);
	if (identity.token) setCookie$1(COOKIE, identity.token, {
		httpOnly: true,
		sameSite: "lax",
		secure: getRequest().url.startsWith("https:"),
		path: "/",
		maxAge: 7776e3
	});
	let isActive = (await service.verifyRevenueCatCustomer(identity.customerId)).isPremium;
	if (!isActive && userId) isActive = (await service.verifyAccountAccess(userId, getCookie(COOKIE))).isPremium;
	return {
		appUserId: identity.customerId,
		offering: service.OFFERING,
		isActive,
		webApiKey: process.env["REVENUECAT_WEB_PUBLIC_KEY"] ?? null,
		androidApiKey: process.env["REVENUECAT_ANDROID_PUBLIC_KEY"] ?? null
	};
});
var verifyCheckout_createServerFn_handler = createServerRpc({
	id: "f0b9df10baeca915f1693d3b226975f2c9c3f4178bcb64a0e41b1524364ad743",
	name: "verifyCheckout",
	filename: "src/lib/billing.functions.ts"
}, (opts) => verifyCheckout.__executeServer(opts));
var verifyCheckout = createServerFn({ method: "POST" }).handler(verifyCheckout_createServerFn_handler, async () => {
	const service = await billing();
	service.assertBillingOrigin(getRequest());
	return service.verifyPurchaseSession(getCookie(COOKIE));
});
var verifyMyPremium_createServerFn_handler = createServerRpc({
	id: "52a224bc104992aede1f5fe78be19777a7bf043111316dd47b2b91636ceb9e47",
	name: "verifyMyPremium",
	filename: "src/lib/billing.functions.ts"
}, (opts) => verifyMyPremium.__executeServer(opts));
var verifyMyPremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(verifyMyPremium_createServerFn_handler, async ({ context }) => {
	const service = await billing();
	service.assertBillingOrigin(getRequest());
	return service.verifyAccountAccess(context.userId, getCookie(COOKIE));
});
var redeemPromoCode_createServerFn_handler = createServerRpc({
	id: "9134b21fd113e4c4106e714f640652a3e1c3fdee1da68b8ac4bc3bab5787a0cd",
	name: "redeemPromoCode",
	filename: "src/lib/billing.functions.ts"
}, (opts) => redeemPromoCode.__executeServer(opts));
var redeemPromoCode = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => objectType({ code: stringType().trim().min(1).max(120) }).parse(value)).handler(redeemPromoCode_createServerFn_handler, async ({ data, context }) => {
	const service = await billing();
	service.assertBillingOrigin(getRequest());
	const code = data.code.trim().toLowerCase();
	let email = "";
	try {
		email = (context.claims?.email ?? "").trim().toLowerCase();
	} catch {}
	try {
		if (!email) {
			const { getFirebaseAdminFirestore } = await import("./firebase-admin-ChN7VIWw.mjs").then((n) => n.n).then((n) => n.n);
			getFirebaseAdminFirestore();
			const { getAuth } = await import("../_libs/firebase-admin+[...].mjs").then((n) => n.c);
			email = ((await getAuth().getUser(context.userId)).email ?? "").toLowerCase();
		}
	} catch {}
	const isVipEmail = !!email && service.FREE_PREMIUM_EMAILS.has(email);
	const codeOk = service.LIFETIME_PROMO_CODES.has(code) || service.FREE_PREMIUM_EMAILS.has(code);
	if (isVipEmail) return service.grantManualPremium(context.userId, "free_email", email);
	if (codeOk) return service.grantManualPremium(context.userId, `promo:${code}`, email || null);
	throw new Response("That promo code is not valid.", { status: 400 });
});
var getIntroCompletion_createServerFn_handler = createServerRpc({
	id: "cd199f59356be6ba5af24778eb595d9e5b39295ceeed9f38d2cc08abffeda819",
	name: "getIntroCompletion",
	filename: "src/lib/billing.functions.ts"
}, (opts) => getIntroCompletion.__executeServer(opts));
var getIntroCompletion = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getIntroCompletion_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	return (await getFirebaseAdminFirestore().collection("intro_completion").doc(context.userId).get()).exists;
});
var completeIntro_createServerFn_handler = createServerRpc({
	id: "4897050e3c43a0df8e1ab703461bd8e13d31247792685dbe116be4acea975ccf",
	name: "completeIntro",
	filename: "src/lib/billing.functions.ts"
}, (opts) => completeIntro.__executeServer(opts));
var completeIntro = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(completeIntro_createServerFn_handler, async ({ context }) => {
	const { getFirebaseAdminFirestore } = await loadFirebaseAdmin();
	await getFirebaseAdminFirestore().collection("intro_completion").doc(context.userId).set({ completed: true });
	return true;
});
//#endregion
export { completeIntro_createServerFn_handler, createPurchaseSession_createServerFn_handler, getIntroCompletion_createServerFn_handler, redeemPromoCode_createServerFn_handler, verifyCheckout_createServerFn_handler, verifyMyPremium_createServerFn_handler };
