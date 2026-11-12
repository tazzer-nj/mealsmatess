import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as X, wt as Crown } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { r as app } from "./hub-surface-DqCmg7ui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upgrade-modal-Onxoqw7b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function requestBrowserPushToken() {
	if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("Push notifications are not supported in this browser.");
	throw new Error("Web Push is not configured for this app yet.");
}
async function revokeBrowserPushToken() {
	if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
	const { deleteToken, getMessaging, isSupported } = await import("../_libs/firebase.mjs").then((n) => n.t);
	if (!await isSupported()) return;
	await deleteToken(getMessaging(app));
}
async function listenForForegroundPush(onNotification) {
	if (typeof window === "undefined") return () => void 0;
	const { getMessaging, isSupported, onMessage } = await import("../_libs/firebase.mjs").then((n) => n.t);
	if (!await isSupported()) return () => void 0;
	return onMessage(getMessaging(app), (payload) => {
		const title = payload.notification?.title;
		if (title) onNotification({
			title,
			body: payload.notification?.body ?? ""
		});
	});
}
var UpgradeCtx = (0, import_react.createContext)(null);
function UpgradeModalProvider({ children }) {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)();
	const ctx = (0, import_react.useMemo)(() => ({
		open: (r) => {
			setReason(r);
			setIsOpen(true);
		},
		close: () => setIsOpen(false)
	}), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UpgradeCtx.Provider, {
		value: ctx,
		children: [children, isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpgradeSheet, {
			...reason ? { reason } : {},
			onClose: () => setIsOpen(false)
		})]
	});
}
function useUpgradeModal() {
	const ctx = (0, import_react.useContext)(UpgradeCtx);
	if (!ctx) throw new Error("useUpgradeModal must be used inside <UpgradeModalProvider>");
	return ctx;
}
/** An in-app prompt; subscription access itself is enforced by ConsumerAccessGate. */
function UpgradeSheet({ reason, onClose }) {
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-md sm:items-center",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "upgrade-title",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-md rounded-t-[32px] border border-border bg-background px-6 pb-8 pt-10 shadow-2xl sm:rounded-[32px]",
			onClick: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				"aria-label": "Close",
				className: "absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm transition hover:text-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "upgrade-title",
						className: "mt-4 font-display text-2xl font-bold",
						children: "MealMate Premium"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: reason ?? "Enjoy AI-powered recipes, meal planning, food scanning and nutrition insights."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "View available plans, prices and trial eligibility on the subscription page."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/premium",
						onClick: onClose,
						className: "mt-6 block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "h-12 w-full rounded-2xl",
							children: "View subscription plans"
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { useUpgradeModal as a, revokeBrowserPushToken as i, listenForForegroundPush as n, requestBrowserPushToken as r, UpgradeModalProvider as t };
