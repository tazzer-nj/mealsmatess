import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { n as toast } from "./dist-BV242RuG.js";
import { i as createClientRpc, r as createServerFn } from "./firebase-auth-middleware-6QZ-o3Bh.js";
import { t as Link } from "./link-DqHkHLEB.js";
import { n as useNavigate } from "./useNavigate-BlI0eDHL.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { n as useQueryClient } from "./QueryClientProvider-DW69ZLWa.js";
import { t as useQuery } from "./useQuery-C9s6b3XV.js";
import { n as useSession } from "./use-session-DrDo_MXn.js";
import { t as createLucideIcon } from "./createLucideIcon-5qODTz61.js";
import { t as Calendar } from "./calendar-CfWBCRyB.js";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, t as Select } from "./select-CdlvkF5L.js";
import { t as Clock } from "./clock-IDSojuBC.js";
import { t as Heart } from "./heart-BeUe0Utz.js";
import { t as LoaderCircle } from "./loader-circle-DQwT8cZ8.js";
import { t as Plus } from "./plus-B_wgAisR.js";
import { t as Search } from "./search-DMRuxp1Q.js";
import { t as ShoppingCart } from "./shopping-cart-B7tih5-1.js";
import { t as Trash2 } from "./trash-2-CDfq80_b.js";
import { t as Users } from "./users-BqRBmYRA.js";
import { t as Button } from "./button-yWWHKMUk.js";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-B70RQ7lR.js";
import { t as firebaseData } from "./firebase-data-8L_7gg2z.js";
import { t as Input } from "./input-Cfa9G600.js";
import { t as requirePremium } from "./premium-middleware-C2B7KFxy.js";
import { t as Textarea } from "./textarea-DgSuVFm-.js";
import { V as myFavoritesQuery, Y as Label } from "./index-CfUBRHG1.js";
import { t as RecipeImage } from "./recipe-image-B05qRoOk.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BookMarked = createLucideIcon("book-marked", [["path", {
	d: "M10 2v8l3-3 3 3V2",
	key: "sqw3rj"
}], ["path", {
	d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20",
	key: "k3hazp"
}]]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Link2 = createLucideIcon("link-2", [
	["path", {
		d: "M9 17H7A5 5 0 0 1 7 7h2",
		key: "8i5ue5"
	}],
	["path", {
		d: "M15 7h2a5 5 0 1 1 0 10h-2",
		key: "1b9ql8"
	}],
	["line", {
		x1: "8",
		x2: "16",
		y1: "12",
		y2: "12",
		key: "1jonct"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PenLine = createLucideIcon("pen-line", [["path", {
	d: "M13 21h8",
	key: "1jsn5i"
}], ["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}]]);
//#endregion
//#region src/lib/import-recipe.functions.ts
var import_react = /* @__PURE__ */ __toESM(require_react());
var importRecipeFromUrl = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(createClientRpc("ed3c258f467bb732c85368d694140f10cd06167c124f6b4bcd2c61385a904b39"));
var updateRecipeBasics = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(createClientRpc("ca48beb31f23e13ede761dc160f99c0da2b946cd71ccd0be4fb329d0d0480d81"));
var deleteImportedRecipe = createServerFn({ method: "POST" }).middleware([requirePremium]).handler(createClientRpc("9097e8e2f5867b697561ac30eaa45f1bff9917b7d22291ddd15f282381dca537"));
//#endregion
//#region src/routes/cookbook.tsx?tsr-split=component
var import_jsx_runtime = require_jsx_runtime();
function CookbookPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [importOpen, setImportOpen] = (0, import_react.useState)(false);
	const [importUrl, setImportUrl] = (0, import_react.useState)("");
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [planning, setPlanning] = (0, import_react.useState)(null);
	const [busyId, setBusyId] = (0, import_react.useState)(null);
	const { data: favorites, isLoading } = useQuery({
		...myFavoritesQuery(),
		enabled: !!user
	});
	const items = (0, import_react.useMemo)(() => {
		if (!favorites) return [];
		return favorites.map((f) => f.recipes).filter((r) => r !== null);
	}, [favorites]);
	const { data: owned } = useQuery({
		queryKey: [
			"cookbook",
			"owned",
			user?.id
		],
		enabled: !!user,
		queryFn: async () => {
			const { data, error } = await firebaseData.from("recipes").select("id,slug,name,image_url,image_source,cooking_time_minutes,cuisine,category,servings,ingredients,description,created_by").eq("created_by", user.id).order("created_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		}
	});
	const merged = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const it of items) map.set(it.id, it);
		for (const it of owned ?? []) map.set(it.id, it);
		let arr = Array.from(map.values());
		if (query.trim()) {
			const q = query.toLowerCase();
			arr = arr.filter((r) => r.name.toLowerCase().includes(q) || (r.cuisine ?? "").toLowerCase().includes(q) || (r.category ?? "").toLowerCase().includes(q));
		}
		return arr;
	}, [
		items,
		owned,
		query
	]);
	async function handleImport() {
		const url = importUrl.trim();
		if (!url) return;
		try {
			new URL(url);
		} catch {
			toast.error("Please paste a valid link");
			return;
		}
		if (!user) {
			navigate({ to: "/auth" });
			return;
		}
		setImporting(true);
		try {
			const { slug } = await importRecipeFromUrl({ data: { url } });
			toast.success("Recipe imported to your Cookbook");
			setImportOpen(false);
			setImportUrl("");
			await queryClient.invalidateQueries({ queryKey: ["favorites"] });
			await queryClient.invalidateQueries({ queryKey: ["cookbook"] });
			navigate({
				to: "/recipe/$slug",
				params: { slug }
			});
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Import failed";
			if (msg.includes("No recipe could be detected")) toast.error("No recipe could be detected from this video.");
			else toast.error("Import failed", { description: msg });
		} finally {
			setImporting(false);
		}
	}
	async function toggleFavorite(recipeId) {
		if (!user) return;
		setBusyId(recipeId);
		try {
			await firebaseData.from("favorites").delete().eq("user_id", user.id).eq("recipe_id", recipeId);
			await queryClient.invalidateQueries({ queryKey: ["favorites"] });
			toast.success("Removed from Cookbook");
		} finally {
			setBusyId(null);
		}
	}
	async function handleDelete(item) {
		if (!user) return;
		if (!(item.created_by === user.id)) {
			await toggleFavorite(item.id);
			return;
		}
		if (!confirm(`Delete "${item.name}" from your Cookbook? This can't be undone.`)) return;
		setBusyId(item.id);
		try {
			await deleteImportedRecipe({ data: { id: item.id } });
			await queryClient.invalidateQueries({ queryKey: ["favorites"] });
			await queryClient.invalidateQueries({ queryKey: ["cookbook"] });
			toast.success("Recipe deleted");
		} catch (err) {
			toast.error("Couldn't delete", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setBusyId(null);
		}
	}
	async function addToGrocery(item) {
		if (!user) return;
		const ingredients = Array.isArray(item.ingredients) ? item.ingredients : [];
		if (ingredients.length === 0) {
			toast.error("This recipe has no ingredients");
			return;
		}
		setBusyId(item.id);
		try {
			const rows = ingredients.map((ing) => ({
				user_id: user.id,
				recipe_id: item.id,
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
		} catch (err) {
			toast.error("Couldn't add to list", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setBusyId(null);
		}
	}
	if (!loading && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookMarked, { className: "mx-auto h-10 w-10 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-3xl",
				children: "Your Cookbook"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "Sign in to save recipes and import from TikTok, Instagram, YouTube and more."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: () => navigate({ to: "/auth" }),
				children: "Sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Cookbook"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Your saved and imported recipes, all in one place."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setImportOpen(true),
					className: "shrink-0 rounded-full",
					size: "sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), "Import"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search your cookbook",
					className: "h-11 rounded-2xl pl-10"
				})]
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
			}) : merged.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-3xl border border-dashed border-border p-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookMarked, { className: "mx-auto h-10 w-10 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-xl",
						children: "Your cookbook is empty"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-1 max-w-xs text-sm text-muted-foreground",
						children: "Paste a cooking video link from TikTok, Instagram Reels, YouTube Shorts, or Facebook Reels — MealMate will turn it into a full recipe."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-5",
						onClick: () => setImportOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "mr-2 h-4 w-4" }), "Import your first recipe"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 space-y-3",
				children: merged.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/recipe/$slug",
							params: { slug: item.slug },
							className: "block h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
								recipe: item,
								size: "thumb",
								className: "h-full w-full object-cover"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/recipe/$slug",
									params: { slug: item.slug },
									className: "block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "line-clamp-2 font-display text-base leading-tight",
										children: item.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground",
									children: [
										item.cooking_time_minutes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
												item.cooking_time_minutes,
												"m"
											]
										}),
										item.servings && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }), item.servings]
										}),
										item.cuisine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.cuisine })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAction, {
											title: "Add to planner",
											onClick: () => setPlanning(item),
											icon: Calendar,
											disabled: busyId === item.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAction, {
											title: "Add ingredients to shopping list",
											onClick: () => addToGrocery(item),
											icon: ShoppingCart,
											disabled: busyId === item.id
										}),
										item.created_by === user?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAction, {
											title: "Edit",
											onClick: () => setEditing(item),
											icon: PenLine,
											disabled: busyId === item.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAction, {
											title: "Remove from cookbook",
											onClick: () => toggleFavorite(item.id),
											icon: Heart,
											variant: "fav",
											disabled: busyId === item.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconAction, {
											title: "Delete",
											onClick: () => handleDelete(item),
											icon: Trash2,
											variant: "danger",
											disabled: busyId === item.id
										})
									]
								})
							]
						})]
					})
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: importOpen,
				onOpenChange: setImportOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Import a recipe from a video" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Paste a link from TikTok, Instagram Reels, YouTube Shorts, Facebook Reels or any cooking video. MealMate AI will extract the recipe." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "import-url",
								children: "Video link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "import-url",
								autoFocus: true,
								placeholder: "https://www.tiktok.com/@...",
								value: importUrl,
								onChange: (e) => setImportUrl(e.target.value),
								onKeyDown: (e) => {
									if (e.key === "Enter" && !importing) handleImport();
								}
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setImportOpen(false),
							disabled: importing,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: handleImport,
							disabled: importing || !importUrl.trim(),
							children: importing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Analyzing…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookMarked, { className: "mr-2 h-4 w-4" }), "Import"] })
						})] })
					]
				})
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditRecipeDialog, {
				item: editing,
				onClose: () => setEditing(null),
				onSaved: async () => {
					await queryClient.invalidateQueries({ queryKey: ["favorites"] });
					await queryClient.invalidateQueries({ queryKey: ["cookbook"] });
					await queryClient.invalidateQueries({ queryKey: ["recipe"] });
					setEditing(null);
				}
			}),
			planning && user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanDialog, {
				item: planning,
				userId: user.id,
				onClose: () => setPlanning(null),
				onDone: async () => {
					await queryClient.invalidateQueries({ queryKey: ["planner"] });
					setPlanning(null);
				}
			})
		]
	});
}
function IconAction({ icon: Icon, title, onClick, variant = "default", disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		title,
		"aria-label": title,
		onClick,
		disabled,
		className: `inline-flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors disabled:opacity-50 ${variant === "danger" ? "text-destructive hover:bg-destructive/10" : variant === "fav" ? "text-rose-500 hover:bg-rose-500/10" : "text-muted-foreground hover:bg-muted"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${variant === "fav" ? "fill-current" : ""}` })
	});
}
function EditRecipeDialog({ item, onClose, onSaved }) {
	const [name, setName] = (0, import_react.useState)(item.name);
	const [description, setDescription] = (0, import_react.useState)(item.description ?? "");
	const [time, setTime] = (0, import_react.useState)(item.cooking_time_minutes ? String(item.cooking_time_minutes) : "");
	const [servings, setServings] = (0, import_react.useState)(item.servings ? String(item.servings) : "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save() {
		setSaving(true);
		try {
			await updateRecipeBasics({ data: {
				id: item.id,
				name: name.trim() || item.name,
				description: description.trim() || void 0,
				cooking_time_minutes: time ? parseInt(time, 10) : null,
				servings: servings ? parseInt(servings, 10) : null
			} });
			toast.success("Recipe updated");
			await onSaved();
		} catch (err) {
			toast.error("Couldn't save", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit recipe" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rname",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "rname",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rdesc",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "rdesc",
								rows: 3,
								value: description,
								onChange: (e) => setDescription(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rtime",
									children: "Time (min)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "rtime",
									type: "number",
									min: 0,
									value: time,
									onChange: (e) => setTime(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "rserv",
									children: "Servings"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "rserv",
									type: "number",
									min: 0,
									value: servings,
									onChange: (e) => setServings(e.target.value)
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onClose,
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving,
					children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Save"]
				})] })
			]
		})
	});
}
function PlanDialog({ item, userId, onClose, onDone }) {
	const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const [date, setDate] = (0, import_react.useState)(today);
	const [meal, setMeal] = (0, import_react.useState)("Dinner");
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save() {
		setSaving(true);
		try {
			const { error } = await firebaseData.from("meal_plans").insert({
				user_id: userId,
				recipe_id: item.id,
				plan_date: date,
				meal_type: meal
			});
			if (error) throw error;
			toast.success("Added to planner");
			await onDone();
		} catch (err) {
			toast.error("Couldn't add", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Add to meal planner" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: item.name })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "pdate",
							children: "Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pdate",
							type: "date",
							value: date,
							onChange: (e) => setDate(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Meal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: meal,
							onValueChange: setMeal,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
								"Breakfast",
								"Lunch",
								"Dinner",
								"Snack"
							].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: m,
								children: m
							}, m)) })]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onClose,
					disabled: saving,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving,
					children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Add to planner"]
				})] })
			]
		})
	});
}
//#endregion
export { CookbookPage as component };
