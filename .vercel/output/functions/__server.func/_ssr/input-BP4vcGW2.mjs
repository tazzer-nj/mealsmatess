import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-BP4vcGW2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-[50px] w-full rounded-[12px] border border-[#303030] bg-[#141414] px-4 py-1 text-[15px] text-white transition-[border-color,box-shadow] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#71717A] focus-visible:outline-none focus-visible:border-[#52525B] focus-visible:ring-[3px] focus-visible:ring-white/[0.07] disabled:cursor-not-allowed disabled:bg-[#222222] disabled:text-[#737373]", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
//#endregion
export { Input as t };
