import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CheckboxIndicator, p as require_jsx_runtime, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { L as Plus, Vt as Check, h as Trash2, w as ShoppingCart } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { n as myGroceryQuery } from "./queries-v7vmnG2D.mjs";
import { t as awardXp } from "./xp.functions-CxtV_ELG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/list-b0tbn91B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
function ListPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: items } = useQuery({
		...myGroceryQuery(),
		enabled: !!user
	});
	const [name, setName] = (0, import_react.useState)("");
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
		return queryClient.invalidateQueries({ queryKey: ["grocery"] });
	}
	async function addItem(e) {
		e.preventDefault();
		if (!name.trim() || !user) return;
		await firebaseData.from("grocery_items").insert({
			user_id: user.id,
			name: name.trim()
		});
		setName("");
		refresh();
	}
	async function toggle(id, checked) {
		await firebaseData.from("grocery_items").update({ checked }).eq("id", id);
		refresh();
	}
	async function remove(id) {
		await firebaseData.from("grocery_items").delete().eq("id", id);
		refresh();
	}
	async function clearChecked() {
		const finished = checkedCount;
		await firebaseData.from("grocery_items").delete().eq("checked", true);
		refresh();
		if (finished > 0 && user) try {
			const res = await awardXp({ data: { action: "grocery_list_completed" } });
			if (res.awarded) {
				toast.success(`+${res.points} XP — grocery list done!`);
				queryClient.invalidateQueries({ queryKey: ["gamification"] });
			}
		} catch {}
	}
	const checkedCount = items?.filter((i) => i.checked).length ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Grocery list"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						items?.length ?? 0,
						" items · ",
						checkedCount,
						" checked"
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: addItem,
				className: "mt-6 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Add an item…",
					className: "h-11"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "h-11",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
				})]
			}),
			checkedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: clearChecked,
					children: "Clear checked"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: items === void 0 ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-4 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 flex-1 max-w-[60%]" })]
				}, i)) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground",
					children: "Your list is empty. Add items or save ingredients from a recipe."
				}) : items.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					style: { animationDelay: `${Math.min(idx, 8) * 30}ms` },
					className: "rise-in md3-surface flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
							checked: item.checked,
							onCheckedChange: (v) => toggle(item.id, v === true),
							"aria-label": `Mark ${item.name} as ${item.checked ? "not done" : "done"}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-sm ${item.checked ? "text-muted-foreground line-through" : ""}`,
								children: item.name
							}), item.quantity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-xs text-muted-foreground",
								children: item.quantity
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => remove(item.id),
							"aria-label": `Remove ${item.name}`,
							className: "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})
					]
				}, item.id))
			})
		]
	});
}
//#endregion
export { ListPage as component };
