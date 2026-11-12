import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Ht as CalendarDays, I as Plus, It as ChefHat, T as ShoppingBag, h as Trash2, nt as LoaderCircle, w as ShoppingCart } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, t as Select } from "./select-CtS-l6xr.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { i as myPlannerQuery, t as myFavoritesQuery } from "./queries-v7vmnG2D.mjs";
import { a as useFeatureFlag, n as buildGroceryFromPlan, r as generatePersonalizedPlan, t as aiPlanAndShop } from "./use-feature-flag-Dcg0eXe5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planner-DazIcSsz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MEAL_TYPES = [
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snack"
];
function startOfWeek(d) {
	const date = new Date(d);
	const day = (date.getDay() + 6) % 7;
	date.setDate(date.getDate() - day);
	date.setHours(0, 0, 0, 0);
	return date;
}
function iso(d) {
	return d.toISOString().slice(0, 10);
}
function PlannerPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const week = (0, import_react.useMemo)(() => {
		const start = startOfWeek(/* @__PURE__ */ new Date());
		return Array.from({ length: 7 }, (_, i) => {
			const d = new Date(start);
			d.setDate(start.getDate() + i);
			return d;
		});
	}, []);
	const fromISO = iso(week[0] ?? /* @__PURE__ */ new Date());
	const toISO = iso(week[6] ?? /* @__PURE__ */ new Date());
	const { data: plans } = useQuery({
		...myPlannerQuery(fromISO, toISO),
		enabled: !!user
	});
	const { data: favorites } = useQuery({
		...myFavoritesQuery(),
		enabled: !!user
	});
	const [addingDay, setAddingDay] = (0, import_react.useState)(null);
	const [mealType, setMealType] = (0, import_react.useState)("Dinner");
	const [recipeId, setRecipeId] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [aiLoading, setAiLoading] = (0, import_react.useState)(false);
	const [autoGroc, setAutoGroc] = (0, import_react.useState)(false);
	const [planShop, setPlanShop] = (0, import_react.useState)(false);
	const aiPlannerEnabled = useFeatureFlag("personalized_planner", true);
	async function planAndShop() {
		if (!user) return;
		setPlanShop(true);
		try {
			const res = await aiPlanAndShop({ data: {
				days: 7,
				startDate: fromISO,
				replaceExisting: false
			} });
			await refresh();
			queryClient.invalidateQueries({ queryKey: ["grocery"] });
			toast.success(`Planned ${res.meals} meals, added ${res.groceries} to your list`, {
				description: res.skipped > 0 ? `Skipped ${res.skipped} you already have.` : void 0,
				action: {
					label: "View list",
					onClick: () => navigate({ to: "/list" })
				}
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't plan & shop");
		} finally {
			setPlanShop(false);
		}
	}
	async function generateAiPlan() {
		if (!user) return;
		setAiLoading(true);
		try {
			const { suggestions } = await generatePersonalizedPlan({ data: {
				days: 7,
				startDate: fromISO
			} });
			toast.success(`Generated ${suggestions.length} meal ideas`, { description: suggestions.slice(0, 3).map((s) => `${s.meal_type}: ${s.name}`).join(" · ") });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't generate plan");
		} finally {
			setAiLoading(false);
		}
	}
	async function autoGrocery() {
		setAutoGroc(true);
		try {
			const { inserted } = await buildGroceryFromPlan({ data: {
				from: fromISO,
				to: toISO
			} });
			toast.success(`Added ${inserted} items to your grocery list`, { action: {
				label: "View",
				onClick: () => navigate({ to: "/list" })
			} });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't build grocery list");
		} finally {
			setAutoGroc(false);
		}
	}
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
	function refresh() {
		return queryClient.invalidateQueries({ queryKey: ["planner"] });
	}
	async function addMeal(day) {
		if (!user || !recipeId) return;
		const fav = favorites?.find((f) => f.recipe_id === recipeId);
		setSaving(true);
		try {
			const { error } = await firebaseData.from("meal_plans").insert({
				user_id: user.id,
				plan_date: day,
				meal_type: mealType,
				recipe_id: recipeId,
				custom_name: fav?.recipes?.name ?? null
			});
			if (error) throw error;
			setAddingDay(null);
			setRecipeId("");
			refresh();
		} catch {
			toast.error("Couldn't add meal");
		} finally {
			setSaving(false);
		}
	}
	async function removeMeal(id) {
		await firebaseData.from("meal_plans").delete().eq("id", id);
		refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-4xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "truncate font-display text-3xl sm:text-4xl",
							children: "Meal planner"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "This week's plan"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 flex flex-wrap gap-2 sm:col-auto",
					children: [
						aiPlannerEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: planAndShop,
							disabled: planShop,
							children: [planShop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "mr-2 h-4 w-4" }), "Plan & shop"]
						}),
						aiPlannerEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: generateAiPlan,
							disabled: aiLoading,
							children: [aiLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefHat, { className: "mr-2 h-4 w-4" }), "AI ideas"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: autoGrocery,
							disabled: autoGroc || !plans || plans.length === 0,
							children: [autoGroc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "mr-2 h-4 w-4" }), "Auto grocery"]
						})
					]
				})]
			}),
			favorites && favorites.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
				children: [
					"Save some recipes first — your favorites show up here to plan with.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/recipes",
						className: "font-medium text-foreground hover:underline",
						children: "Browse recipes"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-4",
				children: week.map((d) => {
					const dayISO = iso(d);
					const dayPlans = plans?.filter((p) => p.plan_date === dayISO) ?? [];
					const isToday = dayISO === iso(/* @__PURE__ */ new Date());
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-2xl border bg-card p-4 ${isToday ? "border-primary" : "border-border"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "font-display text-xl",
									children: [d.toLocaleDateString(void 0, { weekday: "long" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-2 text-sm font-normal text-muted-foreground",
										children: d.toLocaleDateString(void 0, {
											month: "short",
											day: "numeric"
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setAddingDay(addingDay === dayISO ? null : dayISO),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
								})]
							}),
							dayPlans.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2",
								children: dayPlans.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium",
											children: [p.meal_type, ":"]
										}),
										" ",
										p.recipes?.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/recipe/$slug",
											params: { slug: p.recipes.slug ?? p.recipe_id ?? "" },
											className: "hover:underline",
											children: p.recipes?.name ?? p.custom_name
										}) : p.custom_name
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => removeMeal(p.id),
										className: "text-muted-foreground hover:text-destructive",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								}, p.id))
							}),
							addingDay === dayISO && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: mealType,
										onValueChange: setMealType,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "w-36",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MEAL_TYPES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: m,
											children: m
										}, m)) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: recipeId,
										onValueChange: setRecipeId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "min-w-48 flex-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a saved recipe" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: favorites?.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: f.recipe_id,
											children: f.recipes?.name
										}, f.recipe_id)) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										onClick: () => addMeal(dayISO),
										disabled: !recipeId || saving,
										children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Add"
									})
								]
							})
						]
					}, dayISO);
				})
			})
		]
	});
}
//#endregion
export { PlannerPage as component };
