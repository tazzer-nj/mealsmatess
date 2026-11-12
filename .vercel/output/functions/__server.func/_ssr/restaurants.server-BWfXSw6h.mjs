import { n as put } from "../_libs/@vercel/blob+[...].mjs";
import { t as firebaseAdmin } from "./firebase-admin-ChN7VIWw.mjs";
import { t as auditLog } from "./security.server-D83_qD0_.mjs";
import { t as slugify } from "./slug-DGI5MEMt.mjs";
import { i as NEXT_STATUS } from "./restaurants.schemas-DO_5wjxM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurants.server-BWfXSw6h.js
function decodeRestaurantImage(base64, contentType) {
	const raw = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
	if (!/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) throw new Error("Invalid image encoding.");
	const bytes = Buffer.from(raw, "base64");
	if (bytes.length > 2097152) throw new Error("Choose an image smaller than 2MB.");
	const png = bytes.subarray(0, 8).equals(Buffer.from([
		137,
		80,
		78,
		71,
		13,
		10,
		26,
		10
	]));
	const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
	const webp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
	const extension = contentType === "image/png" && png ? "png" : contentType === "image/jpeg" && jpeg ? "jpg" : contentType === "image/webp" && webp ? "webp" : null;
	if (!extension) throw new Error("Upload a valid JPEG, PNG or WebP image.");
	return {
		bytes,
		extension
	};
}
/** Only public food/restaurant photos. Membership must be checked before calling. */
async function storeRestaurantImage(restaurantId, kind, base64, contentType) {
	const { bytes, extension } = decodeRestaurantImage(base64, contentType);
	if (!process.env["BLOB_READ_WRITE_TOKEN"] && !process.env["BLOB_STORE_ID"]) throw new Error("Restaurant photo storage is not configured.");
	const blob = await put(`restaurant-media/${restaurantId}/${kind}.${extension}`, bytes, {
		access: "public",
		contentType,
		addRandomSuffix: true,
		allowOverwrite: false,
		cacheControlMaxAge: 31536e3
	});
	return {
		url: blob.url,
		path: blob.pathname
	};
}
async function isAdmin(userId) {
	const { data } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	return !!data;
}
/** Throws unless the user owns (or staffs) the restaurant, or is an admin. */
async function assertMember(userId, restaurantId) {
	const { data: owned } = await firebaseAdmin.from("restaurants").select("id").eq("id", restaurantId).eq("owner_id", userId).maybeSingle();
	if (owned) return;
	const { data: staff } = await firebaseAdmin.from("restaurant_staff").select("id").eq("restaurant_id", restaurantId).eq("user_id", userId).maybeSingle();
	if (staff) return;
	if (await isAdmin(userId)) return;
	throw new Response("Forbidden", { status: 403 });
}
async function uniqueSlug(name) {
	const base = slugify(name) || "restaurant";
	for (let i = 0; i < 20; i++) {
		const candidate = i === 0 ? base : `${base}-${i + 1}`;
		const { data } = await firebaseAdmin.from("restaurants").select("id").eq("slug", candidate).maybeSingle();
		if (!data) return candidate;
	}
	return `${base}-${Date.now().toString(36)}`;
}
async function createApplication(userId, input) {
	const { data: existing } = await firebaseAdmin.from("restaurants").select("id,approval_status").eq("owner_id", userId).maybeSingle();
	if (existing) return {
		restaurantId: existing.id,
		status: existing.approval_status,
		alreadyExists: true
	};
	const slug = await uniqueSlug(input.name);
	const { data: restaurant, error } = await firebaseAdmin.from("restaurants").insert({
		owner_id: userId,
		slug,
		name: input.name,
		owner_name: input.owner_name,
		description: input.description ?? null,
		cuisine: input.cuisine ?? null,
		phone: input.phone,
		email: input.email,
		whatsapp: input.whatsapp ?? null,
		address: input.address,
		business_registration: input.business_registration ?? null,
		price_range: input.price_range ?? null,
		currency: input.currency,
		delivery_fee: input.delivery_fee,
		min_order_amount: input.min_order_amount,
		delivery_radius_km: input.delivery_radius_km,
		delivery_estimate_minutes: input.delivery_estimate_minutes,
		opening_hours: input.opening_hours ?? {},
		approval_status: "pending",
		is_demo: false,
		is_accepting_orders: false,
		supports_delivery: true,
		supports_pickup: true,
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	}).select("id,slug,approval_status").single();
	if (error) throw new Error(error.message);
	if (typeof input.latitude === "number" && typeof input.longitude === "number") await firebaseAdmin.from("restaurant_locations").insert({
		restaurant_id: restaurant.id,
		label: "Main",
		address: input.address,
		latitude: input.latitude,
		longitude: input.longitude
	});
	await firebaseAdmin.from("restaurant_staff").insert({
		restaurant_id: restaurant.id,
		user_id: userId,
		role: "owner"
	});
	await firebaseAdmin.from("restaurant_applications").insert({
		restaurant_id: restaurant.id,
		applicant_id: userId,
		status: "pending",
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		submitted_data: input
	});
	await auditLog({
		actor_id: userId,
		action: "restaurant_application_submitted",
		target_table: "restaurants",
		target_id: restaurant.id
	});
	return {
		restaurantId: restaurant.id,
		status: restaurant.approval_status,
		alreadyExists: false
	};
}
async function fetchMyRestaurant(userId) {
	const { data: restaurant, error: restaurantError } = await firebaseAdmin.from("restaurants").select("*,restaurant_locations(id,label,address,latitude,longitude)").eq("owner_id", userId).maybeSingle();
	if (restaurantError) throw restaurantError;
	if (!restaurant) {
		const { data: staff, error: staffError } = await firebaseAdmin.from("restaurant_staff").select("restaurant_id").eq("user_id", userId).limit(1).maybeSingle();
		if (staffError) throw staffError;
		if (!staff) return {
			restaurant: null,
			application: null,
			menu: []
		};
		const { data: viaStaff, error: viaStaffError } = await firebaseAdmin.from("restaurants").select("*,restaurant_locations(id,label,address,latitude,longitude)").eq("id", staff.restaurant_id).maybeSingle();
		if (viaStaffError) throw viaStaffError;
		if (!viaStaff) return {
			restaurant: null,
			application: null,
			menu: []
		};
		const { data: menu, error: menuError } = await firebaseAdmin.from("menu_items").select("*").eq("restaurant_id", viaStaff.id).order("sort_order");
		if (menuError) throw menuError;
		return {
			restaurant: viaStaff,
			application: null,
			menu: menu ?? []
		};
	}
	const [{ data: application, error: applicationError }, { data: menu, error: menuError }] = await Promise.all([firebaseAdmin.from("restaurant_applications").select("id,status,rejection_reason,requested_changes,admin_notes,reviewed_at,created_at").eq("restaurant_id", restaurant.id).order("created_at", { ascending: false }).limit(1).maybeSingle(), firebaseAdmin.from("menu_items").select("*").eq("restaurant_id", restaurant.id).order("sort_order")]);
	if (applicationError) throw applicationError;
	if (menuError) throw menuError;
	return {
		restaurant,
		application: application ?? null,
		menu: menu ?? []
	};
}
async function updateRestaurantProfile(userId, input) {
	const { restaurantId, latitude, longitude, opening_hours, ...rest } = input;
	await assertMember(userId, restaurantId);
	const patch = { ...rest };
	if (opening_hours) patch["opening_hours"] = opening_hours;
	Object.keys(patch).forEach((k) => patch[k] === void 0 && delete patch[k]);
	if (Object.keys(patch).length > 0) {
		const { error } = await firebaseAdmin.from("restaurants").update(patch).eq("id", restaurantId);
		if (error) throw new Error(error.message);
	}
	if (typeof latitude === "number" && typeof longitude === "number") {
		const { data: loc } = await firebaseAdmin.from("restaurant_locations").select("id").eq("restaurant_id", restaurantId).limit(1).maybeSingle();
		if (loc) await firebaseAdmin.from("restaurant_locations").update({
			latitude,
			longitude,
			address: rest.address ?? null
		}).eq("id", loc.id);
		else await firebaseAdmin.from("restaurant_locations").insert({
			restaurant_id: restaurantId,
			label: "Main",
			latitude,
			longitude,
			address: rest.address ?? null
		});
	}
	return { ok: true };
}
async function uploadMedia(userId, input) {
	if (!input.contentType.startsWith("image/")) throw new Response("Only images are allowed", { status: 400 });
	let restaurantId = input.restaurantId;
	if (restaurantId) await assertMember(userId, restaurantId);
	else {
		const { data } = await firebaseAdmin.from("restaurants").select("id").eq("owner_id", userId).maybeSingle();
		if (!data) throw new Response("No restaurant found", { status: 404 });
		restaurantId = data.id;
	}
	const { url, path } = await storeRestaurantImage(restaurantId, input.kind, input.base64, input.contentType);
	if (input.kind === "logo") {
		const { error } = await firebaseAdmin.from("restaurants").update({ logo_url: url }).eq("id", restaurantId);
		if (error) throw error;
	} else if (input.kind === "cover") {
		const { error } = await firebaseAdmin.from("restaurants").update({ cover_image_url: url }).eq("id", restaurantId);
		if (error) throw error;
	} else if (input.kind === "food") {
		const { data: r, error: readError } = await firebaseAdmin.from("restaurants").select("food_photos").eq("id", restaurantId).maybeSingle();
		if (readError) throw readError;
		const photos = Array.isArray(r?.food_photos) ? r.food_photos : [];
		const { error } = await firebaseAdmin.from("restaurants").update({ food_photos: [...photos, url].slice(0, 20) }).eq("id", restaurantId);
		if (error) throw error;
	}
	return {
		url,
		path
	};
}
async function persistMenuItem(userId, input) {
	await assertMember(userId, input.restaurantId);
	const row = {
		restaurant_id: input.restaurantId,
		name: input.name,
		description: input.description ?? null,
		image_url: input.image_url ?? null,
		price: input.price,
		category: input.category ?? null,
		is_available: input.is_available,
		sort_order: input.sort_order
	};
	if (input.id) {
		const { data, error } = await firebaseAdmin.from("menu_items").update(row).eq("id", input.id).eq("restaurant_id", input.restaurantId).select("*").single();
		if (error) throw new Error(error.message);
		return data;
	}
	const { data, error } = await firebaseAdmin.from("menu_items").insert({
		...row,
		is_hidden: false,
		dietary_tags: [],
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	}).select("*").single();
	if (error) throw new Error(error.message);
	return data;
}
async function removeMenuItem(userId, id) {
	const { data: item } = await firebaseAdmin.from("menu_items").select("id,restaurant_id").eq("id", id).maybeSingle();
	if (!item) return { ok: true };
	await assertMember(userId, item.restaurant_id);
	const { error } = await firebaseAdmin.from("menu_items").delete().eq("id", id);
	if (error) throw new Error(error.message);
	return { ok: true };
}
var ACTIVE_STATUSES = [
	"new",
	"accepted",
	"preparing",
	"ready",
	"out_for_delivery"
];
async function fetchRestaurantOrders(userId, restaurantId, scope) {
	await assertMember(userId, restaurantId);
	const statuses = scope === "active" ? ACTIVE_STATUSES : ["completed", "cancelled"];
	const { data, error } = await firebaseAdmin.from("restaurant_orders").select("id,status,subtotal,delivery_fee,total,currency,delivery_address,contact_phone,notes,placed_at,completed_at,rejection_reason,order_items(id,name,unit_price,quantity,notes)").eq("restaurant_id", restaurantId).in("status", statuses).order("placed_at", { ascending: false }).limit(100);
	if (error) throw new Error(error.message);
	const orders = data ?? [];
	if (!orders.length) return [];
	const { data: items, error: itemsError } = await firebaseAdmin.from("order_items").select("*").in("order_id", orders.map((order) => order.id));
	if (itemsError) throw itemsError;
	return orders.map((order) => ({
		...order,
		order_items: (items ?? []).filter((item) => item.order_id === order.id)
	}));
}
async function setOrderStatus(userId, orderId, status, reason) {
	const { data: order } = await firebaseAdmin.from("restaurant_orders").select("id,restaurant_id,status").eq("id", orderId).maybeSingle();
	if (!order) throw new Response("Order not found", { status: 404 });
	await assertMember(userId, order.restaurant_id);
	if (!(NEXT_STATUS[order.status] ?? []).includes(status)) throw new Response(`Cannot move order from ${order.status} to ${status}`, { status: 400 });
	const patch = { status };
	if (status === "completed") patch["completed_at"] = (/* @__PURE__ */ new Date()).toISOString();
	if (status === "cancelled") patch["rejection_reason"] = reason ?? null;
	const { error } = await firebaseAdmin.from("restaurant_orders").update(patch).eq("id", orderId);
	if (error) throw new Error(error.message);
	await auditLog({
		actor_id: userId,
		action: "restaurant_order_status_changed",
		target_table: "restaurant_orders",
		target_id: orderId,
		metadata: {
			from: order.status,
			to: status
		}
	});
	return {
		ok: true,
		status
	};
}
async function fetchRestaurantStats(userId, restaurantId) {
	await assertMember(userId, restaurantId);
	const since = (/* @__PURE__ */ new Date(Date.now() - 2592e6)).toISOString();
	const { data, error } = await firebaseAdmin.from("restaurant_orders").select("status,total,placed_at").eq("restaurant_id", restaurantId).gte("placed_at", since);
	if (error) throw new Error(error.message);
	const rows = data ?? [];
	const completed = rows.filter((r) => r.status === "completed");
	const revenue = completed.reduce((s, r) => s + Number(r.total ?? 0), 0);
	const byDay = /* @__PURE__ */ new Map();
	for (const r of completed) {
		const day = String(r.placed_at).slice(0, 10);
		byDay.set(day, (byDay.get(day) ?? 0) + Number(r.total ?? 0));
	}
	return {
		orders30d: rows.length,
		completed30d: completed.length,
		active: rows.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
		revenue30d: Math.round(revenue * 100) / 100,
		avgOrder: completed.length ? Math.round(revenue / completed.length * 100) / 100 : 0,
		daily: [...byDay.entries()].sort().map(([date, total]) => ({
			date,
			total
		}))
	};
}
async function persistOrder(userId, input) {
	const { data: restaurant } = await firebaseAdmin.from("restaurants").select("id,approval_status,is_accepting_orders,delivery_fee,min_order_amount,currency").eq("id", input.restaurantId).maybeSingle();
	if (!restaurant || restaurant.approval_status !== "approved") throw new Response("Restaurant unavailable", { status: 404 });
	if (!restaurant.is_accepting_orders) throw new Response("This restaurant is not accepting orders right now", { status: 400 });
	const ids = input.items.map((i) => i.menu_item_id);
	const { data: menuItems, error: menuErr } = await firebaseAdmin.from("menu_items").select("id,name,price,is_available,is_hidden,restaurant_id").in("id", ids).eq("restaurant_id", input.restaurantId);
	if (menuErr) throw new Error(menuErr.message);
	const map = new Map((menuItems ?? []).map((m) => [m.id, m]));
	const lines = input.items.map((i) => {
		const item = map.get(i.menu_item_id);
		if (!item || item.is_hidden || !item.is_available) throw new Response("An item in your cart is no longer available", { status: 400 });
		return {
			menu_item_id: item.id,
			name: item.name,
			unit_price: Number(item.price),
			quantity: i.quantity,
			notes: i.notes ?? null
		};
	});
	const subtotal = Math.round(lines.reduce((s, l) => s + l.unit_price * l.quantity, 0) * 100) / 100;
	if (subtotal < Number(restaurant.min_order_amount ?? 0)) throw new Response(`Minimum order is ${restaurant.min_order_amount}`, { status: 400 });
	const deliveryFee = Number(restaurant.delivery_fee ?? 0);
	const total = Math.round((subtotal + deliveryFee) * 100) / 100;
	const { data: order, error } = await firebaseAdmin.from("restaurant_orders").insert({
		order_number: `MM-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
		restaurant_id: restaurant.id,
		customer_id: userId,
		status: "new",
		subtotal,
		delivery_fee: deliveryFee,
		total,
		currency: restaurant.currency,
		delivery_address: input.delivery_address,
		contact_phone: input.contact_phone,
		notes: input.notes ?? null
	}).select("id").single();
	if (error) throw new Error(error.message);
	const { error: itemsErr } = await firebaseAdmin.from("order_items").insert(lines.map((l) => ({
		...l,
		order_id: order.id
	})));
	if (itemsErr) throw new Error(itemsErr.message);
	return {
		orderId: order.id,
		subtotal,
		deliveryFee,
		total,
		currency: restaurant.currency
	};
}
async function assertAdmin(userId) {
	if (!await isAdmin(userId)) throw new Response("Forbidden", { status: 403 });
}
async function adminListApplications(userId, status) {
	await assertAdmin(userId);
	let q = firebaseAdmin.from("restaurant_applications").select("id,status,created_at,reviewed_at,rejection_reason,requested_changes,admin_notes,restaurant_id,submitted_data,restaurants(name,slug,cuisine,address,phone,email,owner_name,logo_url,approval_status)").order("created_at", { ascending: false }).limit(100);
	if (status !== "all") q = q.eq("status", status);
	const { data, error } = await q;
	if (error) throw new Error(error.message);
	return data ?? [];
}
async function adminReviewApplication(userId, input) {
	await assertAdmin(userId);
	const { data: app } = await firebaseAdmin.from("restaurant_applications").select("id,restaurant_id").eq("id", input.applicationId).maybeSingle();
	if (!app) throw new Response("Application not found", { status: 404 });
	await firebaseAdmin.from("restaurant_applications").update({
		status: input.decision,
		admin_notes: input.notes ?? null,
		rejection_reason: input.decision === "rejected" ? input.notes ?? null : null,
		requested_changes: input.decision === "changes_requested" ? input.notes ?? null : null,
		reviewed_by: userId,
		reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", input.applicationId);
	if (app.restaurant_id) await firebaseAdmin.from("restaurants").update({
		approval_status: input.decision,
		is_verified: input.decision === "approved"
	}).eq("id", app.restaurant_id);
	await auditLog({
		actor_id: userId,
		action: "restaurant_application_reviewed",
		target_table: "restaurant_applications",
		target_id: input.applicationId,
		metadata: { decision: input.decision }
	});
	return { ok: true };
}
//#endregion
export { adminListApplications, adminReviewApplication, createApplication, fetchMyRestaurant, fetchRestaurantOrders, fetchRestaurantStats, persistMenuItem, persistOrder, removeMenuItem, setOrderStatus, updateRestaurantProfile, uploadMedia };
