import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { o as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import { i as auth } from "./hub-surface-DqCmg7ui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.callback-BwRmX6-q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthCallbackPage() {
	const navigate = useNavigate();
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const errorDescription = new URLSearchParams(window.location.search).get("error_description");
		if (errorDescription) {
			setError(errorDescription);
			return;
		}
		if (auth.currentUser) {
			navigate({
				to: "/",
				replace: true
			});
			return;
		}
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) navigate({
				to: "/",
				replace: true
			});
		});
		const timeout = window.setTimeout(() => {
			if (!auth.currentUser) setError("Google sign-in could not be completed. Please try again.");
		}, 1e4);
		return () => {
			unsubscribe();
			window.clearTimeout(timeout);
		};
	}, [navigate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex flex-1 items-center justify-center px-6 py-20 text-center",
		children: error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-destructive",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "text-sm underline",
				onClick: () => void navigate({
					to: "/auth",
					replace: true
				}),
				children: "Return to sign in"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Completing sign-in…"]
		})
	});
}
//#endregion
export { AuthCallbackPage as component };
