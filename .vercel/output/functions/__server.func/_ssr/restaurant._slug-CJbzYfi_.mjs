import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurant._slug-CJbzYfi_.js
var import_jsx_runtime = require_jsx_runtime();
var SplitErrorComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: "mx-auto max-w-md px-4 py-20 text-center",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "We couldn't load this restaurant."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		className: "mt-4 rounded-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/restaurants",
			children: "Back to restaurants"
		})
	})]
});
//#endregion
export { SplitErrorComponent as errorComponent };
