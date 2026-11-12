import { a as objectType, i as numberType, n as booleanType, o as recordType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
var MAX_RESTAURANT_IMAGE_BASE64 = Math.ceil(2097152 / 3) * 4 + 100;
var RESTAURANT_IMAGE_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp"
];
var ORDER_STATUS_FLOW = [
	"new",
	"accepted",
	"preparing",
	"ready",
	"out_for_delivery",
	"completed",
	"cancelled"
];
var ORDER_STATUS_LABEL = {
	new: "New",
	accepted: "Accepted",
	preparing: "Preparing",
	ready: "Ready",
	out_for_delivery: "Out for delivery",
	completed: "Completed",
	cancelled: "Cancelled"
};
/** Allowed forward transitions for a restaurant-managed order. */
var NEXT_STATUS = {
	new: ["accepted", "cancelled"],
	accepted: ["preparing", "cancelled"],
	preparing: ["ready", "cancelled"],
	ready: [
		"out_for_delivery",
		"completed",
		"cancelled"
	],
	out_for_delivery: ["completed", "cancelled"],
	completed: [],
	cancelled: []
};
var TRACKING_STEPS = [
	"new",
	"accepted",
	"preparing",
	"ready",
	"out_for_delivery",
	"completed"
];
var OpeningHoursSchema = recordType(stringType(), objectType({
	open: stringType().max(5),
	close: stringType().max(5),
	closed: booleanType().optional()
})).optional();
var ApplicationSchema = objectType({
	name: stringType().min(2).max(120),
	owner_name: stringType().min(2).max(120),
	description: stringType().max(2e3).optional(),
	cuisine: stringType().max(60).optional(),
	phone: stringType().min(5).max(30),
	email: stringType().email().max(160),
	whatsapp: stringType().max(30).optional(),
	address: stringType().min(4).max(300),
	latitude: numberType().min(-90).max(90).optional(),
	longitude: numberType().min(-180).max(180).optional(),
	business_registration: stringType().max(120).optional(),
	price_range: enumType([
		"$",
		"$$",
		"$$$",
		"$$$$"
	]).optional(),
	currency: stringType().length(3).default("ZAR"),
	delivery_fee: numberType().min(0).max(1e3).default(0),
	min_order_amount: numberType().min(0).max(1e4).default(0),
	delivery_radius_km: numberType().min(.5).max(100).default(10),
	delivery_estimate_minutes: numberType().int().min(5).max(240).default(35),
	opening_hours: OpeningHoursSchema
});
var ProfileUpdateSchema = objectType({
	restaurantId: stringType().uuid(),
	name: stringType().min(2).max(120).optional(),
	description: stringType().max(2e3).optional(),
	cuisine: stringType().max(60).optional(),
	phone: stringType().max(30).optional(),
	email: stringType().email().max(160).optional(),
	whatsapp: stringType().max(30).optional(),
	address: stringType().max(300).optional(),
	price_range: enumType([
		"$",
		"$$",
		"$$$",
		"$$$$"
	]).optional(),
	delivery_fee: numberType().min(0).max(1e3).optional(),
	min_order_amount: numberType().min(0).max(1e4).optional(),
	delivery_radius_km: numberType().min(.5).max(100).optional(),
	delivery_estimate_minutes: numberType().int().min(5).max(240).optional(),
	is_accepting_orders: booleanType().optional(),
	opening_hours: OpeningHoursSchema,
	latitude: numberType().min(-90).max(90).optional(),
	longitude: numberType().min(-180).max(180).optional()
});
var MenuItemSchema = objectType({
	id: stringType().uuid().optional(),
	restaurantId: stringType().uuid(),
	name: stringType().min(1).max(120),
	description: stringType().max(1e3).optional(),
	image_url: stringType().url().max(1e3).optional().nullable(),
	price: numberType().min(0).max(1e5),
	category: stringType().max(60).optional(),
	is_available: booleanType().default(true),
	sort_order: numberType().int().min(0).max(9999).default(0)
});
var OrderInputSchema = objectType({
	restaurantId: stringType().uuid(),
	items: arrayType(objectType({
		menu_item_id: stringType().uuid(),
		quantity: numberType().int().min(1).max(50),
		notes: stringType().max(200).optional()
	})).min(1).max(50),
	delivery_address: stringType().min(4).max(300),
	contact_phone: stringType().min(5).max(30),
	notes: stringType().max(500).optional()
});
//#endregion
export { ORDER_STATUS_FLOW as a, ProfileUpdateSchema as c, NEXT_STATUS as i, RESTAURANT_IMAGE_TYPES as l, MAX_RESTAURANT_IMAGE_BASE64 as n, ORDER_STATUS_LABEL as o, MenuItemSchema as r, OrderInputSchema as s, ApplicationSchema as t, TRACKING_STEPS as u };
