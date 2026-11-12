import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/skeleton-sb0rC7yB.js
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "status",
		"aria-live": "polite",
		"aria-busy": "true",
		className: cn("relative overflow-hidden rounded-md bg-muted skeleton-shimmer", className),
		...props
	});
}
//#endregion
export { Skeleton as t };
