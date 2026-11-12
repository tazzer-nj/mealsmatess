import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Gt as Bot, P as Refrigerator, Qt as ArrowLeft, S as SlidersVertical, Zt as ArrowRight, jt as CircleCheck, nt as LoaderCircle, ut as House, x as Sparkles, y as Store } from "../_libs/lucide-react.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { i as markTourSeen } from "./preferences-CRPr2kaW.mjs";
import { t as completeIntro } from "./billing2.functions-CEnn8pYc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/welcome-pX9vvk0Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOUR_SECTIONS = [
	{
		key: "welcome",
		eyebrow: "App Introduction",
		title: "Welcome to MealMate",
		description: "Your intelligent culinary companion. From authentic South African favourites to global cuisine, we help you discover recipes, plan meals, and shop effortlessly.",
		icon: Sparkles,
		dish: "Creamy chicken alfredo",
		previewTitle: "Intelligence in the Kitchen",
		previewSubtitle: "Your personalized cooking ecosystem is active."
	},
	{
		key: "home",
		eyebrow: "Discovery",
		title: "Home & Recipe Inspiration",
		description: "Discover recipes tailored to your taste, explore culinary categories, try the AI Surprise Me generator, and resume your active cooking sessions anytime.",
		icon: House,
		dish: "Rainbow buddha bowl",
		previewTitle: "Personalized Daily Feed",
		previewSubtitle: "Explore breakfast, dinner, South African favourites & more."
	},
	{
		key: "dining",
		eyebrow: "Dining Out",
		title: "Dining & Restaurants",
		description: "Explore curated partner restaurants, discover chef menus, order food, and view high-resolution food photography from the best local spots.",
		icon: Store,
		dish: "West African jollof rice",
		previewTitle: "Partner Restaurants & Menus",
		previewSubtitle: "Find exceptional dishes and verified food venues."
	},
	{
		key: "mia",
		eyebrow: "AI Chef",
		title: "Meet Mia, Your AI Cooking Assistant",
		description: "Hands-free kitchen companion. Ask Mia for substitution advice, step-by-step guidance, and cooking timers using your voice or interactive chat.",
		icon: Bot,
		dish: "Chakalaka with pap",
		previewTitle: "Hands-Free Voice & Chat",
		previewSubtitle: "Ask Mia anything while your hands are busy cooking."
	},
	{
		key: "pantry",
		eyebrow: "Smart Kitchen",
		title: "Pantry & Fridge Management",
		description: "Keep track of ingredients in your pantry. Use your camera or input items to discover delicious recipes made with what you already have on hand.",
		icon: Refrigerator,
		dish: "Smoky beef tacos",
		previewTitle: "Zero Food Waste",
		previewSubtitle: "Generate gourmet recipes from items in your fridge."
	},
	{
		key: "personalization",
		eyebrow: "Preferences",
		title: "Personalization & Settings",
		description: "Your preferences live in your Profile. Update allergens, dietary guidelines, preferred serving sizes, and themes anytime you need.",
		icon: SlidersVertical,
		dish: "Classic american apple pie",
		previewTitle: "Tailored to Your Household",
		previewSubtitle: "Manage your preferences, meal reminders, and account."
	}
];
function WelcomeTourPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useSession();
	const [step, setStep] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const saved = Number(localStorage.getItem("mealmate.tour-step.v3"));
			if (Number.isInteger(saved) && saved >= 0 && saved < TOUR_SECTIONS.length) setStep(saved);
		} catch {}
	}, []);
	const current = TOUR_SECTIONS[step];
	const Icon = current.icon;
	const isLast = step === TOUR_SECTIONS.length - 1;
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
				localStorage.removeItem("mealmate.tour-step.v3");
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
		if (isLast) handleComplete();
		else {
			const nextStep = step + 1;
			setStep(nextStep);
			try {
				localStorage.setItem("mealmate.tour-step.v3", String(nextStep));
			} catch {}
		}
	}
	function back() {
		if (step > 0) {
			const prevStep = step - 1;
			setStep(prevStep);
			try {
				localStorage.setItem("mealmate.tour-step.v3", String(prevStep));
			} catch {}
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "premium-flow app-tour-shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "tour-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tour-header-row",
					children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "tour-back-btn",
						onClick: back,
						disabled: busy,
						"aria-label": "Previous tour step",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 16 })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tour-brand-name",
						children: ["MealMate", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-periwinkle",
							children: "."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tour-step-counter",
						children: [
							step + 1,
							" / ",
							TOUR_SECTIONS.length
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					role: "progressbar",
					"aria-label": "App tour progress",
					"aria-valuemin": 1,
					"aria-valuemax": TOUR_SECTIONS.length,
					"aria-valuenow": step + 1,
					className: "tour-progressbar",
					children: TOUR_SECTIONS.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i <= step ? "complete" : "" }, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "tour-step-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tour-photo-wrapper",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
						recipe: { name: current.dish },
						size: "hero",
						priority: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "tour-photo-badge",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							size: 14,
							className: "text-periwinkle",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: current.previewTitle })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "tour-copy-body",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tour-eyebrow",
							children: current.eyebrow
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "tour-heading",
							children: current.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tour-description",
							children: current.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "tour-ui-highlight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
								size: 16,
								className: "text-periwinkle shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: current.previewSubtitle
							})]
						})
					]
				})]
			}, step),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "tour-footer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "tour-primary-btn",
					onClick: next,
					disabled: busy,
					children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "animate-spin",
						size: 18
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isLast ? "Get Started" : "Next" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						size: 18,
						"aria-hidden": "true"
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "tour-legal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/terms",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/privacy",
							children: "Privacy"
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { WelcomeTourPage as component };
