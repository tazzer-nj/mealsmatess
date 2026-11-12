import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime, u as Slot } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BCTXbxsJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-[15px] font-medium tracking-[-0.01em] cursor-pointer transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] disabled:pointer-events-none disabled:bg-[#222222] disabled:text-[#737373] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-white text-[#080808] hover:bg-[#e8e8e8]",
			destructive: "border border-[#ef4444]/35 text-[#ef4444] hover:bg-[#ef4444]/12",
			outline: "border border-[#303030] bg-transparent text-white hover:bg-[#171717] hover:border-[#3f3f46]",
			secondary: "border border-[#262626] bg-[#171717] text-white hover:bg-[#1f1f1f]",
			ghost: "text-[#A1A1AA] hover:bg-[#171717] hover:text-white",
			link: "text-white underline-offset-4 hover:underline"
		},
		size: {
			default: "h-12 px-5",
			sm: "h-10 rounded-[10px] px-4 text-[14px]",
			lg: "h-[52px] rounded-[12px] px-7 text-[15px]",
			icon: "h-11 w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { Button as t };
