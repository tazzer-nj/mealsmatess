import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
import { a as ORDER_STATUS_FLOW, c as ProfileUpdateSchema, l as RESTAURANT_IMAGE_TYPES, n as MAX_RESTAURANT_IMAGE_BASE64, r as MenuItemSchema, s as OrderInputSchema, t as ApplicationSchema } from "./restaurants.schemas-DO_5wjxM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurants.functions-C1j0erld.js
var submitRestaurantApplication_createServerFn_handler = createServerRpc({
	id: "b43123fe0c6818254126b2c282172377231a4801bf5f244c2adbe9f8af221170",
	name: "submitRestaurantApplication",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => submitRestaurantApplication.__executeServer(opts));
var submitRestaurantApplication = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => ApplicationSchema.parse(v)).handler(submitRestaurantApplication_createServerFn_handler, async ({ data, context }) => {
	const { createApplication } = await import("./restaurants.server-BWfXSw6h.mjs");
	return createApplication(context.userId, data);
});
var getMyRestaurant_createServerFn_handler = createServerRpc({
	id: "870f878fc8c96115b5f4bae0875855ff8f5b25796016d000a89bbd0dd52eae46",
	name: "getMyRestaurant",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => getMyRestaurant.__executeServer(opts));
var getMyRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(getMyRestaurant_createServerFn_handler, async ({ context }) => {
	const { fetchMyRestaurant } = await import("./restaurants.server-BWfXSw6h.mjs");
	return fetchMyRestaurant(context.userId);
});
var updateMyRestaurant_createServerFn_handler = createServerRpc({
	id: "01add0a3f775280e2d5838b2262366c91309f350f5118ac33d72e0a9b913d5cb",
	name: "updateMyRestaurant",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => updateMyRestaurant.__executeServer(opts));
var updateMyRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => ProfileUpdateSchema.parse(v)).handler(updateMyRestaurant_createServerFn_handler, async ({ data, context }) => {
	const { updateRestaurantProfile } = await import("./restaurants.server-BWfXSw6h.mjs");
	return updateRestaurantProfile(context.userId, data);
});
var uploadRestaurantMedia_createServerFn_handler = createServerRpc({
	id: "1cd67dc428c2fbf1917e8230ac8c7ee13a7477d97dc9c94b0b648a56c0734921",
	name: "uploadRestaurantMedia",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => uploadRestaurantMedia.__executeServer(opts));
var uploadRestaurantMedia = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	restaurantId: stringType().uuid().optional(),
	kind: enumType([
		"logo",
		"cover",
		"food",
		"menu-item"
	]),
	fileName: stringType().min(1).max(200),
	contentType: enumType(RESTAURANT_IMAGE_TYPES),
	base64: stringType().min(16).max(MAX_RESTAURANT_IMAGE_BASE64)
}).parse(v)).handler(uploadRestaurantMedia_createServerFn_handler, async ({ data, context }) => {
	const { uploadMedia } = await import("./restaurants.server-BWfXSw6h.mjs");
	return uploadMedia(context.userId, data);
});
var saveMenuItem_createServerFn_handler = createServerRpc({
	id: "d27913893474d90f68441e53bb8c96e357aae8360d7bda45586f27deef7c5601",
	name: "saveMenuItem",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => saveMenuItem.__executeServer(opts));
var saveMenuItem = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => MenuItemSchema.parse(v)).handler(saveMenuItem_createServerFn_handler, async ({ data, context }) => {
	const { persistMenuItem } = await import("./restaurants.server-BWfXSw6h.mjs");
	return persistMenuItem(context.userId, data);
});
var deleteMenuItem_createServerFn_handler = createServerRpc({
	id: "ada5340e25865e3e1c66d9770ba6f20bf1066fff0165197f2ae6e22a5e938517",
	name: "deleteMenuItem",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => deleteMenuItem.__executeServer(opts));
var deleteMenuItem = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ id: stringType().uuid() }).parse(v)).handler(deleteMenuItem_createServerFn_handler, async ({ data, context }) => {
	const { removeMenuItem } = await import("./restaurants.server-BWfXSw6h.mjs");
	return removeMenuItem(context.userId, data.id);
});
var listRestaurantOrders_createServerFn_handler = createServerRpc({
	id: "99e440cb467c285a0afe8646f80b0e50cce5f2b4bc7c573dbfa93a20cc90da26",
	name: "listRestaurantOrders",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => listRestaurantOrders.__executeServer(opts));
var listRestaurantOrders = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	restaurantId: stringType().uuid(),
	scope: enumType(["active", "completed"])
}).parse(v)).handler(listRestaurantOrders_createServerFn_handler, async ({ data, context }) => {
	const { fetchRestaurantOrders } = await import("./restaurants.server-BWfXSw6h.mjs");
	return fetchRestaurantOrders(context.userId, data.restaurantId, data.scope);
});
var updateOrderStatus_createServerFn_handler = createServerRpc({
	id: "b3741397ce1bc307dc438f0fa297f6116574bd6aa76734faba08ac8317086a75",
	name: "updateOrderStatus",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => updateOrderStatus.__executeServer(opts));
var updateOrderStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	orderId: stringType().uuid(),
	status: enumType(ORDER_STATUS_FLOW),
	reason: stringType().max(500).optional()
}).parse(v)).handler(updateOrderStatus_createServerFn_handler, async ({ data, context }) => {
	const { setOrderStatus } = await import("./restaurants.server-BWfXSw6h.mjs");
	return setOrderStatus(context.userId, data.orderId, data.status, data.reason);
});
var listRestaurantReviews_createServerFn_handler = createServerRpc({
	id: "f43afd94844e755fd985a5ae873078fe5775acd64932c1b55dc855c1d6b9b8ab",
	name: "listRestaurantReviews",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => listRestaurantReviews.__executeServer(opts));
var listRestaurantReviews = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ restaurantId: stringType().uuid() }).parse(v)).handler(listRestaurantReviews_createServerFn_handler, async ({ data }) => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data: reviews, error } = await firebaseAdmin.from("restaurant_reviews").select("id,rating,comment,created_at").eq("restaurant_id", data.restaurantId).order("created_at", { ascending: false }).limit(30);
	if (error) throw new Error(error.message);
	return reviews ?? [];
});
var getRestaurantStats_createServerFn_handler = createServerRpc({
	id: "0b9fe997e9198dc25a8d2b3991adfa8198e5b41955ba44369c78dba9d3612513",
	name: "getRestaurantStats",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => getRestaurantStats.__executeServer(opts));
var getRestaurantStats = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ restaurantId: stringType().uuid() }).parse(v)).handler(getRestaurantStats_createServerFn_handler, async ({ data, context }) => {
	const { fetchRestaurantStats } = await import("./restaurants.server-BWfXSw6h.mjs");
	return fetchRestaurantStats(context.userId, data.restaurantId);
});
var placeOrder_createServerFn_handler = createServerRpc({
	id: "52b7eb5257c91dc5db6da179729fc21adb1b625858a5d679dc386886f74077f5",
	name: "placeOrder",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => placeOrder.__executeServer(opts));
var placeOrder = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => OrderInputSchema.parse(v)).handler(placeOrder_createServerFn_handler, async ({ data, context }) => {
	const { persistOrder } = await import("./restaurants.server-BWfXSw6h.mjs");
	return persistOrder(context.userId, data);
});
var adminListRestaurantApplications_createServerFn_handler = createServerRpc({
	id: "d1951a245f1716c64fd15ca3acdfe80f24791bd77d66ca8ac72669fd98966319",
	name: "adminListRestaurantApplications",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => adminListRestaurantApplications.__executeServer(opts));
var adminListRestaurantApplications = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ status: enumType([
	"all",
	"pending",
	"approved",
	"rejected",
	"changes_requested",
	"suspended"
]).default("pending") }).parse(v)).handler(adminListRestaurantApplications_createServerFn_handler, async ({ data, context }) => {
	const { adminListApplications } = await import("./restaurants.server-BWfXSw6h.mjs");
	return adminListApplications(context.userId, data.status);
});
var adminReviewRestaurantApplication_createServerFn_handler = createServerRpc({
	id: "7bc6d050362be4b637350410f8da88236f739ffc434b07a08cd678a40a28e6f1",
	name: "adminReviewRestaurantApplication",
	filename: "src/lib/restaurants.functions.ts"
}, (opts) => adminReviewRestaurantApplication.__executeServer(opts));
var adminReviewRestaurantApplication = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	applicationId: stringType().uuid(),
	decision: enumType([
		"approved",
		"rejected",
		"changes_requested",
		"suspended"
	]),
	notes: stringType().max(1e3).optional()
}).parse(v)).handler(adminReviewRestaurantApplication_createServerFn_handler, async ({ data, context }) => {
	const { adminReviewApplication } = await import("./restaurants.server-BWfXSw6h.mjs");
	return adminReviewApplication(context.userId, data);
});
//#endregion
export { adminListRestaurantApplications_createServerFn_handler, adminReviewRestaurantApplication_createServerFn_handler, deleteMenuItem_createServerFn_handler, getMyRestaurant_createServerFn_handler, getRestaurantStats_createServerFn_handler, listRestaurantOrders_createServerFn_handler, listRestaurantReviews_createServerFn_handler, placeOrder_createServerFn_handler, saveMenuItem_createServerFn_handler, submitRestaurantApplication_createServerFn_handler, updateMyRestaurant_createServerFn_handler, updateOrderStatus_createServerFn_handler, uploadRestaurantMedia_createServerFn_handler };
