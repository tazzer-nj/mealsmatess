const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/visual-explainer-CFfP9oeJ.js","assets/rolldown-runtime-DC62tzP2.js","assets/react-EWLbHI2A.js","assets/dist-BV242RuG.js","assets/jsx-runtime-D5J9-8SJ.js","assets/createLucideIcon-5qODTz61.js","assets/download-Cp-4Qska.js","assets/loader-circle-DQwT8cZ8.js","assets/play-DhO1CTuq.js","assets/rotate-ccw-DSAAZ3VG.js","assets/button-yWWHKMUk.js","assets/dist-M7oSVwu5.js","assets/clsx-DQoRUQAf.js","assets/utils-B301wYFs.js","assets/index-CfUBRHG1.js","assets/firebase-auth-middleware-6QZ-o3Bh.js","assets/link-DqHkHLEB.js","assets/useRouter-BO3ijT-Z.js","assets/useNavigate-BlI0eDHL.js","assets/useServerFn-CppVREy0.js","assets/firebase-Ccym_bIx.js","assets/index.esm-ClfCErFN.js","assets/preload-helper-DxWiKyOd.js","assets/QueryClientProvider-DW69ZLWa.js","assets/useQuery-C9s6b3XV.js","assets/switch-BKSiyXaS.js","assets/dist-DbtTuIon.js","assets/dist-DHKxoGca.js","assets/dist-BOSNTYME.js","assets/use-session-DrDo_MXn.js","assets/notifications.functions-ACCSm2-J.js","assets/check-B2czvmG1.js","assets/select-CdlvkF5L.js","assets/chevron-down-Ctt1N_JI.js","assets/es2015-DQTxH95u.js","assets/dist-Cx2EnmCJ.js","assets/dist-DRQywa3g.js","assets/crown-CfxXJ1NA.js","assets/eye-13mpG0qD.js","assets/shield-check-CcJpZYQR.js","assets/plus-B_wgAisR.js","assets/search-DMRuxp1Q.js","assets/trash-2-CDfq80_b.js","assets/triangle-alert-DBEPVLOK.js","assets/utensils-crossed-ByeQW5dI.js","assets/x-Cn1BL0go.js","assets/dialog-B70RQ7lR.js","assets/dist-BHa8KHh3.js","assets/firebase-data-8L_7gg2z.js","assets/dist-CYYvMC31.js","assets/input-Cfa9G600.js","assets/premium-middleware-C2B7KFxy.js","assets/textarea-DgSuVFm-.js"])))=>i.map(i=>d[i]);
import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { n as toast } from "./dist-BV242RuG.js";
import { t as Link } from "./link-DqHkHLEB.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { t as __vitePreload } from "./preload-helper-DxWiKyOd.js";
import { t as createLucideIcon } from "./createLucideIcon-5qODTz61.js";
import { t as Crown } from "./crown-CfxXJ1NA.js";
import { t as Eye } from "./eye-13mpG0qD.js";
import { t as LoaderCircle } from "./loader-circle-DQwT8cZ8.js";
import { t as X } from "./x-Cn1BL0go.js";
import { t as Button } from "./button-yWWHKMUk.js";
import { t as Input } from "./input-Cfa9G600.js";
import { Ct as Mic, J as Route, Lt as Camera, Rt as CalendarDays, Ut as usePremium, Yt as useMia, bt as Refrigerator, tt as ChefMascot } from "./index-CfUBRHG1.js";
import { t as Markdown } from "./lib-B-Zv_iMQ.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUp = createLucideIcon("arrow-up", [["path", {
	d: "m5 12 7-7 7 7",
	key: "hav0vg"
}], ["path", {
	d: "M12 19V5",
	key: "x0mq9r"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var AudioWaveform = createLucideIcon("audio-waveform", [["path", {
	d: "M2 13a2 2 0 0 0 2-2V7a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0V4a2 2 0 0 1 4 0v13a2 2 0 0 0 4 0v-4a2 2 0 0 1 2-2",
	key: "57tc96"
}]]);
//#endregion
//#region src/components/cooking-input.tsx
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CookingInput({ value, onChange, onSubmit, busy = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: (e) => {
			e.preventDefault();
			onSubmit();
		},
		className: "cooking-input rounded-2xl border border-border bg-card p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			"aria-label": "Ask MealMate",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder: "What can I cook today?",
			maxLength: 200,
			className: "h-11 min-w-0 border-0 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus-visible:ring-0"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground",
						title: "Scan ingredients",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/scan",
							search: { mode: "ingredients" },
							"aria-label": "Scan ingredients",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-4 w-4" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground",
						title: "Pantry",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pantry",
							"aria-label": "Pantry",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refrigerator, { className: "h-4 w-4" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "icon",
						className: "size-10 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground",
						title: "Meal planner",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/planner",
							"aria-label": "Meal planner",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4" })
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				size: "icon",
				className: "size-10 shrink-0 rounded-xl bg-foreground text-background hover:opacity-90 disabled:opacity-40",
				disabled: busy || !value.trim(),
				"aria-label": "Send question",
				children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-4 w-4" })
			})]
		})]
	});
}
//#endregion
//#region src/routes/chat.tsx?tsr-split=component
var VisualExplainer = (0, import_react.lazy)(() => __vitePreload(() => import("./visual-explainer-CFfP9oeJ.js").then((m) => ({ default: m.VisualExplainer })), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52])));
var SUGGESTIONS = [
	"What can I cook?",
	"Help me plan dinner.",
	"Find a quick recipe.",
	"What can I make with my ingredients?"
];
var VOICE_STATE_COPY = {
	muted: "Ready for hands-free voice",
	loading: "Preparing voice engine…",
	waiting: "Waiting for “Hey Mia”",
	listening: "Listening…",
	thinking: "Mia is thinking…",
	speaking: "Mia is speaking…",
	paused: "Hands-free paused",
	denied: "Microphone permission needed",
	error: "Voice unavailable right now"
};
function ChatPage() {
	const { isPremium } = usePremium();
	const { q } = Route.useSearch();
	const [question, setQuestion] = (0, import_react.useState)(q ?? "");
	const endRef = (0, import_react.useRef)(null);
	const mia = useMia();
	const { turns, busy, voice } = mia;
	const [visualMode, setVisualMode] = (0, import_react.useState)(false);
	const [voiceOpen, setVoiceOpen] = (0, import_react.useState)(false);
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
			toast.error("Couldn't answer that", { description: error instanceof Error ? error.message : "Mia is unavailable. Please try again." });
		}
	}
	const voiceActive = [
		"loading",
		"waiting",
		"listening",
		"thinking",
		"speaking"
	].includes(voice.state);
	const latestTurn = turns.at(-1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col bg-background px-4 py-8 text-foreground",
		children: [
			turns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center py-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefMascot, {
						animate: true,
						className: "h-32 w-32"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-5 text-3xl font-medium tracking-tight text-foreground",
						children: "Hey, I'm Mia."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "What are we making today?"
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between border-b border-border pb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefMascot, { className: "h-8 w-8" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-medium tracking-tight text-foreground",
						children: "Mia"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Personal culinary assistant"
					})] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap justify-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					onClick: () => setVoiceOpen(true),
					className: "h-9 rounded-xl border-border bg-card text-xs font-medium text-foreground hover:bg-secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AudioWaveform, { className: "mr-1.5 h-3.5 w-3.5 text-[var(--periwinkle)]" }), "Voice mode"]
				}), isPremium ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "outline",
					className: `h-9 rounded-xl border text-xs font-medium transition-colors ${visualMode ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "border-border bg-card text-foreground hover:bg-secondary"}`,
					"aria-pressed": visualMode,
					onClick: () => setVisualMode((v) => !v),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "mr-1.5 h-3.5 w-3.5" }),
						" Visual mode ",
						visualMode ? "on" : "off"
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					className: "h-9 rounded-xl border border-border bg-card text-xs text-muted-foreground hover:bg-secondary hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/premium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "mr-1.5 h-3.5 w-3.5 text-[var(--periwinkle)]" }), " Premium Visual Mode"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex-1 space-y-6",
				children: [
					turns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-1 gap-2 sm:grid-cols-2",
						children: SUGGESTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void ask(s),
							className: "rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-secondary hover:text-foreground",
							children: s
						}, s))
					}),
					turns.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground",
								children: t.question
							}),
							t.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-foreground [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, { children: t.answer })
							}),
							t.error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "alert",
								className: "flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "flex-1",
									children: t.error
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									className: "rounded-xl border-border bg-card text-foreground",
									onClick: () => void mia.retry(t.id),
									disabled: busy,
									children: "Try again"
								})]
							}),
							t.visualLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-[var(--periwinkle)]" }), "Directing your animated explainer — illustrations & narration…"]
							}),
							t.visualError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive",
								children: ["Visual explanation unavailable: ", t.visualError]
							}),
							t.visual && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
								fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-secondary" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VisualExplainer, { data: t.visual })
							})
						]
					}, t.id)),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-[var(--periwinkle)]" }), "Thinking…"]
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
				children: "AI answers can be wrong — check allergies and food safety."
			}),
			voiceOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Mia Voice Mode",
				className: "fixed inset-0 z-50 flex flex-col justify-between bg-background px-6 py-8 text-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-md items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-medium uppercase tracking-widest text-muted-foreground",
							children: "Voice Mode"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-medium tracking-tight text-foreground",
							children: "Talk with Mia"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							size: "icon",
							"aria-label": "Exit voice mode",
							onClick: () => setVoiceOpen(false),
							className: "size-10 rounded-xl border-border bg-card text-foreground hover:bg-secondary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-md flex-col items-center text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex h-44 w-44 items-center justify-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"aria-hidden": "true",
										className: `absolute inset-0 rounded-full border transition-transform duration-700 ${voice.state === "speaking" || voice.state === "listening" ? "scale-110 border-[var(--periwinkle)]/50 motion-safe:animate-pulse" : "scale-100 border-border"}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"aria-hidden": "true",
										className: `absolute inset-4 rounded-full border transition-transform duration-500 ${voice.state === "speaking" ? "scale-105 border-[var(--periwinkle)]/70" : "scale-100 border-border"}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "relative flex h-28 w-28 items-center justify-center rounded-full border border-border bg-card",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefMascot, {
											animate: voiceActive,
											className: "h-20 w-20"
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-base font-medium text-foreground",
								role: "status",
								children: VOICE_STATE_COPY[voice.state] ?? "Mia Voice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Say “Hey Mia” to ask, or “Thanks Mia” to finish."
							}),
							voice.transcript && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground",
								children: [
									"“",
									voice.transcript,
									"”"
								]
							}),
							latestTurn?.answer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 line-clamp-4 max-w-sm text-sm leading-relaxed text-muted-foreground",
								children: latestTurn.answer
							}),
							voice.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs text-destructive",
								children: voice.error
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex w-full max-w-md flex-col gap-3",
						children: [!voiceActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "lg",
							onClick: () => mia.startVoice(),
							className: "h-12 w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "mr-2 h-4 w-4" }), "Start voice session"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "lg",
							variant: "outline",
							onClick: () => mia.stopVoice(),
							className: "h-12 w-full rounded-xl border-border bg-card text-sm font-medium text-foreground hover:bg-secondary",
							children: "Stop speaking & pause"
						}), [
							"listening",
							"thinking",
							"speaking"
						].includes(voice.state) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							onClick: () => mia.endConversation(),
							className: "h-10 w-full rounded-xl text-xs text-muted-foreground hover:text-foreground",
							children: "End conversation"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ChatPage as component };
