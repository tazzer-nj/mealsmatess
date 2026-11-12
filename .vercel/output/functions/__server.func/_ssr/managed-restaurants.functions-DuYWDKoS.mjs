import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/managed-restaurants.functions-DuYWDKoS.js
var CreateManagedRestaurantSchema = objectType({
	email: stringType().email(),
	name: stringType().trim().min(2).max(120),
	ownerName: stringType().trim().min(2).max(120)
});
var RestaurantIdSchema = objectType({ restaurantId: stringType().uuid() });
async function assertManagedAdmin(context) {
	const { isAdmin } = await import("./marketplace.server-D_s5ZHPi.mjs");
	if (!await isAdmin(context.userId)) throw new Error("Admin access required");
}
var listManagedRestaurants_createServerFn_handler = createServerRpc({
	id: "ba6c08072634b78abdf8d139bb5a2a2c3d64eecde403ce17b167e01765503ec8",
	name: "listManagedRestaurants",
	filename: "src/lib/managed-restaurants.functions.ts"
}, (opts) => listManagedRestaurants.__executeServer(opts));
var listManagedRestaurants = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(listManagedRestaurants_createServerFn_handler, async ({ context }) => {
	await assertManagedAdmin(context);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data, error } = await firebaseAdmin.from("restaurants").select("id,name,email,owner_name,approval_status,created_at").order("created_at", { ascending: false });
	if (error) throw error;
	return (data ?? []).map((r) => ({
		...r,
		owner_email: r.email,
		onboarding_complete: r.approval_status === "approved",
		is_suspended: r.approval_status === "suspended"
	}));
});
var launchManagedRestaurant_createServerFn_handler = createServerRpc({
	id: "c516fbfc83aa4c473aef3261efed7c6468f696e69887cb462e5efe27f0e85c32",
	name: "launchManagedRestaurant",
	filename: "src/lib/managed-restaurants.functions.ts"
}, (opts) => launchManagedRestaurant.__executeServer(opts));
var launchManagedRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => RestaurantIdSchema.parse(value)).handler(launchManagedRestaurant_createServerFn_handler, async ({ data, context }) => {
	await assertManagedAdmin(context);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { error } = await firebaseAdmin.from("restaurants").update({ approval_status: "approved" }).eq("id", data.restaurantId);
	if (error) throw error;
	return {
		restaurantId: data.restaurantId,
		launched: true
	};
});
var createManagedRestaurant_createServerFn_handler = createServerRpc({
	id: "aae2e6d6e4f758acb0cb303583a33888da6ce3dac9ea60596ac7dd3fb94eeecf",
	name: "createManagedRestaurant",
	filename: "src/lib/managed-restaurants.functions.ts"
}, (opts) => createManagedRestaurant.__executeServer(opts));
var createManagedRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => CreateManagedRestaurantSchema.parse(value)).handler(createManagedRestaurant_createServerFn_handler, async ({ data, context }) => {
	await assertManagedAdmin(context);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const email = data.email.trim().toLowerCase();
	const { getOrCreateFirebaseUser } = await loadFirebaseAdmin();
	const { user: owner, created: ownerCreated } = await getOrCreateFirebaseUser(email, data.ownerName.trim());
	const ownerId = owner.uid;
	const { error: profileError } = await firebaseAdmin.from("profiles").upsert({
		id: ownerId,
		email,
		display_name: owner.displayName || data.ownerName.trim(),
		created_at: owner.metadata.creationTime ?? (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "id" });
	if (profileError) throw new Error(profileError.message);
	const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${crypto.randomUUID().slice(0, 8)}`;
	const { data: restaurant, error: restaurantError } = await firebaseAdmin.from("restaurants").insert({
		name: data.name.trim(),
		slug,
		owner_id: ownerId,
		owner_name: data.ownerName.trim(),
		email,
		approval_status: "pending"
	}).select("id,name,slug,email").single();
	if (restaurantError) throw restaurantError;
	await firebaseAdmin.from("restaurant_staff").insert({
		restaurant_id: restaurant.id,
		user_id: ownerId,
		role: "owner"
	});
	return {
		restaurant: {
			...restaurant,
			owner_email: restaurant.email
		},
		trialEndsAt: null,
		invited: ownerCreated,
		sponsored: false
	};
});
//#endregion
export { createManagedRestaurant_createServerFn_handler, launchManagedRestaurant_createServerFn_handler, listManagedRestaurants_createServerFn_handler };
