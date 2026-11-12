import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as Camera, Ht as CalendarDays, P as Refrigerator, Yt as ArrowUp, nt as LoaderCircle, vt as Eye, wt as Crown } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useMia } from "./use-mia-9WMlFWqd.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as Route } from "./chat-BXwKxpfI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-Boi8jVmx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var mealmate_chef_default = "/assets/mealmate-chef-DjtWIjMA.png";
function ChefMascot({ className, animate = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: mealmate_chef_default,
		alt: "MealMate avocado chef",
		width: 1024,
		height: 1024,
		className: cn("object-contain", animate && "mascot-float", className)
	});
}
function CookingInput({ value, onChange, onSubmit, busy = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			onSubmit();
		},
		className: "cooking-input rounded-3xl border border-border bg-popover p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			"aria-label": "Ask MealMate",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder: "What can I cook today?",
			maxLength: 200,
			className: "h-11 min-w-0 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-11 rounded-full",
						title: "Scan ingredients",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/scan",
							search: { mode: "ingredients" },
							"aria-label": "Scan ingredients",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-11 rounded-full",
						title: "Pantry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pantry",
							"aria-label": "Pantry",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refrigerator, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-11 rounded-full",
						title: "Meal planner",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/planner",
							"aria-label": "Meal planner",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {})
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "icon",
				className: "size-11 shrink-0 rounded-full",
				disabled: busy || !value.trim(),
				"aria-label": "Send question",
				children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, {})
			})]
		})]
	});
}
var VisualExplainer = (0, import_react.lazy)(() => import("./visual-explainer-Cl_Rav73.mjs").then((m) => ({ default: m.VisualExplainer })));
var SUGGESTIONS = [
	"What can I cook with chicken and rice?",
	"What can I substitute for buttermilk?",
	"Give me a quick vegetarian dinner idea",
	"What pairs well with bunny chow?"
];
function ChatPage() {
	const { isPremium } = usePremium();
	const { q } = Route.useSearch();
	const [question, setQuestion] = (0, import_react.useState)(q ?? "");
	const endRef = (0, import_react.useRef)(null);
	const mia = useMia();
	const { turns, busy } = mia;
	const [visualMode, setVisualMode] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (turns.length) endRef.current?.scrollIntoView({
			block: "end",
			behavior: "smooth"
		});
	}, [turns, busy]);
	async function ask(question) {
		if (!question.trim() || busy) return;
		setQuestion("");
		mia.endConversation();
		try {
			await mia.ask(question, { visual: isPremium && visualMode });
		} catch (error) {
			toast.error("Couldn't answer that", { description: error instanceof Error ? error.message : "Mia is unavailable. Please try again." });
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10",
		children: [
			turns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefMascot, {
						animate: true,
						className: "h-48 w-48"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 font-display text-3xl",
						children: "Your little kitchen companion."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted-foreground",
						children: "What's cooking, Chef?"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "MealMate Chef"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-center",
				children: isPremium ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "rounded-full",
					"aria-pressed": visualMode,
					onClick: () => setVisualMode((v) => !v),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {}),
						" Visual Mode ",
						visualMode ? "on" : "off"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					className: "rounded-full text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {}), " Premium Visual Mode"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex-1 space-y-6",
				children: [
					turns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							type: "button",
							onClick: () => ask(s),
							className: "rounded-full border border-border bg-card px-4 py-2 text-left text-sm transition-colors hover:bg-muted",
							children: s
						}, s))
					}),
					turns.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground",
								children: t.question
							}),
							t.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mr-auto max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm",
								children: t.answer
							}),
							t.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "alert",
								className: "flex flex-wrap items-center gap-3 text-sm text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t.error }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => void mia.retry(t.id),
									disabled: busy,
									children: "Try again"
								})]
							}),
							t.visualLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Directing your animated explainer — illustrations + narration…"]
							}),
							t.visualError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-xs text-muted-foreground",
								children: ["Visual explanation unavailable: ", t.visualError]
							}),
							t.visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-muted" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisualExplainer, { data: t.visual })
							})
						]
					}, t.id)),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Thinking…"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "chat-composer sticky bottom-3 mt-6 bg-background pb-2 pt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CookingInput, {
					value: question,
					onChange: setQuestion,
					onSubmit: () => {
						ask(question);
					},
					busy
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground",
				children: "AI answers can be wrong — use judgment for allergies and safety."
			})
		]
	});
}
//#endregion
export { ChatPage as component };
