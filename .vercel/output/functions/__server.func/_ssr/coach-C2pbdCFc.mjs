import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as Send, Lt as ChevronRight, mt as HeartPulse, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { a as objectType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coach-C2pbdCFc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MessageSchema = objectType({
	role: enumType(["user", "assistant"]),
	content: stringType().min(1).max(2e3)
});
var InputSchema = objectType({ messages: arrayType(MessageSchema).min(1).max(30) });
var nutritionCoach = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => InputSchema.parse(v)).handler(createSsrRpc("2ac9957454b923e50fa7cbe98089c71666c4035f6878a51a5be78be56a719534"));
var getCoachContext = createServerFn({ method: "GET" }).middleware([requirePremium]).handler(createSsrRpc("5da961d855c6b80baf00c15d9c08942fa13be55dd33b9ff909bd1d284ea2f9b8"));
var STARTERS = [
	"What should I eat today to hit my goal?",
	"Plan a high-protein breakfast under 400 calories.",
	"I'm short on time tonight — quick dinner ideas?",
	"How many calories should I actually eat?"
];
function CoachPage() {
	const { user, loading } = useSession();
	const { data: ctx, isLoading: ctxLoading } = useQuery({
		queryKey: ["coach-context"],
		queryFn: () => getCoachContext(),
		enabled: !!user
	});
	const [turns, setTurns] = (0, import_react.useState)([]);
	const [input, setInput] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const endRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [turns, busy]);
	async function ask(q) {
		const text = q.trim();
		if (!text || busy) return;
		const next = [...turns, {
			role: "user",
			content: text
		}];
		setTurns(next);
		setInput("");
		setBusy(true);
		try {
			const { answer } = await nutritionCoach({ data: { messages: next } });
			setTurns((t) => [...t, {
				role: "assistant",
				content: answer
			}]);
		} catch (err) {
			toast.error("Coach is unavailable", { description: err instanceof Error ? err.message : void 0 });
			setTurns(next);
		} finally {
			setBusy(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-4 w-72" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-8 h-24 w-full rounded-2xl" })
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-3xl",
				children: "AI Nutrition Coach"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted-foreground",
				children: "Sign in so your coach can personalize advice to your goals, allergies, and daily budget."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				className: "mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground",
				children: "Sign in"
			})
		]
	});
	const missing = ctx?.missing ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-tight",
						children: "Nutrition Coach"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Personalized advice for your goals, allergies, and daily budget."
					})]
				})]
			}),
			ctxLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-16 w-full rounded-2xl" }) : ctx ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-2xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [
						ctx.profile?.goal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { label: `Goal · ${ctx.profile.goal}` }),
						ctx.profile?.activity_level && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { label: `Activity · ${ctx.profile.activity_level}` }),
						ctx.profile?.dietary_preferences?.slice(0, 3).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { label: d }, d)),
						ctx.profile?.allergies?.slice(0, 3).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							label: `No ${a}`,
							tone: "warn"
						}, a)),
						ctx.profile?.budget_per_day && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { label: `Budget · ${ctx.profile.budget_per_day} ${ctx.profile.currency ?? "USD"}/day` })
					]
				}), missing.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/profile",
					className: "mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Add your ",
						missing.slice(0, 3).join(", "),
						" for sharper advice."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 flex-1 space-y-4",
				children: [
					turns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-dashed border-border p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "Try asking:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => ask(s),
								className: "md3-surface rounded-full border border-border bg-card px-3.5 py-2 text-left text-xs font-medium",
								children: s
							}, s))
						})]
					}),
					turns.map((t, i) => t.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rise-in max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground",
							children: t.content
						})
					}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rise-in max-w-[92%] space-y-2 rounded-2xl rounded-bl-sm bg-card px-4 py-3 text-sm leading-relaxed [&_h3]:font-display [&_h3]:text-base [&_h3]:mt-2 [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold [&_a]:underline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: t.content })
						})
					}, i)),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Coach is thinking…"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					ask(input);
				},
				className: "sticky bottom-24 mt-6 flex gap-2 rounded-full border border-border bg-card p-1.5 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "coach-input",
						className: "sr-only",
						children: "Ask your nutrition coach"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "coach-input",
						value: input,
						onChange: (e) => setInput(e.target.value),
						placeholder: "Ask about calories, meals, cravings…",
						className: "h-11 flex-1 rounded-full border-none bg-transparent shadow-none focus-visible:ring-0",
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						disabled: busy || !input.trim(),
						className: "h-11 w-11 rounded-full",
						"aria-label": "Send message",
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground",
				children: "Educational guidance, not medical advice."
			})
		]
	});
}
function Chip({ label, tone = "neutral" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: tone === "warn" ? "inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive" : "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium",
		children: label
	});
}
//#endregion
export { CoachPage as component };
