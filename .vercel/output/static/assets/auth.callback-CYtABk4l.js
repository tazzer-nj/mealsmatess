import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { n as useNavigate } from "./useNavigate-BlI0eDHL.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { k as onAuthStateChanged, r as auth } from "./firebase-Ccym_bIx.js";
import { t as LoaderCircle } from "./loader-circle-DQwT8cZ8.js";
//#region src/routes/auth.callback.tsx?tsr-split=component
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
