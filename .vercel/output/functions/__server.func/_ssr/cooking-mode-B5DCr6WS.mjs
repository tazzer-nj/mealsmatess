import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Lt as ChevronRight, Rt as ChevronLeft, g as Timer, n as X } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { r as useOptionalMia } from "./use-mia-9WMlFWqd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cooking-mode-B5DCr6WS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CookingMode({ name, steps, onClose, onComplete }) {
	const setRecipe = useOptionalMia()?.setRecipe;
	const [i, setI] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setRecipe?.({
			name,
			steps: steps.slice(0, 40).map((step) => step.slice(0, 1e3)),
			step: i
		}, setI);
		return () => setRecipe?.(null);
	}, [
		name,
		steps,
		i,
		setRecipe
	]);
	const [seconds, setSeconds] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (seconds === null) return;
		if (seconds <= 0) return;
		const t = setInterval(() => setSeconds((s) => s !== null ? Math.max(0, s - 1) : null), 1e3);
		return () => clearInterval(t);
	}, [seconds]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
			if (e.key === "ArrowRight") setI((v) => Math.min(steps.length - 1, v + 1));
			if (e.key === "ArrowLeft") setI((v) => Math.max(0, v - 1));
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [steps.length, onClose]);
	const step = steps[i] ?? "";
	const pct = steps.length ? (i + 1) / steps.length * 100 : 0;
	const mm = seconds !== null ? Math.floor(seconds / 60).toString().padStart(2, "0") : "00";
	const ss = seconds !== null ? (seconds % 60).toString().padStart(2, "0") : "00";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: "Cooking"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate font-display text-lg",
						children: name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					onClick: onClose,
					"aria-label": "Close cooking mode",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 w-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-full bg-primary transition-all",
					style: { width: `${pct}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex flex-1 flex-col items-center justify-center px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Step ",
							i + 1,
							" of ",
							steps.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-2xl text-2xl leading-relaxed md:text-3xl",
						children: step
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, { className: "h-4 w-4 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-lg tabular-nums",
								children: [
									mm,
									":",
									ss
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-2 flex gap-1",
								children: [[
									1,
									3,
									5,
									10,
									15
								].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => setSeconds(m * 60),
									children: [m, "m"]
								}, m)), seconds !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setSeconds(null),
									children: "Reset"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "flex items-center justify-between gap-3 border-t border-border p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: () => setI((v) => Math.max(0, v - 1)),
					disabled: i === 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-1 h-4 w-4" }), " Previous"]
				}), i < steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setI((v) => Math.min(steps.length - 1, v + 1)),
					children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-4 w-4" })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						onComplete?.();
						onClose();
					},
					children: "Done"
				})]
			})
		]
	});
}
//#endregion
export { CookingMode };
