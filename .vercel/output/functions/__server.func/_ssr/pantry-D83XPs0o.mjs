import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as ChefHat, F as Refrigerator, L as Plus, Wt as Camera, h as Trash2, it as ListChecks, j as Search, rt as LoaderCircle, tn as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { r as myPantryQuery } from "./queries-v7vmnG2D.mjs";
import { t as generateRecipe } from "./ai.functions-ClgZvg8e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pantry-D83XPs0o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function pantryRecipeQuery(names) {
	const ingredients = names.map((name) => name.trim()).filter(Boolean).slice(0, 12);
	if (!ingredients.length) return null;
	return `Make a meal using my pantry: ${ingredients.join(", ")}. Prioritize these ingredients.`.slice(0, 200);
}
function PantryPage() {
	const { user } = useSession();
	const navigate = useNavigate();
	const client = useQueryClient();
	const { data: items = [], isLoading, error } = useQuery({
		...myPantryQuery(),
		enabled: !!user
	});
	const [name, setName] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [generating, setGenerating] = (0, import_react.useState)(false);
	const [removing, setRemoving] = (0, import_react.useState)(null);
	async function add() {
		if (!user || !name.trim() || busy) return;
		setBusy(true);
		try {
			const { error } = await firebaseData.from("pantry_items").insert({
				user_id: user.id,
				name: name.trim(),
				quantity: quantity.trim() || null,
				source: "manual"
			});
			if (error) throw error;
			setName("");
			setQuantity("");
			await client.invalidateQueries({ queryKey: ["pantry"] });
		} catch {
			toast.error("Couldn't add that ingredient. Please try again.");
		} finally {
			setBusy(false);
		}
	}
	async function remove(id) {
		if (!user) return;
		setRemoving(id);
		try {
			const { error } = await firebaseData.from("pantry_items").delete().eq("id", id).eq("user_id", user.id);
			if (error) throw error;
			await client.invalidateQueries({ queryKey: ["pantry"] });
		} catch {
			toast.error("Couldn't remove that ingredient.");
		} finally {
			setRemoving(null);
		}
	}
	async function cook() {
		const query = pantryRecipeQuery(items.map((item) => item.name));
		if (!query || generating) return;
		setGenerating(true);
		try {
			const { slug } = await generateRecipe({ data: { query } });
			await navigate({
				to: "/recipe/$slug",
				params: { slug }
			});
		} catch {
			toast.error("The chef couldn't find a recipe right now. Please try again.");
		} finally {
			setGenerating(false);
		}
	}
	const needle = filter.trim().toLowerCase();
	const visible = needle ? items.filter((i) => i.name.toLowerCase().includes(needle)) : items;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-3xl flex-1 px-5 pb-10 pt-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mm-eyebrow",
							children: "Your kitchen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 mm-title",
							children: "Your pantry."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[14px] leading-relaxed text-[#A1A1AA]",
							children: "Everything you have, ready for something delicious."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/scan",
					search: { mode: "ingredients" },
					"aria-label": "Scan ingredients",
					className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white transition-colors hover:bg-[#1F1F1F]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
						className: "h-[19px] w-[19px]",
						strokeWidth: 1.75
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[22px] font-semibold tracking-[-0.02em]",
					children: items.length
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13px] text-[#71717A]",
					children: items.length === 1 ? "ingredient on hand" : "ingredients on hand"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					add();
				},
				className: "mt-5 grid grid-cols-[minmax(0,1fr)_84px_auto] gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Ingredient",
						placeholder: "Add an ingredient",
						value: name,
						maxLength: 120,
						onChange: (e) => setName(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Quantity",
						placeholder: "Qty",
						value: quantity,
						maxLength: 60,
						onChange: (e) => setQuantity(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						"aria-label": "Add ingredient",
						disabled: busy || !name.trim(),
						className: "h-12 w-12 px-0",
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-[18px] w-[18px] animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
							className: "h-[18px] w-[18px]",
							strokeWidth: 2
						})
					})
				]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					"aria-hidden": true,
					className: "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717A]",
					strokeWidth: 1.75
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					"aria-label": "Search your pantry",
					placeholder: "Search your pantry",
					value: filter,
					onChange: (e) => setFilter(e.target.value),
					className: "pl-11"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					"aria-busy": "true",
					children: [
						0,
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-skeleton h-16 w-full" }, i))
				}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mm-empty",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[15px] font-medium",
							children: "We couldn't load your pantry"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-[#A1A1AA]",
							children: "Check your connection and try again — nothing was lost."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							className: "mt-5",
							onClick: () => void client.invalidateQueries({ queryKey: ["pantry"] }),
							children: "Try again"
						})
					]
				}) : !items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mm-empty",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex h-14 w-14 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#A1A1AA]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refrigerator, {
								className: "h-6 w-6",
								strokeWidth: 1.5
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 text-[17px] font-medium",
							children: "Your pantry is waiting."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 max-w-xs text-[13px] leading-relaxed text-[#A1A1AA]",
							children: "Add ingredients or scan your kitchen to get started."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "secondary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/scan",
									search: { mode: "ingredients" },
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {
										className: "mr-2 h-[17px] w-[17px]",
										strokeWidth: 1.75
									}), " Scan ingredients"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/list",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, {
										className: "mr-2 h-[17px] w-[17px]",
										strokeWidth: 1.75
									}), " Shopping list"]
								})
							})]
						})
					]
				}) : !visible.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mm-empty",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[15px] font-medium",
							children: [
								"No match for “",
								filter.trim(),
								"”"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[13px] text-[#A1A1AA]",
							children: "Try a different word."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "mt-4",
							onClick: () => setFilter(""),
							children: "Clear search"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "group flex items-center gap-3 rounded-[14px] border border-[#1E1E1E] bg-[#141414] px-4 py-3.5 transition-colors hover:border-[#262626]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[15px] font-medium capitalize text-white",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[12px] text-[#71717A]",
								children: item.quantity || "No quantity set"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Remove ${item.name}`,
							disabled: removing === item.id,
							onClick: () => void remove(item.id),
							className: "flex h-10 w-10 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-[#1F1F1F] hover:text-[#F87171] disabled:opacity-50",
							children: removing === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-[17px] w-[17px] animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "h-[17px] w-[17px]",
								strokeWidth: 1.75
							})
						})]
					}, item.id))
				})
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-[18px] border border-[#1E1E1E] bg-[#111111] p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-[16px] font-medium",
						children: "Cook from what you have"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-[13px] leading-relaxed text-[#A1A1AA]",
						children: "Mia will build a recipe around your pantry and tell you exactly what's still missing."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4 w-full",
						disabled: !items.length || generating,
						onClick: () => void cook(),
						children: generating ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-[17px] w-[17px] animate-spin" }), " Building your recipe…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefHat, {
							className: "mr-2 h-[17px] w-[17px]",
							strokeWidth: 1.75
						}), " Find recipes with these ingredients"] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/list",
						className: "mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#A1A1AA] transition-colors hover:text-white",
						children: ["View shopping list ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
					})
				]
			})
		]
	});
}
//#endregion
export { PantryPage as component };
