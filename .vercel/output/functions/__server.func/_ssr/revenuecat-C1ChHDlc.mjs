import { o as Timestamp } from "../_libs/firebase-admin+[...].mjs";
import { r as getFirebaseAdminFirestore } from "./firebase-admin-ChN7VIWw.mjs";
import { createHash, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/revenuecat-C1ChHDlc.js
/** Primary entitlement identifier in the app and new RC config. */
var ENTITLEMENT = "premium";
/** Legacy identifier still attached on older MealMate RC products. */
var ENTITLEMENT_ALIASES = ["premium", "MealMate Pro"];
var OFFERING = "default";
var denied = () => ({
	isPremium: false,
	tier: "free",
	status: "expired",
	trialActive: false,
	periodEnd: null,
	trialEnd: null,
	store: null,
	autoRenew: false,
	isManual: false,
	verifiedUntil: 0
});
/** Accounts that always receive premium without payment (owner / VIP). */
var FREE_PREMIUM_EMAILS = new Set((process.env["FREE_PREMIUM_EMAILS"] ?? "tatendamkhwanazi6@gmail.com").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
/** Promo codes that grant lifetime premium (lowercase). Includes the free email as a code. */
var LIFETIME_PROMO_CODES = new Set((process.env["LIFETIME_PROMO_CODES"] ?? "tatendamkhwanazi6@gmail.com,miafree,owner").split(",").map((c) => c.trim().toLowerCase()).filter(Boolean));
function lifetimePremium() {
	return {
		isPremium: true,
		tier: "promo",
		status: "active",
		trialActive: false,
		periodEnd: null,
		trialEnd: null,
		store: "promotional",
		autoRenew: false,
		isManual: true,
		verifiedUntil: Date.now() + 31536e6
	};
}
async function readManualPremium(userId) {
	const data = (await getFirebaseAdminFirestore().collection("premium_grants").doc(userId).get()).data();
	if (!data || data.active === false) return null;
	const until = Number(data.valid_until_ms ?? 0);
	if (Number.isFinite(until) && until > 0 && until <= Date.now()) return null;
	return lifetimePremium();
}
async function grantManualPremium(userId, reason, email) {
	const db = getFirebaseAdminFirestore();
	const access = lifetimePremium();
	await db.collection("premium_grants").doc(userId).set({
		active: true,
		reason,
		email: email ?? null,
		source: "promo",
		granted_at: Date.now(),
		valid_until_ms: null
	}, { merge: true });
	await db.collection("premium_access").doc(userId).set({
		valid_until: Timestamp.fromMillis(access.verifiedUntil),
		source: "promo",
		entitlement: ENTITLEMENT,
		reason
	});
	return access;
}
async function premiumForUserEmail(email) {
	if (!email) return null;
	if (FREE_PREMIUM_EMAILS.has(email.trim().toLowerCase())) return lifetimePremium();
	return null;
}
var SESSION_DAYS = 90;
var LEASE_MS = 3e5;
function pickEntitlement(subscriber) {
	const map = subscriber.entitlements ?? {};
	for (const key of ENTITLEMENT_ALIASES) if (map[key]?.product_identifier) return map[key];
	for (const value of Object.values(map)) if (value?.product_identifier) return value;
}
/** Only the server's authenticated RevenueCat response is accepted as purchase evidence. */
function parseRevenueCatAccess(subscriber, now = Date.now(), allowSandbox = false) {
	const entitlement = pickEntitlement(subscriber);
	if (!entitlement?.product_identifier || typeof entitlement.purchase_date !== "string" || Date.parse(entitlement.purchase_date) > now || !Number.isFinite(Date.parse(entitlement.purchase_date))) return denied();
	const product = entitlement.product_identifier;
	const subscription = subscriber.subscriptions?.[product];
	const supportedStores = /* @__PURE__ */ new Set([
		"play_store",
		"app_store",
		"stripe",
		"promotional",
		"rc_billing",
		"paddle",
		"test_store"
	]);
	if (!subscription && entitlement.expires_date === null) {
		const purchase = subscriber.non_subscriptions?.[product]?.find((transaction) => {
			const purchasedAt = Date.parse(transaction.purchase_date ?? "");
			return typeof transaction.store === "string" && supportedStores.has(transaction.store.toLowerCase()) && typeof transaction.is_sandbox === "boolean" && (allowSandbox || !transaction.is_sandbox) && transaction.refunded_at == null && Number.isFinite(purchasedAt) && purchasedAt <= now;
		});
		if (!purchase) return denied();
		return {
			isPremium: true,
			tier: product,
			status: "active",
			trialActive: false,
			periodEnd: null,
			trialEnd: null,
			store: purchase.store ?? null,
			autoRenew: false,
			isManual: false,
			verifiedUntil: now + LEASE_MS
		};
	}
	if (!subscription || typeof subscription.store !== "string" || !supportedStores.has(subscription.store.toLowerCase()) || typeof subscription.is_sandbox !== "boolean" || !allowSandbox && subscription.is_sandbox || subscription.refunded_at != null) return denied();
	const expiry = (value) => value === null ? Infinity : typeof value === "string" ? Date.parse(value) : NaN;
	const entitlementEnd = expiry(entitlement.expires_date);
	const subscriptionEnd = expiry(subscription.expires_date);
	if (Number.isNaN(entitlementEnd) || Number.isNaN(subscriptionEnd)) return denied();
	const regularEnd = Math.min(entitlementEnd, subscriptionEnd);
	const entitlementGrace = Date.parse(entitlement.grace_period_expires_date ?? "");
	const subscriptionGrace = Date.parse(subscription.grace_period_expires_date ?? "");
	const effectiveEnd = Math.max(regularEnd, Number.isFinite(entitlementGrace) && Number.isFinite(subscriptionGrace) ? Math.min(entitlementGrace, subscriptionGrace) : 0);
	if (!(effectiveEnd > now)) return denied();
	const trial = subscription?.period_type?.toLowerCase() === "trial";
	return {
		isPremium: true,
		tier: product,
		status: trial ? "trialing" : "active",
		trialActive: trial,
		periodEnd: Number.isFinite(effectiveEnd) ? new Date(effectiveEnd).toISOString() : null,
		trialEnd: trial && Number.isFinite(effectiveEnd) ? new Date(effectiveEnd).toISOString() : null,
		store: subscription?.store ?? null,
		autoRenew: !subscription?.unsubscribe_detected_at,
		isManual: false,
		verifiedUntil: Math.min(now + LEASE_MS, effectiveEnd)
	};
}
async function verifyRevenueCatCustomer(customerId) {
	const key = process.env["REVENUECAT_SECRET_API_KEY"];
	if (!key) throw new Error("Subscription verification is temporarily unavailable. Please try again.");
	const production = process.env["VERCEL_ENV"] === "production" || !["preview", "development"].includes(process.env["VERCEL_ENV"] ?? "");
	const base = !production && process.env["REVENUECAT_API_BASE_URL"] || "https://api.revenuecat.com/v1";
	const response = await fetch(`${base}/subscribers/${encodeURIComponent(customerId)}`, {
		headers: {
			Authorization: `Bearer ${key}`,
			Accept: "application/json"
		},
		cache: "no-store",
		signal: AbortSignal.timeout(1e4)
	});
	if (response.status === 404) return denied();
	if (!response.ok) throw new Error("Subscription verification is temporarily unavailable. Please try again.");
	const data = await response.json();
	if (!data.subscriber) throw new Error("The subscription service returned an invalid response.");
	return parseRevenueCatAccess(data.subscriber, Date.now(), !production && process.env["REVENUECAT_ALLOW_SANDBOX"] === "true");
}
function assertBillingOrigin(request) {
	const site = (request.headers.get("sec-fetch-site") ?? "").toLowerCase();
	const origin = request.headers.get("origin");
	const requestOrigin = new URL(request.url).origin;
	if (site === "cross-site") throw new Response("Forbidden", { status: 403 });
	if (site === "same-origin") return;
	if (!origin && !site) throw new Response("Forbidden", { status: 403 });
	if (origin && origin !== requestOrigin) throw new Response("Forbidden", { status: 403 });
	if (site === "same-site" && origin !== requestOrigin) throw new Response("Forbidden", { status: 403 });
}
var sessionId = (token) => createHash("sha256").update(token).digest("hex");
function sessionRef(token) {
	return getFirebaseAdminFirestore().collection("billing_sessions").doc(sessionId(token));
}
async function readPurchaseSession(token) {
	if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
	const data = (await sessionRef(token).get()).data();
	if (!data || !Number.isFinite(Number(data.expiresAt)) || Number(data.expiresAt) <= Date.now()) return null;
	return {
		customerId: String(data.customerId),
		owner: data.owner ? String(data.owner) : null
	};
}
async function purchaseIdentity(token, userId) {
	const db = getFirebaseAdminFirestore();
	if (userId) {
		const link = await db.collection("billing_links").doc(userId).get();
		return {
			customerId: String(link.data()?.customerId ?? userId),
			token: null
		};
	}
	const current = await readPurchaseSession(token);
	if (current && !current.owner) return {
		customerId: current.customerId,
		token: null
	};
	const next = randomBytes(32).toString("hex");
	const customerId = `mm_${randomBytes(24).toString("hex")}`;
	await sessionRef(next).set({
		customerId,
		expiresAt: Date.now() + SESSION_DAYS * 864e5
	});
	return {
		customerId,
		token: next
	};
}
async function verifyPurchaseSession(token) {
	const session = await readPurchaseSession(token);
	if (!session || session.owner) return denied();
	return verifyRevenueCatCustomer(session.customerId);
}
async function verifyAccountAccess(userId, token) {
	const db = getFirebaseAdminFirestore();
	const manual = await readManualPremium(userId);
	if (manual?.isPremium) return manual;
	try {
		getFirebaseAdminFirestore();
		const { getAuth } = await import("../_libs/firebase-admin+[...].mjs").then((n) => n.c);
		const authUser = await getAuth().getUser(userId);
		const byEmail = await premiumForUserEmail(authUser.email);
		if (byEmail?.isPremium) {
			await grantManualPremium(userId, "free_email", authUser.email);
			return byEmail;
		}
	} catch {}
	const linkRef = db.collection("billing_links").doc(userId);
	const link = await linkRef.get();
	let access = await verifyRevenueCatCustomer(String(link.data()?.customerId ?? userId));
	if (!access.isPremium && !link.exists && token) {
		const session = await readPurchaseSession(token);
		if (session && (!session.owner || session.owner === userId)) {
			const purchased = await verifyRevenueCatCustomer(session.customerId);
			if (purchased.isPremium) {
				await db.runTransaction(async (tx) => {
					const [claim, existing] = await Promise.all([tx.get(sessionRef(token)), tx.get(linkRef)]);
					const data = claim.data();
					if (!data || Number(data.expiresAt) <= Date.now() || data.customerId !== session.customerId || data.owner && data.owner !== userId || existing.exists && existing.data()?.customerId !== session.customerId) throw new Error("This purchase is already linked to an account. Sign in with that account to restore it.");
					tx.set(sessionRef(token), { owner: userId }, { merge: true });
					tx.set(linkRef, { customerId: session.customerId });
				});
				access = purchased;
			}
		}
	}
	await db.collection("premium_access").doc(userId).set({
		valid_until: Timestamp.fromMillis(access.verifiedUntil),
		source: access.isManual ? "promo" : "revenuecat",
		entitlement: ENTITLEMENT
	});
	return access;
}
async function requireActivePremium(userId) {
	const access = await verifyAccountAccess(userId);
	if (!access.isPremium) throw new Response("An active MealMate Premium subscription is required.", { status: 402 });
	return access;
}
//#endregion
export { ENTITLEMENT, ENTITLEMENT_ALIASES, FREE_PREMIUM_EMAILS, LIFETIME_PROMO_CODES, OFFERING, assertBillingOrigin, grantManualPremium, parseRevenueCatAccess, premiumForUserEmail, purchaseIdentity, readManualPremium, readPurchaseSession, requireActivePremium, verifyAccountAccess, verifyPurchaseSession, verifyRevenueCatCustomer };
