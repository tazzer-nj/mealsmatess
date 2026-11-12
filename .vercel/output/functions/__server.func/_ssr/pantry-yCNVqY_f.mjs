import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as Camera, I as Plus, It as ChefHat, P as Refrigerator, h as Trash2, nt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { r as myPantryQuery } from "./queries-v7vmnG2D.mjs";
import { t as generateRecipe } from "./ai.functions-ClgZvg8e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pantry-yCNVqY_f.js
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "w-full flex-1 px-5 py-8 sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl",
						children: "Your pantry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [items.length, " ingredients, endless possibilities."]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "icon",
					className: "size-11 rounded-full",
					title: "Scan ingredients",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/scan",
						search: { mode: "ingredients" },
						"aria-label": "Scan ingredients",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					add();
				},
				className: "mt-8 grid grid-cols-[minmax(0,1fr)_80px_auto] gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Ingredient",
						placeholder: "Add an ingredient",
						value: name,
						maxLength: 120,
						onChange: (e) => setName(e.target.value),
						className: "h-11",
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						"aria-label": "Quantity",
						placeholder: "Qty",
						value: quantity,
						maxLength: 60,
						onChange: (e) => setQuantity(e.target.value),
						className: "h-11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "icon",
						className: "size-11 rounded-full",
						"aria-label": "Add ingredient",
						disabled: busy || !name.trim(),
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-12 text-center text-muted-foreground",
					children: "Loading ingredients…"
				}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Couldn't load your pantry." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => client.invalidateQueries({ queryKey: ["pantry"] }),
						children: "Try again"
					})]
				}) : !items.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Refrigerator, { className: "mx-auto size-10 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-4 text-xl",
							children: "A fresh start"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Your pantry is empty."
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "break-words font-medium",
								children: item.name
							}), item.quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: item.quantity
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-11 rounded-full",
							"aria-label": `Remove ${item.name}`,
							disabled: removing === item.id,
							onClick: () => remove(item.id),
							children: removing === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
						})]
					}, item.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-8 h-12 w-full rounded-full",
				disabled: !items.length || generating,
				onClick: cook,
				children: [generating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChefHat, {}), " Find a recipe"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				variant: "ghost",
				className: "mt-3 h-11 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/list",
					children: "Shopping list"
				})
			})
		]
	});
}
//#endregion
export { PantryPage as component };
