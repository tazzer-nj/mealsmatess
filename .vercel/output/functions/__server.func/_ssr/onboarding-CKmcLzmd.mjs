import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as ChefHat, N as Salad, _ as Target, f as TriangleAlert, ht as Globe, kt as Clock, nn as ArrowLeft, rt as LoaderCircle, s as Users, tn as ArrowRight, x as Sparkles } from "../_libs/lucide-react.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as normalizePreferences, t as EMPTY_PREFERENCES } from "./preferences-CRPr2kaW.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { t as MealMateLogo } from "./mealmate-logo-BEBaxM_8.mjs";
import { n as saveMyPreferences, t as getMyPreferences } from "./preferences.functions-BC8eI4b9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-CKmcLzmd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MEAL_GOALS = [
	"Eat healthier & balanced",
	"Save money & reduce waste",
	"Quick & easy weeknight meals",
	"Discover new global recipes",
	"High protein & fitness",
	"Family-friendly cooking"
];
var DIETARY_RESTRICTIONS = [
	"None",
	"Vegetarian",
	"Vegan",
	"Halal",
	"Kosher",
	"Gluten-free",
	"Dairy-free",
	"Keto / Low-carb",
	"Pescatarian"
];
var FOOD_ALLERGIES = [
	"None",
	"Peanuts",
	"Tree nuts",
	"Milk / Lactose",
	"Eggs",
	"Wheat / Gluten",
	"Soy",
	"Fish",
	"Shellfish",
	"Sesame"
];
var FAVOURITE_CUISINES = [
	"South African",
	"Italian",
	"Mexican",
	"Asian Fusion",
	"Mediterranean",
	"Indian",
	"American",
	"West African",
	"Japanese",
	"Middle Eastern"
];
var SKILL_LEVELS = [
	{
		level: "Beginner",
		desc: "Just starting out, prefer simple step-by-step guidance."
	},
	{
		level: "Intermediate",
		desc: "Comfortable with everyday cooking techniques and spices."
	},
	{
		level: "Advanced",
		desc: "Experienced in the kitchen, eager for gourmet experiments."
	}
];
var COOKING_TIMES = [
	"Under 20 mins",
	"20–35 mins",
	"35–50 mins",
	"Weekend slow cooking"
];
function OnboardingStepContent({ step, preferences, preferredName, onPreferredNameChange, householdSize, onHouseholdSizeChange, onChange, disabled = false }) {
	function toggleList(field, option) {
		if (option === "None") {
			onChange({
				...preferences,
				[field]: []
			});
			return;
		}
		const filtered = preferences[field].filter((x) => x !== "None");
		onChange({
			...preferences,
			[field]: filtered.includes(option) ? filtered.filter((v) => v !== option) : [...filtered, option]
		});
	}
	if (step === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "onboarding-field-group",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: "preferred-name",
				className: "text-white font-semibold flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
					size: 16,
					className: "text-periwinkle"
				}), " What should MealMate call you?"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id: "preferred-name",
				placeholder: "e.g. Thabo or Alex",
				value: preferredName,
				onChange: (e) => onPreferredNameChange(e.target.value),
				disabled,
				className: "auth-input mt-1.5",
				maxLength: 40
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "onboarding-field-group mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
					size: 16,
					className: "text-periwinkle"
				}), " Household or serving size"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: [
					"1 person (solo)",
					"2 people (couple)",
					"3–4 people (family)",
					"5+ people (large feast)"
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled,
					"aria-pressed": householdSize === s,
					onClick: () => onHouseholdSizeChange(s),
					children: s
				}, s))
			})]
		})]
	});
	if (step === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, {
					size: 16,
					className: "text-periwinkle"
				}), " What is your primary meal goal?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3",
				children: "Select what matters most for dinner and weekly meal plans."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: MEAL_GOALS.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled,
					"aria-pressed": preferences.goal === goal,
					onClick: () => onChange({
						...preferences,
						goal: preferences.goal === goal ? null : goal
					}),
					children: goal
				}, goal))
			})
		]
	});
	if (step === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Salad, {
					size: 16,
					className: "text-periwinkle"
				}), " Do you have any dietary preferences?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3",
				children: "Choose any diets or eating styles that apply."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: DIETARY_RESTRICTIONS.map((diet) => {
					const isSelected = diet === "None" ? preferences.dietary_restrictions.length === 0 : preferences.dietary_restrictions.includes(diet);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled,
						"aria-pressed": isSelected,
						onClick: () => toggleList("dietary_restrictions", diet),
						children: diet
					}, diet);
				})
			})
		]
	});
	if (step === 3) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "text-amber-400"
				}), " Any food allergies or intolerances?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3",
				children: "Excluded automatically from recipe recommendations and meal suggestions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: FOOD_ALLERGIES.map((allergen) => {
					const isSelected = allergen === "None" ? preferences.allergies.length === 0 : preferences.allergies.includes(allergen);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled,
						"aria-pressed": isSelected,
						onClick: () => toggleList("allergies", allergen),
						children: allergen
					}, allergen);
				})
			})
		]
	});
	if (step === 4) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, {
					size: 16,
					className: "text-periwinkle"
				}), " Which cuisines do you love the most?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3",
				children: "Pick your go-to flavours and cooking traditions."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: FAVOURITE_CUISINS_OPTIONS(preferences.favorite_foods).map((cuisine) => {
					const isSelected = preferences.favorite_foods.includes(cuisine);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled,
						"aria-pressed": isSelected,
						onClick: () => toggleList("favorite_foods", cuisine),
						children: cuisine
					}, cuisine);
				})
			})
		]
	});
	if (step === 5) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "onboarding-step-body",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefHat, {
					size: 16,
					className: "text-periwinkle"
				}), " What's your cooking skill level?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2 mb-5",
				children: SKILL_LEVELS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled,
					className: `p-3 rounded-xl border text-left transition-all ${preferences.cooking_level === item.level ? "border-indigo-400 bg-indigo-500/15 text-white shadow-sm" : "border-border bg-card/60 text-muted-foreground hover:bg-card"}`,
					onClick: () => onChange({
						...preferences,
						cooking_level: item.level
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-sm text-foreground",
						children: item.level
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: item.desc
					})]
				}, item.level))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				className: "text-white font-semibold flex items-center gap-2 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					size: 16,
					className: "text-periwinkle"
				}), " How much time do you like to spend cooking?"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "onboarding-chips",
				children: COOKING_TIMES.map((time) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled,
					"aria-pressed": preferences.cooking_time === time,
					onClick: () => onChange({
						...preferences,
						cooking_time: time
					}),
					children: time
				}, time))
			})
		]
	});
	return null;
}
function FAVOURITE_CUISINS_OPTIONS(custom) {
	return Array.from(/* @__PURE__ */ new Set([...FAVOURITE_CUISINES, ...custom]));
}
var STEP_DATA = [
	{
		stepName: "Welcome",
		title: "Personalize your kitchen",
		desc: "Let's tailor MealMate to your household, taste, and cooking habits.",
		dish: "Creamy chicken alfredo"
	},
	{
		stepName: "Goals",
		title: "Set your cooking goals",
		desc: "We will adapt recipe discovery and recommendations to what you want to achieve.",
		dish: "Rainbow buddha bowl"
	},
	{
		stepName: "Diet",
		title: "Dietary preferences",
		desc: "From plant-based to gluten-free, personalize your daily recipe feed.",
		dish: "Greek chicken salad"
	},
	{
		stepName: "Allergies",
		title: "Allergies & intolerances",
		desc: "Keep your kitchen safe. We'll automatically filter out unsafe ingredients.",
		dish: "West African jollof rice"
	},
	{
		stepName: "Cuisines",
		title: "Favourite flavours",
		desc: "Explore authentic South African favourites and world-renowned classics.",
		dish: "Cape malay bobotie"
	},
	{
		stepName: "Skill & Pace",
		title: "Skill level & pace",
		desc: "We'll suggest meals that match your kitchen comfort and available time.",
		dish: "Classic american apple pie"
	}
];
function OnboardingLayout({ step, total = 6, children, footer, onBack, busy = false }) {
	const content = (0, import_react.useRef)(null);
	const current = STEP_DATA[step] || STEP_DATA[0];
	(0, import_react.useEffect)(() => {
		content.current?.scrollTo?.(0, 0);
	}, [step]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "onboarding-shell",
		"aria-busy": busy,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "onboarding-frame",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "onboarding-header",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "onboarding-brand-row",
						children: [onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "onboarding-back",
							onClick: onBack,
							disabled: busy,
							"aria-label": "Previous step",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 18 })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MealMateLogo, {
							imageClassName: "size-8 rounded-xl",
							className: "text-white"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "onboarding-step",
							children: [
								"Step ",
								step + 1,
								" of ",
								total
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "onboarding-progress",
						role: "progressbar",
						"aria-label": "Onboarding progress",
						"aria-valuemin": 1,
						"aria-valuemax": total,
						"aria-valuenow": step + 1,
						children: Array.from({ length: total }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "data-active": i <= step }, i))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "onboarding-visual-banner",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
						recipe: { name: current.dish },
						size: "hero",
						priority: true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "onboarding-visual-overlay",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "onboarding-pill",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								size: 12,
								className: "text-periwinkle"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: current.stepName })]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "onboarding-content",
					ref: content,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "onboarding-text-header",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "onboarding-title",
							children: current.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "onboarding-description",
							children: current.desc
						})]
					}), children]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "onboarding-actions",
					children: footer
				})
			]
		})
	});
}
var key = (userId) => `mealmate.onboarding-draft.v1:${userId}`;
/** Personal onboarding uses steps 0–6 (seven screens in OnboardingLayout). */
var MIN_STEP = 0;
var MAX_STEP = 6;
function readOnboardingDraft(userId) {
	try {
		const value = JSON.parse(localStorage.getItem(key(userId)) ?? "null");
		if (!value || !Number.isInteger(value.step) || value.step < MIN_STEP || value.step > MAX_STEP) return null;
		return {
			step: value.step,
			preferences: normalizePreferences(value.preferences)
		};
	} catch {
		return null;
	}
}
function saveOnboardingDraft(userId, step, preferences) {
	try {
		const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, step));
		localStorage.setItem(key(userId), JSON.stringify({
			step: clamped,
			preferences
		}));
	} catch {}
}
function clearOnboardingDraft(userId) {
	try {
		localStorage.removeItem(key(userId));
	} catch {}
}
var TOTAL_STEPS = 6;
function OnboardingPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!loading && !user) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		user,
		loading,
		navigate
	]);
	if (loading || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-[#05070a]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonalOnboarding, {
		userId: user.id,
		userDisplayName: user.displayName ?? ""
	}, user.id);
}
function PersonalOnboarding({ userId, userDisplayName }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [step, setStep] = (0, import_react.useState)(0);
	const [prefs, setPrefs] = (0, import_react.useState)(EMPTY_PREFERENCES);
	const [preferredName, setPreferredName] = (0, import_react.useState)(userDisplayName || "");
	const [householdSize, setHouseholdSize] = (0, import_react.useState)("2 people (couple)");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const started = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		(async () => {
			const draft = readOnboardingDraft(userId);
			try {
				const remote = await getMyPreferences();
				if (!active) return;
				if (remote?.onboarding_completed) {
					navigate({
						to: "/premium",
						replace: true
					});
					return;
				}
				if (remote) {
					setPrefs({
						...EMPTY_PREFERENCES,
						...remote
					});
					if (remote.meals_per_day) setHouseholdSize(remote.meals_per_day);
				} else if (draft?.preferences) setPrefs({
					...EMPTY_PREFERENCES,
					...draft.preferences
				});
				if (typeof draft?.step === "number") setStep(draft.step);
			} catch {
				if (draft?.preferences) setPrefs({
					...EMPTY_PREFERENCES,
					...draft.preferences
				});
				if (typeof draft?.step === "number") setStep(draft.step);
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => {
			active = false;
		};
	}, [userId, navigate]);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		saveOnboardingDraft(userId, step, prefs);
	}, [
		userId,
		step,
		prefs,
		loading
	]);
	function next() {
		if (step === 0 && !preferredName.trim()) {
			toast.error("Please enter your preferred name.");
			return;
		}
		setStep((s) => Math.min(5, s + 1));
	}
	function back() {
		setStep((s) => Math.max(0, s - 1));
	}
	async function finish() {
		if (started.current || busy) return;
		started.current = true;
		setBusy(true);
		try {
			const finalPrefs = {
				...prefs,
				meals_per_day: householdSize,
				onboarding_completed: true
			};
			await saveMyPreferences({ data: {
				...finalPrefs,
				onboarding_completed: true
			} });
			clearOnboardingDraft(userId);
			await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
			await queryClient.invalidateQueries({ queryKey: ["preferences"] });
			toast.success("Preferences saved!");
			await navigate({
				to: "/premium",
				replace: true
			});
		} catch (error) {
			started.current = false;
			setBusy(false);
			toast.error(error instanceof Error ? error.message : "Could not finish setup. Please try again.");
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center bg-[#05070a]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	const isLast = step === 5;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingLayout, {
		step,
		total: TOTAL_STEPS,
		onBack: step > 0 && !busy ? back : void 0,
		busy,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "onboarding-primary-btn",
			disabled: busy,
			onClick: () => void (isLast ? finish() : next()),
			children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "animate-spin",
				size: 18
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isLast ? "Complete Setup" : "Continue" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })] })
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingStepContent, {
			step,
			preferences: prefs,
			preferredName,
			onPreferredNameChange: setPreferredName,
			householdSize,
			onHouseholdSizeChange: setHouseholdSize,
			onChange: setPrefs,
			disabled: busy
		})
	});
}
//#endregion
export { OnboardingPage as component };
