import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as ChefHat, R as Play, b as Star, kt as Clock, lt as Image, n as X, ot as Lightbulb, pt as Heart, rn as ArrowLeftRight, rt as LoaderCircle, s as Users, vt as Flame, w as ShoppingCart } from "../_libs/lucide-react.mjs";
import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { a as objectType, i as numberType, s as stringType } from "../_libs/zod.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as ImageCredit } from "./recipe-image-tools-Bh6QtubJ.mjs";
import { t as requirePremium } from "./premium-middleware-C-XKyPH0.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { a as recipeBySlugQuery, t as myFavoritesQuery } from "./queries-v7vmnG2D.mjs";
import { t as awardXp } from "./xp.functions-CxtV_ELG.mjs";
import { n as regenerateRecipeImage } from "./ai.functions-ClgZvg8e.mjs";
import { a as useFeatureFlag, i as suggestSubstitutions } from "./use-feature-flag-Dcg0eXe5.mjs";
import { n as postAuthenticatedAi, t as Route } from "./recipe._slug-BGiKe8z7.mjs";
import { n as setContinueCooking } from "./continue-cooking-DKh2fosv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recipe._slug-lAk1jhfi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var trackRecipeView = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ recipeId: stringType().uuid() }).parse(v)).handler(createSsrRpc("f98806f9a0359d0b72668e24bf9c48e4bfcbccca1d66ea84d832c835e14773a3"));
createServerFn({ method: "GET" }).middleware([requirePremium]).handler(createSsrRpc("cd1a020dcc20add8842771171fbfddbe1fd2bbb11fe15e63d82cfec2bce5b6db"));
var rateRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({
	recipeId: stringType().uuid(),
	rating: numberType().int().min(1).max(5),
	review: stringType().max(1e3).optional()
}).parse(v)).handler(createSsrRpc("1bd377cc6c24febb0f51eb70a42c465ea1e50ea476f8a7239943fde8c590faa9"));
var listRecipeRatings = createServerFn({ method: "POST" }).middleware([requirePremium]).validator((v) => objectType({ recipeId: stringType().uuid() }).parse(v)).handler(createSsrRpc("0c61881df2fc0aefd7172ca427405d56225a8226e6a7b8120228612cf8825501"));
function SubstitutionsButton({ ingredient, recipeName }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [subs, setSubs] = (0, import_react.useState)(null);
	const run = useServerFn(suggestSubstitutions);
	async function load() {
		setOpen(true);
		if (subs || loading) return;
		setLoading(true);
		try {
			const { substitutes } = await run({ data: {
				ingredient,
				context: recipeName
			} });
			setSubs(substitutes);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't fetch substitutes");
			setOpen(false);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: load,
		"aria-label": `Substitutes for ${ingredient}`,
		className: "text-muted-foreground transition-colors hover:text-primary",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { className: "h-3.5 w-3.5" })
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center",
		onClick: () => setOpen(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-label": "Ingredient substitutions",
			className: "w-full max-w-md rounded-3xl bg-card p-5 shadow-xl",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
						children: "Substitutes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: ingredient
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Close",
						onClick: () => setOpen(false),
						className: "rounded-full p-1 hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 py-6 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " Asking the chef…"]
				}),
				!loading && subs && subs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-sm text-muted-foreground",
					children: "No good substitutes found."
				}),
				!loading && subs && subs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: subs.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: s.name
							}), s.ratio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: s.ratio
							})]
						}), s.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: s.notes
						})]
					}, i))
				})
			]
		})
	})] });
}
function RecipeRatings({ recipeId }) {
	const { user } = useSession();
	const qc = useQueryClient();
	const [myRating, setMyRating] = (0, import_react.useState)(0);
	const [review, setReview] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const loadRatings = useServerFn(listRecipeRatings);
	const saveRating = useServerFn(rateRecipe);
	const { data: ratings } = useQuery({
		queryKey: ["ratings", recipeId],
		queryFn: async () => (await loadRatings({ data: { recipeId } })).slice(0, 20)
	});
	const mine = ratings?.find((rating) => rating.isMine);
	(0, import_react.useEffect)(() => {
		if (mine) {
			setMyRating(mine.rating);
			setReview(mine.review ?? "");
		}
	}, [mine]);
	async function submit() {
		if (!user) {
			toast.info("Sign in to rate");
			return;
		}
		if (!myRating) {
			toast.info("Pick 1–5 stars");
			return;
		}
		setSaving(true);
		try {
			await saveRating({ data: {
				recipeId,
				rating: myRating,
				review: review.trim() || void 0
			} });
			toast.success("Thanks for rating!");
			await qc.invalidateQueries({ queryKey: ["ratings", recipeId] });
			await qc.invalidateQueries({ queryKey: ["recipe"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't save rating");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl",
				children: "Ratings & reviews"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Your rating"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex items-center gap-1",
						children: [
							1,
							2,
							3,
							4,
							5
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMyRating(n),
							"aria-label": `${n} star${n > 1 ? "s" : ""}`,
							className: "p-0.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-6 w-6 ${n <= myRating ? "fill-primary text-primary" : "text-muted-foreground"}` })
						}, n))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: review,
						onChange: (e) => setReview(e.target.value),
						placeholder: "Share your thoughts (optional)",
						rows: 3,
						maxLength: 800,
						className: "mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: submit,
							disabled: saving || !user,
							children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), mine ? "Update review" : "Post review"]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 space-y-3",
				children: ratings && ratings.length > 0 ? ratings.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/60 bg-card/50 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: `h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}` }, i)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 text-xs text-muted-foreground",
							children: new Date(r.created_at).toLocaleDateString()
						})]
					}), r.review && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: r.review
					})]
				}, r.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No reviews yet. Be the first!"
				})
			})
		]
	});
}
var CookingMode = (0, import_react.lazy)(() => import("./cooking-mode-B5DCr6WS.mjs").then((m) => ({ default: m.CookingMode })));
function RecipePage() {
	const { slug } = Route.useParams();
	const recipe = Route.useLoaderData();
	const { user } = useSession();
	const { data } = useQuery({
		...recipeBySlugQuery(slug),
		enabled: !!user
	});
	const r = data ?? recipe;
	const { isPremium } = usePremium();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: favorites } = useQuery({
		...myFavoritesQuery(),
		enabled: !!user
	});
	const [savingFav, setSavingFav] = (0, import_react.useState)(false);
	const [addingList, setAddingList] = (0, import_react.useState)(false);
	const [regen, setRegen] = (0, import_react.useState)(false);
	const [cookingOpen, setCookingOpen] = (0, import_react.useState)(false);
	const cookingModeEnabled = useFeatureFlag("cooking_mode", true);
	const [makingImage, setMakingImage] = (0, import_react.useState)(false);
	const requestRecipeImage = (0, import_react.useCallback)(async () => {
		if (!r?.id || !user) return;
		setMakingImage(true);
		try {
			const result = await postAuthenticatedAi("/api/recipe-image", { recipeId: r.id }, { timeoutMs: 12e4 });
			if (result.imageUrl) await queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] });
			else if (result.reason === "limit") toast.message("Daily photo allowance reached", { description: "Try creating this photo again when your allowance resets. Premium includes more." });
		} catch (error) {
			toast.error("Couldn't create a recipe photo", { description: error instanceof Error ? error.message : "Please try again." });
		} finally {
			setMakingImage(false);
		}
	}, [
		queryClient,
		r?.id,
		r?.slug,
		user
	]);
	(0, import_react.useEffect)(() => {
		if (!user || !r?.id || r.image_url) return;
		requestRecipeImage();
	}, [
		user,
		r?.id,
		r?.image_url,
		requestRecipeImage
	]);
	async function regenerateImage() {
		if (!user || !r) {
			navigate({ to: "/auth" });
			return;
		}
		if (!isPremium) {
			toast.error("Upgrade to Premium to regenerate recipe images.");
			navigate({ to: "/premium" });
			return;
		}
		setRegen(true);
		try {
			await regenerateRecipeImage({ data: { slug: r.slug } });
			await queryClient.invalidateQueries({ queryKey: ["recipe", r.slug] });
			toast.success("New image generated");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to regenerate");
		} finally {
			setRegen(false);
		}
	}
	(0, import_react.useEffect)(() => {
		if (!r) return;
		setContinueCooking({
			slug: r.slug,
			name: r.name,
			image_url: r.image_url,
			cooking_time_minutes: r.cooking_time_minutes,
			calories: r.calories
		});
		if (user && r.id) trackRecipeView({ data: { recipeId: r.id } }).catch(() => {});
	}, [r, user]);
	if (!r) return null;
	const ingredients = Array.isArray(r.ingredients) ? r.ingredients : [];
	const steps = Array.isArray(r.steps) ? r.steps : [];
	const isFav = favorites?.some((f) => f.recipe_id === r.id) ?? false;
	const stats = [
		r.cooking_time_minutes && {
			icon: Clock,
			label: `${r.cooking_time_minutes} min`
		},
		r.servings && {
			icon: Users,
			label: `${r.servings} servings`
		},
		r.calories && {
			icon: Flame,
			label: `${r.calories} kcal (est.)`
		},
		r.difficulty && {
			icon: ChefHat,
			label: r.difficulty
		}
	].filter(Boolean);
	async function toggleFavorite() {
		if (!user || !r) {
			navigate({ to: "/auth" });
			return;
		}
		setSavingFav(true);
		try {
			if (isFav) await firebaseData.from("favorites").delete().eq("recipe_id", r.id).eq("user_id", user.id);
			else await firebaseData.from("favorites").insert({
				recipe_id: r.id,
				user_id: user.id
			});
			await queryClient.invalidateQueries({ queryKey: ["favorites"] });
		} catch {
			toast.error("Couldn't update favorites");
		} finally {
			setSavingFav(false);
		}
	}
	async function addToGrocery() {
		if (!user || !r) {
			navigate({ to: "/auth" });
			return;
		}
		if (ingredients.length === 0) return;
		setAddingList(true);
		try {
			const rows = ingredients.map((ing) => ({
				user_id: user.id,
				recipe_id: r.id,
				name: ing.name,
				quantity: ing.quantity ?? null
			}));
			const { error } = await firebaseData.from("grocery_items").insert(rows);
			if (error) throw error;
			await queryClient.invalidateQueries({ queryKey: ["grocery"] });
			toast.success("Added to your grocery list", { action: {
				label: "View",
				onClick: () => navigate({ to: "/list" })
			} });
		} catch {
			toast.error("Couldn't add to grocery list");
		} finally {
			setAddingList(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-5xl px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/recipes",
					className: "text-sm font-medium text-muted-foreground hover:text-foreground",
					children: "← Back to recipes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-8 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-[20px] border border-border bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
							recipe: r,
							size: "hero",
							priority: true,
							generating: makingImage,
							className: "aspect-square w-full object-cover"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageCredit, {
						source: r.image_source,
						attribution: r.image_attribution
					}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2 text-sm text-muted-foreground",
								children: [
									r.cuisine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.cuisine }),
									r.country && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", r.country] }),
									r.category && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", r.category] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-[34px] font-medium leading-[1.1] tracking-[-0.03em] md:text-[44px]",
								children: r.name
							}),
							r.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-lg text-muted-foreground",
								children: r.description
							}),
							r.diet_tags && r.diet_tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex flex-wrap gap-2",
								children: r.diet_tags.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground",
									children: t
								}, t))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4",
								children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-medium",
										children: s.label
									})]
								}, s.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 flex flex-wrap gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: toggleFavorite,
										variant: isFav ? "default" : "secondary",
										disabled: savingFav,
										children: [savingFav ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `mr-2 h-4 w-4 ${isFav ? "fill-current" : ""}` }), isFav ? "Saved" : "Save"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: addToGrocery,
										variant: "outline",
										disabled: addingList,
										children: [addingList ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "mr-2 h-4 w-4" }), "Add to list"]
									}),
									cookingModeEnabled && steps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: () => setCookingOpen(true),
										variant: "default",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-2 h-4 w-4" }), "Start cooking"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										onClick: regenerateImage,
										variant: "outline",
										disabled: regen,
										children: [regen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "mr-2 h-4 w-4" }), isPremium ? "Regenerate image" : "AI image (Premium)"]
									})
								]
							})
						]
					})]
				}),
				(r.protein_g || r.carbs_g || r.fat_g) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4",
					children: [
						{
							label: "Protein (est.)",
							value: r.protein_g
						},
						{
							label: "Carbs (est.)",
							value: r.carbs_g
						},
						{
							label: "Fat (est.)",
							value: r.fat_g
						}
					].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-display text-2xl",
							children: [m.value ?? "–", "g"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: m.label
						})]
					}, m.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 grid gap-10 md:grid-cols-[1fr_1.5fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
						children: "Ingredients"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: ingredients.map((ing, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-3 border-b border-border/60 pb-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [ing.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubstitutionsButton, {
									ingredient: ing.name,
									recipeName: r.name
								})]
							}), ing.quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-muted-foreground",
								children: ing.quantity
							})]
						}, i))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
						children: "Instructions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-4 space-y-4",
						children: steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
								children: i + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pt-0.5 text-sm leading-relaxed",
								children: step
							})]
						}, i))
					})] })]
				}),
				r.fun_fact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 flex gap-3 rounded-2xl bg-secondary p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-5 w-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-secondary-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Did you know?" }),
							" ",
							r.fun_fact
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeRatings, { recipeId: r.id })
			]
		}), cookingOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: null,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CookingMode, {
				name: r.name,
				steps,
				onClose: () => setCookingOpen(false),
				onComplete: async () => {
					if (!user) return;
					try {
						const res = await awardXp({ data: {
							action: "recipe_cooked",
							entityId: r.id
						} });
						if (res.awarded) {
							toast.success(`+${res.points} XP — well cooked!`);
							queryClient.invalidateQueries({ queryKey: ["gamification"] });
						}
					} catch {}
				}
			})
		})]
	});
}
//#endregion
export { RecipePage as component };
