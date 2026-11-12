import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/premium.functions-eUhjYUhF.js
var loadPremiumService = () => import("./revenuecat-C1ChHDlc.mjs");
var getMyEntitlement_createServerFn_handler = createServerRpc({
	id: "10a641dfa6186bd8d694a402cd2db1bb1aba27e22aa1da48db923d023be771ff",
	name: "getMyEntitlement",
	filename: "src/lib/premium.functions.ts"
}, (opts) => getMyEntitlement.__executeServer(opts));
var getMyEntitlement = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyEntitlement_createServerFn_handler, async ({ context }) => {
	const { verifyAccountAccess } = await loadPremiumService();
	return verifyAccountAccess(context.userId);
});
var getMyUsage_createServerFn_handler = createServerRpc({
	id: "eb5ac993c8f2f99caac2a9df1e1f1c9581b22ad281f925bc293e05d2a8a3b827",
	name: "getMyUsage",
	filename: "src/lib/premium.functions.ts"
}, (opts) => getMyUsage.__executeServer(opts));
var getMyUsage = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyUsage_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.firebase.rpc("my_ai_usage");
	if (error) throw new Error(error.message);
	const u = data;
	const usage = { ai_day: {
		count: u.day_used,
		max: u.day_max,
		period: "day",
		label: "Mia AI today",
		resetsAt: u.day_resets_at
	} };
	if (u.month_max != null) usage["ai_month"] = {
		count: u.month_used,
		max: u.month_max,
		period: "month",
		label: "Mia AI this month",
		resetsAt: u.month_resets_at
	};
	if (u.favorites_max != null) usage["favorites"] = {
		count: u.favorites_used,
		max: u.favorites_max,
		period: "total",
		label: "Saved favourites",
		resetsAt: null
	};
	if (u.plans_max != null) usage["meal_plans"] = {
		count: u.plans_used,
		max: u.plans_max,
		period: "active",
		label: "Active meal plans",
		resetsAt: null
	};
	return usage;
});
var getMyReferral_createServerFn_handler = createServerRpc({
	id: "840cb71512c551c8a5136239b241fbdeb6b5019bef7790ef8a708459a7c23b11",
	name: "getMyReferral",
	filename: "src/lib/premium.functions.ts"
}, (opts) => getMyReferral.__executeServer(opts));
var getMyReferral = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(getMyReferral_createServerFn_handler, async ({ context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	let { data: row } = await firebaseAdmin.from("referral_codes").select("code").eq("user_id", context.userId).maybeSingle();
	if (!row) {
		const code = generateCode();
		await firebaseAdmin.from("referral_codes").insert({
			user_id: context.userId,
			code
		});
		row = { code };
	}
	const { count: totalReferred } = await firebaseAdmin.from("referrals").select("*", {
		count: "exact",
		head: true
	}).eq("referrer_id", context.userId);
	const { count: rewarded } = await firebaseAdmin.from("referrals").select("*", {
		count: "exact",
		head: true
	}).eq("referrer_id", context.userId).eq("status", "rewarded");
	return {
		code: row.code,
		totalReferred: totalReferred ?? 0,
		rewarded: rewarded ?? 0
	};
});
function generateCode(len = 8) {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let s = "";
	for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * 32)];
	return s;
}
var applyReferralCode_createServerFn_handler = createServerRpc({
	id: "8769d67d525029ca41e5b0902a41efacd26d4925a460926ece13032b617db70d",
	name: "applyReferralCode",
	filename: "src/lib/premium.functions.ts"
}, (opts) => applyReferralCode.__executeServer(opts));
var applyReferralCode = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ code: stringType().min(4).max(16) }).parse(v)).handler(applyReferralCode_createServerFn_handler, async ({ data, context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const code = data.code.trim().toUpperCase();
	const { data: owner } = await firebaseAdmin.from("referral_codes").select("user_id").eq("code", code).maybeSingle();
	if (!owner) throw new Error("Invalid referral code");
	if (owner.user_id === context.userId) throw new Error("You can't refer yourself");
	const { data: existing } = await firebaseAdmin.from("referrals").select("id").eq("referred_id", context.userId).maybeSingle();
	if (existing) throw new Error("You already used a referral code");
	await firebaseAdmin.from("referrals").insert({
		referrer_id: owner.user_id,
		referred_id: context.userId,
		code,
		reward_days: 14,
		status: "pending"
	});
	return {
		ok: true,
		message: "Referral saved — both of you get 14 free Premium days when you first subscribe."
	};
});
var redeemPromoCode_createServerFn_handler = createServerRpc({
	id: "e873178ef83b7ab30e9ca62af476c1d3f391a27daf0641f7fdb289d9b41edd50",
	name: "redeemPromoCode",
	filename: "src/lib/premium.functions.ts"
}, (opts) => redeemPromoCode.__executeServer(opts));
var redeemPromoCode = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ code: stringType().min(2).max(40) }).parse(v)).handler(redeemPromoCode_createServerFn_handler, async ({ data, context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const code = data.code.trim().toUpperCase();
	const { data: promo } = await firebaseAdmin.from("promo_codes").select("*").eq("code", code).maybeSingle();
	if (!promo || !promo.enabled) throw new Error("Invalid or disabled promo code");
	if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) throw new Error("This promo code has expired");
	if (promo.max_redemptions && promo.redemption_count >= promo.max_redemptions) throw new Error("This promo code has been fully redeemed");
	const { data: dup } = await firebaseAdmin.from("promo_redemptions").select("id").eq("code_id", promo.id).eq("user_id", context.userId).maybeSingle();
	if (dup) throw new Error("You've already redeemed this code");
	let grantedDays = 0;
	let grantedLifetime = false;
	let tier = "promo";
	switch (promo.reward_kind) {
		case "free_days":
			grantedDays = Number(promo.reward_value) || 0;
			break;
		case "free_month":
			grantedDays = 30;
			tier = "monthly";
			break;
		case "free_year":
			grantedDays = 365;
			tier = "annual";
			break;
		case "lifetime":
			grantedLifetime = true;
			tier = "lifetime";
	}
	if (grantedDays > 0 || grantedLifetime) {
		const { data: current } = await firebaseAdmin.from("subscriptions").select("*").eq("user_id", context.userId).order("period_end", {
			ascending: false,
			nullsFirst: false
		}).limit(1).maybeSingle();
		const baseline = current?.period_end && new Date(current.period_end).getTime() > Date.now() ? new Date(current.period_end).getTime() : Date.now();
		const newEnd = grantedLifetime ? null : new Date(baseline + grantedDays * 864e5).toISOString();
		if (current) await firebaseAdmin.from("subscriptions").update({
			tier: grantedLifetime ? "lifetime" : tier,
			status: "active",
			period_end: newEnd,
			store: "promo",
			is_manual: true
		}).eq("id", current.id);
		else await firebaseAdmin.from("subscriptions").insert({
			user_id: context.userId,
			tier: grantedLifetime ? "lifetime" : tier,
			status: "active",
			store: "promo",
			period_start: (/* @__PURE__ */ new Date()).toISOString(),
			period_end: newEnd,
			is_manual: true
		});
	}
	await firebaseAdmin.from("promo_redemptions").insert({
		code_id: promo.id,
		user_id: context.userId,
		granted_days: grantedDays,
		granted_lifetime: grantedLifetime
	});
	await firebaseAdmin.from("promo_codes").update({ redemption_count: promo.redemption_count + 1 }).eq("id", promo.id);
	await firebaseAdmin.from("subscription_events").insert({
		user_id: context.userId,
		event_type: `promo:${promo.reward_kind}`,
		source: "promo",
		actor_id: context.userId,
		payload: {
			code,
			granted_days: grantedDays,
			granted_lifetime: grantedLifetime
		}
	});
	return {
		ok: true,
		message: promo.reward_kind === "percent_discount" ? `${promo.reward_value}% discount saved — it'll apply at checkout on mobile.` : grantedLifetime ? "Lifetime Premium unlocked!" : `${grantedDays} days of Premium added to your account.`
	};
});
async function assertAdmin(userId) {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	if (!data) throw new Error("Forbidden");
}
var adminListSubscribers_createServerFn_handler = createServerRpc({
	id: "bd0d44708ee674951da325f305446a716708e5e1d9f83ab3eec9b9bd13ad0325",
	name: "adminListSubscribers",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminListSubscribers.__executeServer(opts));
var adminListSubscribers = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(adminListSubscribers_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: subs } = await firebaseAdmin.from("subscriptions").select("id,user_id,tier,status,store,period_start,period_end,trial_end,auto_renew,is_manual,created_at").order("created_at", { ascending: false }).limit(500);
	const subscriptionRows = subs ?? [];
	const ids = Array.from(new Set(subscriptionRows.map((subscription) => subscription.user_id)));
	const { data: profiles } = await firebaseAdmin.from("profiles").select("id,display_name").in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
	const profMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
	return subscriptionRows.map((subscription) => ({
		...subscription,
		display_name: profMap.get(subscription.user_id) ?? "—"
	}));
});
var adminStats_createServerFn_handler = createServerRpc({
	id: "d09d86bf59b1abd7f57dafe2b67b0d8a9ae1a281c844e72d16946b809600ec95",
	name: "adminStats",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminStats.__executeServer(opts));
var adminStats = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(adminStats_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const [{ count: active }, { count: trialing }, { count: lifetime }, { count: refTotal }, { count: refRewarded }] = await Promise.all([
		firebaseAdmin.from("subscriptions").select("*", {
			count: "exact",
			head: true
		}).eq("status", "active"),
		firebaseAdmin.from("subscriptions").select("*", {
			count: "exact",
			head: true
		}).eq("status", "trialing"),
		firebaseAdmin.from("subscriptions").select("*", {
			count: "exact",
			head: true
		}).eq("tier", "lifetime"),
		firebaseAdmin.from("referrals").select("*", {
			count: "exact",
			head: true
		}),
		firebaseAdmin.from("referrals").select("*", {
			count: "exact",
			head: true
		}).eq("status", "rewarded")
	]);
	const since = (/* @__PURE__ */ new Date(Date.now() - 2592e6)).toISOString();
	const { data: payments30 } = await firebaseAdmin.from("payments").select("amount_usd,kind").gte("occurred_at", since).in("kind", [
		"initial",
		"renewal",
		"trial_conversion"
	]);
	const revenue30 = (payments30 ?? []).reduce((sum, payment) => sum + Number(payment.amount_usd ?? 0), 0);
	return {
		active: active ?? 0,
		trialing: trialing ?? 0,
		lifetime: lifetime ?? 0,
		referralsTotal: refTotal ?? 0,
		referralsRewarded: refRewarded ?? 0,
		revenue30
	};
});
var adminListPromos_createServerFn_handler = createServerRpc({
	id: "b55de083da7fcc8ea1a39003aadbddde9e81c39dc5c28f31c01f68cf038454fc",
	name: "adminListPromos",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminListPromos.__executeServer(opts));
var adminListPromos = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(adminListPromos_createServerFn_handler, async ({ context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data } = await firebaseAdmin.from("promo_codes").select("*").order("created_at", { ascending: false });
	return data ?? [];
});
var PromoInput = objectType({
	id: stringType().uuid().optional(),
	code: stringType().min(2).max(40),
	reward_kind: enumType([
		"percent_discount",
		"free_days",
		"free_month",
		"free_year",
		"lifetime"
	]),
	reward_value: numberType().int().min(0).max(1e5).default(0),
	max_redemptions: numberType().int().positive().nullable().optional(),
	expires_at: stringType().nullable().optional(),
	enabled: booleanType().default(true),
	notes: stringType().max(500).nullable().optional()
});
var adminSavePromo_createServerFn_handler = createServerRpc({
	id: "b1ca427078f80da466b82fc6563fc0a4eb8f9d38102fb1f3d7f52e5d736b2c6c",
	name: "adminSavePromo",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminSavePromo.__executeServer(opts));
var adminSavePromo = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => PromoInput.parse(v)).handler(adminSavePromo_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const row = {
		code: data.code.trim().toUpperCase(),
		reward_kind: data.reward_kind,
		reward_value: data.reward_value,
		max_redemptions: data.max_redemptions ?? null,
		expires_at: data.expires_at ?? null,
		enabled: data.enabled,
		notes: data.notes ?? null,
		created_by: context.userId
	};
	if (data.id) {
		const { error } = await firebaseAdmin.from("promo_codes").update(row).eq("id", data.id);
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	const { data: inserted, error } = await firebaseAdmin.from("promo_codes").insert(row).select("id").single();
	if (error) throw new Error(error.message);
	return { id: inserted.id };
});
var adminDeletePromo_createServerFn_handler = createServerRpc({
	id: "770cd247435cec8a1d98a9d5ee4746e20b6114235ca7af63d1a5b31f831dbb5d",
	name: "adminDeletePromo",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminDeletePromo.__executeServer(opts));
var adminDeletePromo = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ id: stringType().uuid() }).parse(v)).handler(adminDeletePromo_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { error } = await firebaseAdmin.from("promo_codes").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var adminGrantPremium_createServerFn_handler = createServerRpc({
	id: "f7d0eaff445b66345ee47401f4a146baa46162a5061de652da85ae6b9289d5aa",
	name: "adminGrantPremium",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminGrantPremium.__executeServer(opts));
var adminGrantPremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	userId: stringType().uuid(),
	days: numberType().int().min(1).max(3650)
}).parse(v)).handler(adminGrantPremium_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: current } = await firebaseAdmin.from("subscriptions").select("*").eq("user_id", data.userId).order("period_end", {
		ascending: false,
		nullsFirst: false
	}).limit(1).maybeSingle();
	const baseline = current?.period_end && new Date(current.period_end).getTime() > Date.now() ? new Date(current.period_end).getTime() : Date.now();
	const newEnd = new Date(baseline + data.days * 864e5).toISOString();
	if (current) await firebaseAdmin.from("subscriptions").update({
		status: "active",
		tier: current.tier === "free" ? "promo" : current.tier,
		period_end: newEnd,
		store: "admin",
		is_manual: true
	}).eq("id", current.id);
	else await firebaseAdmin.from("subscriptions").insert({
		user_id: data.userId,
		tier: "promo",
		status: "active",
		store: "admin",
		period_start: (/* @__PURE__ */ new Date()).toISOString(),
		period_end: newEnd,
		is_manual: true
	});
	await firebaseAdmin.from("subscription_events").insert({
		user_id: data.userId,
		event_type: "admin:grant",
		source: "admin",
		actor_id: context.userId,
		payload: { days: data.days }
	});
	return { ok: true };
});
var adminRevokePremium_createServerFn_handler = createServerRpc({
	id: "a6357198c849b3b994124e6afa517b66fd51a993f1f9a4db0dfba98e07f96e87",
	name: "adminRevokePremium",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminRevokePremium.__executeServer(opts));
var adminRevokePremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ userId: stringType().uuid() }).parse(v)).handler(adminRevokePremium_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	await firebaseAdmin.from("subscriptions").update({
		status: "cancelled",
		cancelled_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("user_id", data.userId).in("status", [
		"trialing",
		"active",
		"in_grace"
	]);
	await firebaseAdmin.from("subscription_events").insert({
		user_id: data.userId,
		event_type: "admin:revoke",
		source: "admin",
		actor_id: context.userId,
		payload: {}
	});
	return { ok: true };
});
var adminIsAdmin_createServerFn_handler = createServerRpc({
	id: "c1b620e24146eaf29191f9e8b089333a331bfc4c75d914d0e4f88c1e20c549e1",
	name: "adminIsAdmin",
	filename: "src/lib/premium.functions.ts"
}, (opts) => adminIsAdmin.__executeServer(opts));
var adminIsAdmin = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(adminIsAdmin_createServerFn_handler, async ({ context }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle();
	return { isAdmin: !!data };
});
//#endregion
export { adminDeletePromo_createServerFn_handler, adminGrantPremium_createServerFn_handler, adminIsAdmin_createServerFn_handler, adminListPromos_createServerFn_handler, adminListSubscribers_createServerFn_handler, adminRevokePremium_createServerFn_handler, adminSavePromo_createServerFn_handler, adminStats_createServerFn_handler, applyReferralCode_createServerFn_handler, getMyEntitlement_createServerFn_handler, getMyReferral_createServerFn_handler, getMyUsage_createServerFn_handler, redeemPromoCode_createServerFn_handler };
