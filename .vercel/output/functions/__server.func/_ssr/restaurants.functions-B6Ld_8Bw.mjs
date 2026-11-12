import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { a as ORDER_STATUS_FLOW, c as ProfileUpdateSchema, l as RESTAURANT_IMAGE_TYPES, n as MAX_RESTAURANT_IMAGE_BASE64, r as MenuItemSchema, s as OrderInputSchema, t as ApplicationSchema } from "./restaurants.schemas-DO_5wjxM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurants.functions-B6Ld_8Bw.js
var submitRestaurantApplication = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => ApplicationSchema.parse(v)).handler(createSsrRpc("b43123fe0c6818254126b2c282172377231a4801bf5f244c2adbe9f8af221170"));
var getMyRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("870f878fc8c96115b5f4bae0875855ff8f5b25796016d000a89bbd0dd52eae46"));
var updateMyRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => ProfileUpdateSchema.parse(v)).handler(createSsrRpc("01add0a3f775280e2d5838b2262366c91309f350f5118ac33d72e0a9b913d5cb"));
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
}).parse(v)).handler(createSsrRpc("1cd67dc428c2fbf1917e8230ac8c7ee13a7477d97dc9c94b0b648a56c0734921"));
var saveMenuItem = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => MenuItemSchema.parse(v)).handler(createSsrRpc("d27913893474d90f68441e53bb8c96e357aae8360d7bda45586f27deef7c5601"));
var deleteMenuItem = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ id: stringType().uuid() }).parse(v)).handler(createSsrRpc("ada5340e25865e3e1c66d9770ba6f20bf1066fff0165197f2ae6e22a5e938517"));
var listRestaurantOrders = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	restaurantId: stringType().uuid(),
	scope: enumType(["active", "completed"])
}).parse(v)).handler(createSsrRpc("99e440cb467c285a0afe8646f80b0e50cce5f2b4bc7c573dbfa93a20cc90da26"));
var updateOrderStatus = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	orderId: stringType().uuid(),
	status: enumType(ORDER_STATUS_FLOW),
	reason: stringType().max(500).optional()
}).parse(v)).handler(createSsrRpc("b3741397ce1bc307dc438f0fa297f6116574bd6aa76734faba08ac8317086a75"));
var listRestaurantReviews = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ restaurantId: stringType().uuid() }).parse(v)).handler(createSsrRpc("f43afd94844e755fd985a5ae873078fe5775acd64932c1b55dc855c1d6b9b8ab"));
var getRestaurantStats = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ restaurantId: stringType().uuid() }).parse(v)).handler(createSsrRpc("0b9fe997e9198dc25a8d2b3991adfa8198e5b41955ba44369c78dba9d3612513"));
var placeOrder = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => OrderInputSchema.parse(v)).handler(createSsrRpc("52b7eb5257c91dc5db6da179729fc21adb1b625858a5d679dc386886f74077f5"));
createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ status: enumType([
	"all",
	"pending",
	"approved",
	"rejected",
	"changes_requested",
	"suspended"
]).default("pending") }).parse(v)).handler(createSsrRpc("d1951a245f1716c64fd15ca3acdfe80f24791bd77d66ca8ac72669fd98966319"));
createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	applicationId: stringType().uuid(),
	decision: enumType([
		"approved",
		"rejected",
		"changes_requested",
		"suspended"
	]),
	notes: stringType().max(1e3).optional()
}).parse(v)).handler(createSsrRpc("7bc6d050362be4b637350410f8da88236f739ffc434b07a08cd678a40a28e6f1"));
//#endregion
export { listRestaurantReviews as a, submitRestaurantApplication as c, uploadRestaurantMedia as d, listRestaurantOrders as i, updateMyRestaurant as l, getMyRestaurant as n, placeOrder as o, getRestaurantStats as r, saveMenuItem as s, deleteMenuItem as t, updateOrderStatus as u };
