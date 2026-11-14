import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { n as toast } from "./dist-BV242RuG.js";
import { i as createClientRpc, r as createServerFn } from "./firebase-auth-middleware-6QZ-o3Bh.js";
import { t as Link } from "./link-DqHkHLEB.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { t as useQuery } from "./useQuery-C9s6b3XV.js";
import { n as useSession } from "./use-session-DrDo_MXn.js";
import { t as HeartPulse } from "./heart-pulse-B39KU_sy.js";
import { t as LoaderCircle } from "./loader-circle-DQwT8cZ8.js";
import { t as Send } from "./send-9kBDpjmk.js";
import { t as Button } from "./button-yWWHKMUk.js";
import { t as Input } from "./input-Cfa9G600.js";
import { t as requirePremium } from "./premium-middleware-C2B7KFxy.js";
import { Ft as ChevronRight } from "./index-CfUBRHG1.js";
import { t as Markdown } from "./lib-B-Zv_iMQ.js";
import { t as Skeleton } from "./skeleton-5niEaHfy.js";
//#region src/lib/coach.functions.ts
var import_react = /* @__PURE__ */ __toESM(require_react());
var nutritionCoach = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(createClientRpc("2ac9957454b923e50fa7cbe98089c71666c4035f6878a51a5be78be56a719534"));
var getCoachContext = createServerFn({ method: "GET" }).middleware([requirePremium]).handler(createClientRpc("5da961d855c6b80baf00c15d9c08942fa13be55dd33b9ff909bd1d284ea2f9b8"));
//#endregion
//#region src/routes/coach.tsx?tsr-split=component
var import_jsx_runtime = require_jsx_runtime();
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
		className: "mx-auto w-full max-w-2xl flex-1 bg-background px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-56 bg-card" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-4 w-72 bg-card" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-8 h-24 w-full rounded-2xl bg-card" })
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-6 w-6 text-[var(--periwinkle)]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-3xl font-medium tracking-tight text-foreground",
				children: "AI Nutrition Coach"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-sm text-muted-foreground",
				children: "Sign in so your coach can personalize advice to your goals, allergies, and daily budget."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/auth",
				className: "mt-6 inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background",
				children: "Sign in"
			})
		]
	});
	const missing = ctx?.missing ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col bg-background px-4 py-8 text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeartPulse, { className: "h-5 w-5 text-[var(--periwinkle)]" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-medium tracking-tight text-foreground",
						children: "Nutrition Coach"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Personalized advice for your goals, allergies, and daily budget."
					})]
				})]
			}),
			ctxLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-16 w-full rounded-2xl bg-card" }) : ctx ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
					to: "/settings",
					className: "mt-3 flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground",
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
						className: "rounded-2xl border border-dashed border-border bg-card p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-foreground",
							children: "Try asking:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: STARTERS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => ask(s),
								className: "rounded-xl border border-border bg-secondary px-3.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-[var(--periwinkle)] hover:text-foreground",
								children: s
							}, s))
						})]
					}),
					turns.map((t, i) => t.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rise-in max-w-[85%] rounded-2xl rounded-br-sm bg-foreground px-4 py-2.5 text-sm font-medium text-background",
							children: t.content
						})
					}, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-start",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rise-in max-w-[92%] space-y-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground [&_a]:underline [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_strong]:font-semibold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: t.content })
						})
					}, i)),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						"aria-live": "polite",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-foreground" }), "Coach is thinking…"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					ask(input);
				},
				className: "sticky bottom-24 mt-6 flex gap-2 rounded-2xl border border-border bg-card p-1.5",
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
						className: "h-11 flex-1 rounded-xl border-none bg-transparent text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0",
						disabled: busy
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						disabled: busy || !input.trim(),
						className: "h-11 w-11 rounded-xl bg-foreground text-background hover:opacity-90",
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
		className: tone === "warn" ? "inline-flex items-center rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive" : "inline-flex items-center rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground",
		children: label
	});
}
//#endregion
export { CoachPage as component };
