import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { $t as ArrowUp, Bt as ChefHat, Dt as Crown, F as Refrigerator, K as Mic, Kt as CalendarDays, P as RotateCcw, Wt as Camera, kt as Clock, n as X, o as UtensilsCrossed, rt as LoaderCircle, x as Sparkles, xt as Eye } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useMia } from "./use-mia-9WMlFWqd.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as Route } from "./chat-Bw3hN1UL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-BE3-Nrbj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	{
		text: "What can I cook?",
		icon: Sparkles
	},
	{
		text: "Help me plan dinner.",
		icon: Clock
	},
	{
		text: "Find a quick recipe.",
		icon: ChefHat
	},
	{
		text: "What can I make with my ingredients?",
		icon: UtensilsCrossed
	}
];
function ChatPage() {
	const { isPremium } = usePremium();
	const { q } = Route.useSearch();
	const [question, setQuestion] = (0, import_react.useState)(q ?? "");
	const [visualMode, setVisualMode] = (0, import_react.useState)(false);
	const [voiceOpen, setVoiceOpen] = (0, import_react.useState)(false);
	const endRef = (0, import_react.useRef)(null);
	const mia = useMia();
	const { turns, busy } = mia;
	(0, import_react.useEffect)(() => {
		if (turns.length) endRef.current?.scrollIntoView({
			block: "end",
			behavior: "smooth"
		});
	}, [turns, busy]);
	async function ask(text) {
		if (!text.trim() || busy) return;
		setQuestion("");
		mia.endConversation();
		try {
			await mia.ask(text, { visual: isPremium && visualMode });
		} catch (error) {
			toast.error("Mia couldn't answer that", { description: error instanceof Error ? error.message : "Please try again in a moment." });
		}
	}
	const empty = turns.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-6 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "flex h-11 w-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
							className: "h-[19px] w-[19px]",
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-[19px] font-semibold leading-tight tracking-[-0.02em]",
						children: "Mia"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[12px] text-[#71717A]",
						children: "Your personal food companion"
					})] })]
				}), isPremium ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": visualMode,
					onClick: () => setVisualMode((v) => !v),
					className: cn("mm-chip h-9 px-3 text-[13px]", visualMode && "border-white bg-white text-[#080808]"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, {
						className: "h-4 w-4",
						strokeWidth: 1.75
					}), "Visual"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/premium",
					className: "mm-chip h-9 px-3 text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, {
						className: "h-4 w-4",
						strokeWidth: 1.75
					}), "Visual"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex-1",
				children: [empty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mm-fade-up",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mm-display",
							children: "Hey, I'm Mia."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[17px] leading-snug text-[#A1A1AA]",
							children: "What are we making today?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 grid gap-2",
							children: SUGGESTIONS.map(({ text, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void ask(text),
								className: "group flex items-center gap-3 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 text-left transition-colors duration-150 hover:border-[#303030] hover:bg-[#171717]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F1F1F] text-[#A1A1AA] transition-colors group-hover:text-white",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "h-4 w-4",
										strokeWidth: 1.75
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[15px] text-[#E4E4E7]",
									children: text
								})]
							}, text))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-7",
					children: turns.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-[86%] rounded-[18px] rounded-br-[6px] bg-[#1F1F1F] px-4 py-2.5 text-[15px] leading-relaxed text-white",
									children: t.question
								})
							}),
							t.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mm-fade flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#A1A1AA]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "h-3.5 w-3.5",
										strokeWidth: 1.75
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-[88%] whitespace-pre-wrap text-[15px] leading-[1.7] text-[#E4E4E7]",
									children: t.answer
								})]
							}),
							t.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								role: "alert",
								className: "mm-alert",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-[#FCA5A5]",
											children: "That didn't work"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-[13px] text-[#A1A1AA]",
											children: t.error
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void mia.retry(t.id),
											disabled: busy,
											className: "mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-white disabled:opacity-50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), " Try again"]
										})
									]
								})
							}),
							t.visualLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3 text-[13px] text-[#A1A1AA]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Preparing your visual explanation…"]
							}),
							t.visualError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[12px] text-[#71717A]",
								children: "Visual explanation unavailable right now."
							}),
							t.visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-skeleton h-40 w-full" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisualExplainer, { data: t.visual })
							})
						]
					}, t.id))
				}), busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center gap-2.5 text-[13px] text-[#71717A]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex gap-1",
						"aria-hidden": true,
						children: [
							0,
							1,
							2
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-1.5 w-1.5 animate-pulse rounded-full bg-[#71717A]",
							style: { animationDelay: `${i * 160}ms` }
						}, i))
					}), "Mia is thinking…"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky bottom-3 mt-8 bg-gradient-to-t from-[#080808] via-[#080808] to-transparent pb-1 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CookingInput, {
							value: question,
							onChange: setQuestion,
							onSubmit: () => void ask(question),
							busy
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setVoiceOpen(true),
						"aria-label": "Talk to Mia",
						className: "mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1F1F1F] active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
							className: "h-[19px] w-[19px]",
							strokeWidth: 1.75
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-[11px] leading-relaxed text-[#71717A]",
					children: "Mia can be wrong — use judgement for allergies and food safety."
				})]
			}),
			voiceOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceMode, { onClose: () => setVoiceOpen(false) })
		]
	});
}
var VOICE_COPY = {
	loading: {
		label: "Waking up…",
		hint: "Preparing the voice engine"
	},
	waiting: {
		label: "Say “Hey Mia”",
		hint: "I'm listening for you"
	},
	listening: {
		label: "Listening…",
		hint: "Speak naturally"
	},
	thinking: {
		label: "Thinking…",
		hint: "Finding the best answer"
	},
	speaking: {
		label: "Speaking…",
		hint: "Tap end when you're done"
	},
	paused: {
		label: "Paused",
		hint: "Hands-free is paused"
	},
	denied: {
		label: "Microphone blocked",
		hint: "Allow microphone access, then try again"
	},
	error: {
		label: "Voice unavailable",
		hint: "Please try again"
	},
	muted: {
		label: "Microphone off",
		hint: "Voice is not capturing right now"
	}
};
function VoiceMode({ onClose }) {
	const mia = useMia();
	const { voice, turns } = mia;
	const lastAnswer = turns.at(-1)?.answer;
	(0, import_react.useEffect)(() => {
		mia.startVoice();
		return () => mia.stopVoice();
	}, []);
	const copy = VOICE_COPY[voice.state] ?? VOICE_COPY["muted"];
	const capturing = voice.state === "listening";
	const speaking = voice.state === "speaking";
	function finish() {
		mia.endConversation();
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Voice conversation with Mia",
		className: "premium-flow fixed inset-0 z-[60] flex flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mm-eyebrow",
					children: "Voice with Mia"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: finish,
					"aria-label": "End voice conversation",
					className: "flex h-10 w-10 items-center justify-center rounded-full border border-[#262626] text-[#A1A1AA] transition-colors hover:text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "h-[18px] w-[18px]",
						strokeWidth: 1.75
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-40 w-40 items-center justify-center",
						children: [(capturing || speaking) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: cn("absolute h-40 w-40 rounded-full border border-white/10", capturing ? "animate-ping" : "animate-pulse"),
							style: { animationDuration: capturing ? "2.6s" : "2s" }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: cn("absolute h-28 w-28 rounded-full border border-white/15", capturing ? "animate-ping" : "animate-pulse"),
							style: {
								animationDuration: capturing ? "2.2s" : "1.8s",
								animationDelay: "220ms"
							}
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: cn("flex h-24 w-24 items-center justify-center rounded-full border transition-colors duration-300", capturing || speaking ? "border-white bg-white text-[#080808]" : "border-[#262626] bg-[#141414] text-[#A1A1AA]"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, {
								className: "h-8 w-8",
								strokeWidth: 1.6
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						className: "mt-10 text-[22px] font-medium tracking-[-0.02em]",
						children: copy.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xs text-[14px] leading-relaxed text-[#A1A1AA]",
						children: copy.hint
					}),
					(voice.transcript || lastAnswer) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 w-full max-w-md space-y-3 text-left",
						children: [voice.transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "ml-auto w-fit max-w-[85%] rounded-[16px] rounded-br-[6px] bg-[#1F1F1F] px-4 py-2.5 text-[14px] text-white",
							children: voice.transcript
						}), speaking && lastAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[14px] leading-relaxed text-[#E4E4E7]",
							children: lastAnswer
						})]
					}),
					voice.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mt-6 max-w-sm text-[13px] text-[#FCA5A5]",
						children: voice.error
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-[11px] leading-relaxed text-[#71717A]",
					children: "Audio is processed on your device. Turn Mia's spoken replies off any time in Settings."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: finish,
					className: "mm-btn mm-btn-secondary mm-btn-block",
					children: "End conversation"
				})]
			})
		]
	});
}
//#endregion
export { ChatPage as component };
