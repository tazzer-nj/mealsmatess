import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Dt as Crown, F as Refrigerator, Gt as Calendar, L as Plus, Lt as ChevronRight, R as Play, U as Moon, Vt as Check, W as Monitor, Wt as Camera, Y as MessageCircleQuestionMark, j as Search, kt as Clock, l as UserRound, pt as Heart, rt as LoaderCircle, t as Zap, tn as ArrowRight, v as Sun, vt as Flame, x as Sparkles } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as personalize } from "./preferences-CRPr2kaW.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { c as trendingRecipesQuery, o as recipesByCategoryQuery, s as southAfricanFavoritesQuery, t as myFavoritesQuery } from "./queries-v7vmnG2D.mjs";
import { t as HubHome } from "./hub-home-DQ1v1oH6.mjs";
import { r as getGamification } from "./xp.functions-CxtV_ELG.mjs";
import { a as surpriseMe } from "./ai.functions-ClgZvg8e.mjs";
import { n as useTheme } from "./theme-provider-CWQX-5Of.mjs";
import { t as getContinueCooking } from "./continue-cooking-DKh2fosv.mjs";
import { t as loadRecipeSearchImages } from "./recipe-search-images-D55G6ndF.mjs";
import { n as usePreferences, t as AdSlot } from "./use-preferences-BFs24Lw1.mjs";
import { a as DropdownMenuTrigger, n as DropdownMenuContent, o as Route, r as DropdownMenuItem, t as DropdownMenu } from "./routes-D2PgdGoT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dc4A5VY3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var OPTIONS = [
	{
		value: "light",
		label: "Light",
		icon: Sun
	},
	{
		value: "dark",
		label: "Dark",
		icon: Moon
	},
	{
		value: "system",
		label: "System",
		icon: Monitor
	}
];
function ThemeToggle() {
	const { mode, resolved, setMode } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon",
			className: "rounded-full bg-secondary hover:bg-secondary/80",
			"aria-label": "Choose theme",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(resolved === "dark" ? Moon : Sun, { className: "h-4 w-4" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
		align: "end",
		className: "min-w-[9rem]",
		children: OPTIONS.map((o) => {
			const O = o.icon;
			const active = mode === o.value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: () => setMode(o.value),
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(O, { className: "h-4 w-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex-1",
						children: o.label
					}),
					active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
				]
			}, o.value);
		})
	})] });
}
var PREMIUM_PERKS = [
	"Up to 100 Mia AI requests a day (fair use)",
	"Unlimited saved favourites",
	"Unlimited weekly meal plans",
	"Advanced personalised meal suggestions",
	"Auto grocery lists from your plan",
	"Ingredient substitutions & cooking mode",
	"Advanced nutrition tracking",
	"Premium themes · No ads"
];
function PlanStatusCard() {
	const { user } = useSession();
	const { isPremium, tier, trialActive, entitlement } = usePremium();
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/auth",
		className: "flex items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
			children: "Not signed in"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 font-display text-lg",
			children: "Sign in to track your usage"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground",
			children: "Sign in"
		})]
	});
	if (isPremium) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-5 text-white shadow-lg shadow-orange-500/30",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-3 w-3" }),
						" Premium ",
						tier,
						" ",
						trialActive ? "· trial" : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-2 font-display text-2xl font-bold leading-tight",
					children: "Unlimited everything"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-white/90",
					children: entitlement?.periodEnd ? `Renews ${new Date(entitlement.periodEnd).toLocaleDateString()}` : "Lifetime access"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-6 w-6 shrink-0 text-white/80" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2",
			children: PREMIUM_PERKS.slice(0, 6).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-1.5 text-xs text-white/95",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 shrink-0" }),
					" ",
					p
				]
			}, p))
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/premium",
		className: "flex items-center justify-between rounded-3xl border border-border bg-card p-4 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
			children: "Subscription needed"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 font-display text-lg",
			children: "Check your Premium access"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground",
			children: "View plans"
		})]
	});
}
/** Compact level pill shown in the home greeting header; links to profile. */
function XpChip() {
	const { user } = useSession();
	const { data } = useQuery({
		queryKey: ["gamification"],
		queryFn: () => getGamification(),
		enabled: !!user,
		staleTime: 6e4
	});
	if (!user || !data) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/profile",
		"aria-label": `Level ${data.level.level}: ${data.level.name}`,
		className: "flex h-9 items-center gap-1 rounded-full bg-primary/10 px-3 text-xs font-bold text-primary transition-colors hover:bg-primary/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-3.5 w-3.5" }),
			"Lv ",
			data.level.level
		]
	});
}
function HomeSurface() {
	const { isHub } = Route.useRouteContext();
	return isHub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubHome, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Index, {});
}
var CATEGORY_PILLS = [
	{
		label: "Breakfast",
		search: { c: "Breakfast" }
	},
	{
		label: "Lunch",
		search: { c: "Lunch" }
	},
	{
		label: "Dinner",
		search: { c: "Dinner" }
	},
	{
		label: "Dessert",
		search: { c: "Dessert" }
	},
	{
		label: "Snacks",
		search: { c: "Snacks" }
	},
	{
		label: "South African",
		search: { c: "South African Favorites" }
	},
	{
		label: "Healthy",
		search: { c: "Healthy Meals" }
	},
	{
		label: "Vegan",
		search: { c: "Vegan" }
	}
];
function greeting() {
	const hour = (/* @__PURE__ */ new Date()).getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}
function FeaturedRecipe({ recipe, isFavorite, onToggleFavorite, priority }) {
	const r = recipe;
	const tags = Array.isArray(r.diet_tags) ? r.diet_tags.slice(0, 2) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group relative w-[264px] flex-shrink-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/recipe/$slug",
				params: { slug: r.slug },
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative aspect-[4/3] overflow-hidden rounded-[16px] border border-[#1E1E1E] bg-[#141414]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
							recipe: r,
							size: "card",
							priority,
							className: "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" }),
						r.cooking_time_minutes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
									size: 12,
									"aria-hidden": "true"
								}),
								r.cooking_time_minutes,
								" min"
							]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-3 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em] text-white",
					children: r.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onToggleFavorite(r.id),
				"aria-label": isFavorite ? `Remove ${r.name} from favourites` : `Save ${r.name}`,
				"aria-pressed": isFavorite,
				className: "absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
					size: 16,
					className: isFavorite ? "fill-white" : "",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#71717A]",
				children: [
					r.difficulty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "capitalize",
						children: r.difficulty
					}) : null,
					r.difficulty && tags.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "·"
					}) : null,
					tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#A1A1AA]",
						children: t
					}, t))
				]
			})
		]
	});
}
function RailSkeleton({ count, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-4 overflow-hidden",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mm-skeleton flex-shrink-0 ${className ?? ""}` }, i))
	});
}
function Index() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user } = useSession();
	const { preferences, hasPreferences } = usePreferences();
	const { data: trendingRaw = [], isLoading: trendingLoading, error: trendingError } = useQuery({
		...trendingRecipesQuery(),
		enabled: !!user
	});
	const { data: southAfricanRaw = [], isLoading: southAfricanLoading, error: southAfricanError } = useQuery({
		...southAfricanFavoritesQuery(),
		enabled: !!user
	});
	const recipeText = (r) => [
		String(r.name),
		r.description == null ? null : String(r.description),
		r.cuisine == null ? null : String(r.cuisine),
		r.category == null ? null : String(r.category),
		Array.isArray(r.diet_tags) ? r.diet_tags.map(String) : []
	];
	const trending = personalize(hasPreferences ? preferences : null, trendingRaw ?? [], recipeText);
	const southAfrican = southAfricanRaw ? personalize(hasPreferences ? preferences : null, southAfricanRaw, recipeText) : southAfricanRaw;
	const { data: favorites } = useQuery({
		...myFavoritesQuery(),
		enabled: !!user
	});
	const [query, setQuery] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const continueCooking = getContinueCooking();
	const favoriteIds = new Set((favorites ?? []).map((f) => f.recipe_id));
	const firstName = user?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
	async function handleSearch(e) {
		e.preventDefault();
		if (!query.trim() || busy) return;
		const term = query.trim();
		await navigate({
			to: "/recipes",
			search: { q: term }
		});
		queryClient.fetchQuery(recipesByCategoryQuery(void 0, term)).then((matches) => loadRecipeSearchImages(matches, queryClient)).catch(() => {});
	}
	async function handleSurprise() {
		if (busy) return;
		setBusy("surprise");
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
			setBusy(null);
		}
	}
	async function toggleFavorite(recipeId) {
		if (!user) {
			toast.info("Sign in to save favourites");
			return;
		}
		if (favoriteIds.has(recipeId)) await firebaseData.from("favorites").delete().eq("user_id", user.id).eq("recipe_id", recipeId);
		else await firebaseData.from("favorites").insert({
			user_id: user.id,
			recipe_id: recipeId
		});
		queryClient.invalidateQueries({ queryKey: ["favorites"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex-1 pb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-[1120px] px-5 pt-8 lg:px-8 lg:pt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mm-fade-up flex items-start justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mm-eyebrow",
								children: greeting()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mm-h1 mt-2 flex items-center gap-2",
								children: [
									"Hi ",
									firstName,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: "text-[0.9em]",
										children: "👋"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mm-body mt-1.5",
								children: "What are you craving today?"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-shrink-0 items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden sm:flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XpChip, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden sm:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeToggle, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/profile",
								"aria-label": "Profile and settings",
								className: "flex size-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1c1c1c]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
									size: 18,
									strokeWidth: 1.8,
									"aria-hidden": "true"
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSearch,
					className: "mm-search mm-fade-up mt-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: "mm-search-icon",
							size: 18,
							strokeWidth: 1.9,
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Search recipes, ingredients...",
							"aria-label": "Search recipes and ingredients",
							maxLength: 200,
							className: "mm-input"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy !== null,
							className: "mm-search-action",
							"aria-label": "Search",
							children: busy === "search" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "animate-spin",
								size: 17,
								"aria-hidden": "true"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								size: 17,
								"aria-hidden": "true"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mm-chip-row mt-5",
					role: "navigation",
					"aria-label": "Recipe categories",
					children: [CATEGORY_PILLS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/recipes",
						search: c.search,
						className: "mm-chip",
						children: c.label
					}, c.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/recipes",
						className: "mm-chip",
						children: "More"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "featured-heading",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-section-head",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "featured-heading",
										className: "mm-h2",
										children: "Featured recipes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/recipes",
										className: "inline-flex items-center gap-1 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white",
										children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
											size: 14,
											"aria-hidden": "true"
										})]
									})]
								}), trendingLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailSkeleton, {
									count: 3,
									className: "h-[198px] w-[264px] rounded-[16px]"
								}) : trendingError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-empty",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mm-empty-icon",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, {
												size: 20,
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[14px] font-medium text-white",
											children: "Recipes are unavailable"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mm-sub max-w-xs",
											children: "We couldn't load recipes right now. The rest of MealMate still works."
										})
									]
								}) : trending.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0",
									children: trending.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedRecipe, {
										recipe: r,
										isFavorite: favoriteIds.has(r.id),
										onToggleFavorite: toggleFavorite,
										priority: i < 2
									}, r.id))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-empty",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mm-empty-icon",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
												size: 20,
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[14px] font-medium text-white",
											children: "No recipes yet"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mm-sub max-w-xs",
											children: "Let Mia create something for you — start with Surprise Me."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "sa-heading",
								className: "mt-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mm-section-head",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "sa-heading",
										className: "mm-h2",
										children: "South African favourites"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/recipes",
										search: { c: "South African Favorites" },
										className: "inline-flex items-center gap-1 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white",
										children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
											size: 14,
											"aria-hidden": "true"
										})]
									})]
								}), southAfricanLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailSkeleton, {
									count: 5,
									className: "size-[104px] rounded-[14px]"
								}) : southAfricanError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mm-sub",
									children: "This section is temporarily unavailable."
								}) : southAfrican && southAfrican.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "no-scrollbar -mx-5 flex gap-3.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0",
									children: southAfrican.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/recipe/$slug",
										params: { slug: r.slug },
										className: "group w-[104px] flex-shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "aspect-square w-full overflow-hidden rounded-[14px] border border-[#1E1E1E] bg-[#141414]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
												recipe: r,
												size: "thumb",
												className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 line-clamp-2 text-[12px] font-medium leading-snug text-white",
											children: r.name
										})]
									}, r.id))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mm-sub",
									children: "South African recipes will appear here once you generate a few."
								})]
							}),
							continueCooking && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "continue-heading",
								className: "mt-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mm-section-head",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "continue-heading",
										className: "mm-h2",
										children: "Continue cooking"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/recipe/$slug",
									params: { slug: continueCooking.slug },
									className: "mm-card mm-card-hover flex items-center gap-4 p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "size-16 flex-shrink-0 overflow-hidden rounded-[12px] bg-[#171717]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
												recipe: continueCooking,
												size: "thumb",
												className: "h-full w-full object-cover"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate text-[15px] font-medium text-white",
													children: continueCooking.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#222222]",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-full rounded-full bg-white",
														style: { width: `${continueCooking.progress}%` }
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-2 flex items-center gap-3 text-[11px] text-[#71717A]",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [continueCooking.progress, "% complete"] }),
														continueCooking.cooking_time_minutes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [continueCooking.cooking_time_minutes, " min"] }),
														continueCooking.calories && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [continueCooking.calories, " cal"] })
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#080808]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
												size: 14,
												className: "fill-current",
												"aria-hidden": "true"
											})
										})
									]
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "kitchen-heading",
								className: "mm-card mm-pad",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										id: "kitchen-heading",
										className: "mm-h3 text-white",
										children: "What's in your kitchen?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mm-sub mt-1.5",
										children: "Turn your ingredients into something delicious."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex flex-col gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/scan",
												className: "mm-btn mm-btn-secondary mm-btn-block justify-start px-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
													size: 17,
													"aria-hidden": "true"
												}), "Scan ingredients"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/pantry",
												className: "mm-btn mm-btn-secondary mm-btn-block justify-start px-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
													size: 17,
													"aria-hidden": "true"
												}), "Add ingredients"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/pantry",
												className: "mm-btn mm-btn-ghost mm-btn-block justify-start px-4 text-[14px]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refrigerator, {
													size: 17,
													"aria-hidden": "true"
												}), "View pantry"]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "relative overflow-hidden rounded-[20px] border border-[#262626] bg-[#141414] p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										"aria-hidden": true,
										className: "pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/[0.06] blur-2xl"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mm-eyebrow relative",
										children: "Mia's pick"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mm-h2 relative mt-2 text-white",
										children: "Surprise Me"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mm-sub relative mt-1.5",
										children: "One tap and Mia finds a recipe that fits your taste right now."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: handleSurprise,
										disabled: busy !== null,
										className: "mm-btn mm-btn-primary mm-btn-block relative mt-5",
										children: [busy === "surprise" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
											className: "animate-spin",
											size: 17,
											"aria-hidden": "true"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
											size: 17,
											"aria-hidden": "true"
										}), busy === "surprise" ? "Finding a recipe" : "Surprise Me"]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
								"aria-label": "Shortcuts",
								className: "grid grid-cols-2 gap-2",
								children: [
									{
										to: "/chat",
										icon: MessageCircleQuestionMark,
										label: "Ask Mia"
									},
									{
										to: "/planner",
										icon: Calendar,
										label: "Meal planner"
									},
									{
										to: "/coach",
										icon: Flame,
										label: "Nutrition"
									},
									{
										to: "/restaurants",
										icon: ChevronRight,
										label: "Dining"
									}
								].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: a.to,
									className: "mm-card mm-card-hover flex items-center gap-2.5 px-3.5 py-3 text-[13px] font-medium text-white",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(a.icon, {
										size: 16,
										className: "text-[#A1A1AA]",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: a.label
									})]
								}, a.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanStatusCard, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: "home_feed" })
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/chat",
			"aria-label": "Ask Mia",
			className: "fixed bottom-[calc(var(--app-nav-h)+16px)] right-4 z-30 flex size-13 items-center justify-center rounded-full bg-white text-[#080808] shadow-[0_10px_30px_rgba(0,0,0,0.45)] lg:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircleQuestionMark, {
				size: 21,
				"aria-hidden": "true"
			})
		})]
	});
}
//#endregion
export { HomeSurface as component };
