import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { F as Refrigerator, S as SlidersVertical, Vt as Check, Yt as Bot, ft as House, nn as ArrowLeft, rt as LoaderCircle, tn as ArrowRight, x as Sparkles, y as Store } from "../_libs/lucide-react.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as markTourSeen } from "./preferences-CRPr2kaW.mjs";
import { t as completeIntro } from "./billing2.functions-CEnn8pYc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/welcome-D2qp3VKt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOUR_SECTIONS = [
	{
		key: "welcome",
		eyebrow: "Welcome",
		title: "Discover. Plan. Eat. Enjoy.",
		description: "Your personal companion for better meals and easier dining. From South African favourites to global cuisine, everything starts here.",
		icon: Sparkles,
		dish: "Creamy chicken alfredo",
		previewTitle: "A kitchen that knows you",
		previewSubtitle: "Personalised recipes from the first day."
	},
	{
		key: "home",
		eyebrow: "Discovery",
		title: "Find something worth cooking",
		description: "Browse recipes that match your taste, explore categories, and let Surprise Me choose when you can't decide.",
		icon: House,
		dish: "Rainbow buddha bowl",
		previewTitle: "Daily inspiration",
		previewSubtitle: "Breakfast, dinner and South African classics."
	},
	{
		key: "dining",
		eyebrow: "Dining",
		title: "Eat out, beautifully",
		description: "Explore partner restaurants, browse their menus and find your next table without leaving MealMate.",
		icon: Store,
		dish: "West African jollof rice",
		previewTitle: "Restaurants and menus",
		previewSubtitle: "Curated places, honest details."
	},
	{
		key: "mia",
		eyebrow: "Mia",
		title: "Meet Mia, your food companion",
		description: "Ask for substitutions, plan a week of dinners, or cook hands-free with a voice conversation while your hands are busy.",
		icon: Bot,
		dish: "Chakalaka with pap",
		previewTitle: "Chat and voice",
		previewSubtitle: "Talk it through, then start cooking."
	},
	{
		key: "pantry",
		eyebrow: "Pantry",
		title: "Cook with what you have",
		description: "Keep track of your ingredients, scan your kitchen with the camera, and turn what's left into dinner.",
		icon: Refrigerator,
		dish: "Smoky beef tacos",
		previewTitle: "Less waste, better meals",
		previewSubtitle: "Recipes from your own ingredients."
	},
	{
		key: "personalization",
		eyebrow: "Preferences",
		title: "Made to fit your household",
		description: "Set your dietary needs, allergies and serving sizes once — MealMate remembers for every recipe and every conversation.",
		icon: SlidersVertical,
		dish: "Classic american apple pie",
		previewTitle: "Your settings, respected",
		previewSubtitle: "Change them any time in Settings."
	}
];
var STEP_KEY = "mealmate.tour-step.v3";
function WelcomeTourPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useSession();
	const [step, setStep] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const saved = Number(localStorage.getItem(STEP_KEY));
			if (Number.isInteger(saved) && saved >= 0 && saved < TOUR_SECTIONS.length) setStep(saved);
		} catch {}
	}, []);
	const current = TOUR_SECTIONS[step];
	const Icon = current.icon;
	const isLast = step === TOUR_SECTIONS.length - 1;
	function persist(nextStep) {
		try {
			localStorage.setItem(STEP_KEY, String(nextStep));
		} catch {}
	}
	async function handleComplete() {
		if (busy) return;
		setBusy(true);
		try {
			markTourSeen();
			if (user) {
				await completeIntro();
				await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", user.id] });
				await queryClient.invalidateQueries({ queryKey: ["intro-completion", user.id] });
			}
			try {
				localStorage.removeItem(STEP_KEY);
			} catch {}
			await navigate({
				to: "/",
				replace: true
			});
		} catch (error) {
			console.error("[Tour] completion error:", error);
			await navigate({
				to: "/",
				replace: true
			});
		} finally {
			setBusy(false);
		}
	}
	function next() {
		if (isLast) {
			handleComplete();
			return;
		}
		const nextStep = step + 1;
		setStep(nextStep);
		persist(nextStep);
	}
	function back() {
		if (step === 0) return;
		const prevStep = step - 1;
		setStep(prevStep);
		persist(prevStep);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "premium-flow",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between",
					children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: back,
						disabled: busy,
						"aria-label": "Previous step",
						className: "flex h-10 w-10 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white disabled:opacity-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
							className: "h-[18px] w-[18px]",
							strokeWidth: 1.75
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[13px] font-medium text-[#A1A1AA]",
						children: ["MealMate", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-white",
							children: "."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[11.5px] tabular-nums text-[#71717A]",
						children: [
							step + 1,
							" / ",
							TOUR_SECTIONS.length
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "progressbar",
					"aria-label": "Introduction progress",
					"aria-valuemin": 1,
					"aria-valuemax": TOUR_SECTIONS.length,
					"aria-valuenow": step + 1,
					className: "mt-4 flex gap-1.5",
					children: TOUR_SECTIONS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-[3px] flex-1 rounded-full transition-colors duration-200 " + (i <= step ? "bg-white" : "bg-[#262626]") }, s.key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mm-fade-in mt-6 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-[20px] border border-[#1E1E1E]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative aspect-[16/11] w-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
										recipe: { name: current.dish },
										size: "hero",
										priority: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											className: "h-3.5 w-3.5",
											strokeWidth: 1.75,
											"aria-hidden": true
										}), current.previewTitle]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-7 text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717A]",
							children: current.eyebrow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-white",
							children: current.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-[15px] leading-relaxed text-[#A1A1AA]",
							children: current.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-5 flex items-center gap-2 text-[12.5px] text-[#71717A]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
								className: "h-4 w-4 shrink-0 text-white",
								strokeWidth: 2,
								"aria-hidden": true
							}), current.previewSubtitle]
						})
					]
				}, step),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: next,
							disabled: busy,
							className: "mm-btn mm-btn-primary mm-btn-block",
							children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-[18px] w-[18px] animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isLast ? "Start cooking" : "Continue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								className: "h-[18px] w-[18px]",
								"aria-hidden": true
							})] })
						}),
						!isLast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleComplete(),
							disabled: busy,
							className: "mx-auto mt-3 block text-[12.5px] text-[#71717A] transition-colors hover:text-white",
							children: "Skip introduction"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 flex items-center justify-center gap-2 text-[11px] text-[#52525B]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/legal/terms",
									className: "transition-colors hover:text-white",
									children: "Terms"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/legal/privacy",
									className: "transition-colors hover:text-white",
									children: "Privacy"
								})
							]
						})
					]
				})
			]
		})
	});
}
//#endregion
export { WelcomeTourPage as component };
