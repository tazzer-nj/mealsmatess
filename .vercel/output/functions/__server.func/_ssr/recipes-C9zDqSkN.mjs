import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { j as Search, kt as Clock, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { o as recipesByCategoryQuery } from "./queries-v7vmnG2D.mjs";
import { a as surpriseMe, t as generateRecipe } from "./ai.functions-ClgZvg8e.mjs";
import { t as Route } from "./recipes-BbjkL63E.mjs";
import { t as loadRecipeSearchImages } from "./recipe-search-images-D55G6ndF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipes-C9zDqSkN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RecipeCard({ recipe, priority = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/recipe/$slug",
		params: { slug: recipe.slug },
		className: "md3-surface group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "aspect-[4/3] w-full overflow-hidden bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
				recipe,
				size: "card",
				sizes: "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 320px",
				priority,
				className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs text-muted-foreground",
					children: [recipe.cuisine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: recipe.cuisine }), recipe.cooking_time_minutes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
							recipe.cooking_time_minutes,
							"m"
						]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl leading-tight",
					children: recipe.name
				}),
				recipe.diet_tags && recipe.diet_tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-auto flex flex-wrap gap-1 pt-1",
					children: recipe.diet_tags.slice(0, 3).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground",
						children: t
					}, t))
				})
			]
		})]
	});
}
var CATEGORIES = [
	"All",
	"Breakfast",
	"Lunch",
	"Dinner",
	"Dessert",
	"Snacks",
	"Drinks",
	"Vegan",
	"High Protein",
	"Quick"
];
function RecipesPage() {
	const { c, q } = Route.useSearch();
	const active = c ?? "All";
	const navigate = useNavigate();
	const { user } = useSession();
	const { data: recipes, isLoading, isError, refetch } = useQuery({
		...recipesByCategoryQuery(active !== "All" ? active : void 0, q),
		enabled: !!user
	});
	const [query, setQuery] = (0, import_react.useState)(q ?? "");
	(0, import_react.useEffect)(() => {
		setQuery(q ?? "");
	}, [q]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const queryClient = useQueryClient();
	async function handleGenerate(e) {
		e.preventDefault();
		if (!query.trim() || busy) return;
		const term = query.trim();
		setBusy(true);
		try {
			await navigate({
				to: "/recipes",
				search: {
					...active !== "All" ? { c: active } : {},
					q: term
				}
			});
			const matches = await queryClient.fetchQuery(recipesByCategoryQuery(active !== "All" ? active : void 0, term));
			loadRecipeSearchImages(matches, queryClient);
		} catch {
			toast.error("Couldn't complete the search. Please try again.");
		} finally {
			setBusy(false);
		}
	}
	async function handleAiGenerate() {
		if (!query.trim() || busy) return;
		setBusy(true);
		try {
			const { slug } = await generateRecipe({ data: { query: query.trim() } });
			navigate({
				to: "/recipe/$slug",
				params: { slug }
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "";
			const authError = /AUTH_REQUIRED|Unauthorized|Invalid user session|No authorization/i.test(message);
			toast.error(authError ? "Your session expired" : "Couldn't generate that recipe", { description: authError ? "Please sign in again to cook a recipe." : "The kitchen assistant is unavailable right now. Please try again." });
		} finally {
			setBusy(false);
		}
	}
	async function handleSurprise() {
		if (busy) return;
		setBusy(true);
		try {
			const { slug } = await surpriseMe();
			navigate({
				to: "/recipe/$slug",
				params: { slug }
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : "";
			const authError = /AUTH_REQUIRED|Unauthorized|Invalid user session|No authorization/i.test(message);
			toast.error(authError ? "Your session expired" : "The chef is busy", { description: authError ? "Please sign in again to cook a recipe." : "The kitchen assistant is unavailable right now. Please try again." });
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl md:text-5xl",
					children: "Discover recipes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "Search our library — or ask the AI chef to invent something new."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleGenerate,
				className: "mt-6 flex flex-col gap-3 sm:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							"aria-label": "Search recipes",
							maxLength: 200,
							placeholder: "Search recipes, ingredients, cuisines…",
							className: "h-12 pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						disabled: busy,
						className: "h-12",
						children: "Search"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "lg",
						disabled: busy,
						className: "h-12",
						onClick: handleAiGenerate,
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Ask AI chef"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "secondary",
						size: "lg",
						className: "h-12",
						onClick: handleSurprise,
						disabled: busy,
						children: "Surprise"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/recipes",
					search: {
						...cat === "All" ? {} : { c: cat },
						...q ? { q } : {}
					},
					className: `rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${active === cat ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted"}`,
					children: cat
				}, cat))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[4/3] w-full rounded-2xl" }, i))
				}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-dashed border-border p-12 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Recipes couldn't load right now."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "mt-4",
						onClick: () => void refetch(),
						children: "Try again"
					})]
				}) : recipes && recipes.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: recipes.map((r, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeCard, {
						recipe: r,
						priority: index < 2
					}, r.id))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-12 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: "Nothing here yet. Try generating a recipe above!"
					})
				})
			})
		]
	});
}
//#endregion
export { RecipesPage as component };
