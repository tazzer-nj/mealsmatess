import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { o as ORDER_STATUS_LABEL, u as TRACKING_STEPS } from "./restaurants.schemas-DO_5wjxM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bits-CMPYjCg6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "mealmate.coords.v1";
/** Great-circle distance in kilometres. */
function haversineKm(a, b) {
	const R = 6371;
	const dLat = (b.latitude - a.latitude) * Math.PI / 180;
	const dLon = (b.longitude - a.longitude) * Math.PI / 180;
	const lat1 = a.latitude * Math.PI / 180;
	const lat2 = b.latitude * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function formatDistance(km) {
	if (km === null || !Number.isFinite(km)) return "—";
	if (km < 1) return `${Math.round(km * 1e3)} m`;
	return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}
function readCached() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (typeof parsed?.latitude === "number" && typeof parsed?.longitude === "number") return parsed;
	} catch {}
	return null;
}
/**
* Location is only ever read after the user explicitly asks for it (or when a
* previous grant was cached in this browser).
*/
function useUserLocation() {
	const [coords, setCoords] = (0, import_react.useState)(null);
	const [state, setState] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => {
		const cached = readCached();
		if (cached) {
			setCoords(cached);
			setState("granted");
		}
	}, []);
	return {
		coords,
		state,
		request: (0, import_react.useCallback)(() => {
			if (typeof navigator === "undefined" || !navigator.geolocation) {
				setState("unsupported");
				return;
			}
			setState("prompting");
			navigator.geolocation.getCurrentPosition((pos) => {
				const next = {
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude
				};
				setCoords(next);
				setState("granted");
				try {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
				} catch {}
			}, () => setState("denied"), {
				enableHighAccuracy: false,
				timeout: 1e4,
				maximumAge: 3e5
			});
		}, []),
		clear: (0, import_react.useCallback)(() => {
			setCoords(null);
			setState("idle");
			try {
				window.localStorage.removeItem(STORAGE_KEY);
			} catch {}
		}, [])
	};
}
var DAY_KEYS = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function minutes(hhmm) {
	const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
	if (!m) return null;
	return Number(m[1]) * 60 + Number(m[2]);
}
/** Is the restaurant open right now, per its opening_hours JSON? */
function isOpenNow(openingHours, now = /* @__PURE__ */ new Date()) {
	if (!openingHours || typeof openingHours !== "object") return null;
	const today = openingHours[DAY_KEYS[now.getDay()]];
	if (!today) return null;
	if (today.closed) return false;
	const open = today.open ? minutes(today.open) : null;
	const close = today.close ? minutes(today.close) : null;
	if (open === null || close === null) return null;
	const cur = now.getHours() * 60 + now.getMinutes();
	if (close <= open) return cur >= open || cur < close;
	return cur >= open && cur < close;
}
function money(value, currency = "ZAR") {
	const n = Number(value ?? 0);
	try {
		return new Intl.NumberFormat(void 0, {
			style: "currency",
			currency
		}).format(n);
	} catch {
		return `${currency} ${n.toFixed(2)}`;
	}
}
function OpenBadge({ hours }) {
	const open = isOpenNow(hours);
	if (open === null) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: open ? "default" : "secondary",
		className: "rounded-full",
		children: open ? "Open now" : "Closed"
	});
}
function StatusTracker({ status }) {
	if (status === "cancelled") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground",
		children: "This order was cancelled."
	});
	const currentIndex = TRACKING_STEPS.indexOf(status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "space-y-0",
		"aria-label": "Order progress",
		children: TRACKING_STEPS.map((step, i) => {
			const done = i <= currentIndex;
			const active = i === currentIndex;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: `mt-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${done ? "border-primary bg-primary" : "border-border bg-background"} ${active ? "ring-4 ring-primary/20" : ""}`,
						children: done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-primary-foreground" })
					}), i < TRACKING_STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: `w-0.5 flex-1 ${i < currentIndex ? "bg-primary" : "bg-border"}`,
						style: { minHeight: 28 }
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-sm ${active ? "font-semibold text-foreground" : done ? "text-foreground" : "text-muted-foreground"}`,
						children: ORDER_STATUS_LABEL[step]
					}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: step === "new" ? "Waiting for the restaurant to accept" : step === "accepted" ? "Your order is confirmed" : step === "preparing" ? "The kitchen is on it" : step === "ready" ? "Ready for pickup / handover" : step === "out_for_delivery" ? "On the way to you" : "Enjoy your meal!"
					})]
				})]
			}, step);
		})
	});
}
//#endregion
export { isOpenNow as a, haversineKm as i, StatusTracker as n, money as o, formatDistance as r, useUserLocation as s, OpenBadge as t };
