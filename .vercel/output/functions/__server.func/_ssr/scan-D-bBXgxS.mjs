import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Bt as Camera, Ht as CalendarDays, I as Plus, a as Utensils, ht as Flame, nt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, t as Select } from "./select-CtS-l6xr.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { i as scanKitchen, r as scanDish } from "./ai.functions-ClgZvg8e.mjs";
import { t as Route } from "./scan-CejFJZoC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-D-bBXgxS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MEAL_TYPES = [
	"Breakfast",
	"Lunch",
	"Dinner",
	"Snack"
];
function fileToDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
/** Downscale to keep uploads fast on mobile networks. */
async function compressImage(dataUrl, max = 1024) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, max / Math.max(img.width, img.height));
			if (scale === 1) return resolve(dataUrl);
			const c = document.createElement("canvas");
			c.width = Math.round(img.width * scale);
			c.height = Math.round(img.height * scale);
			c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
			resolve(c.toDataURL("image/jpeg", .85));
		};
		img.onerror = () => resolve(dataUrl);
		img.src = dataUrl;
	});
}
function isoLocal(d) {
	const x = new Date(d);
	x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
	return x.toISOString().slice(0, 10);
}
function ScanPage() {
	const { user, loading } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const inputRef = (0, import_react.useRef)(null);
	const search = Route.useSearch();
	const [mode, setMode] = (0, import_react.useState)(search.mode ?? "dish");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [items, setItems] = (0, import_react.useState)(null);
	const [dish, setDish] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const days = (0, import_react.useMemo)(() => Array.from({ length: 7 }, (_, i) => {
		const d = /* @__PURE__ */ new Date();
		d.setDate(d.getDate() + i);
		return d;
	}), []);
	const [planDate, setPlanDate] = (0, import_react.useState)(() => isoLocal(/* @__PURE__ */ new Date()));
	const [mealType, setMealType] = (0, import_react.useState)("Lunch");
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
	function reset() {
		setItems(null);
		setDish(null);
		setPreview(null);
		if (inputRef.current) inputRef.current.value = "";
	}
	async function handleFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		setBusy(true);
		setItems(null);
		setDish(null);
		try {
			const dataUrl = await compressImage(await fileToDataUrl(file));
			setPreview(dataUrl);
			if (mode === "dish") {
				const found = await scanDish({ data: { imageDataUrl: dataUrl } });
				if (!found.is_food) {
					toast.info("That doesn't look like a dish", { description: "Try a clear photo of a plated meal." });
					setPreview(null);
					return;
				}
				setDish(found);
				if (found.meal_type && MEAL_TYPES.includes(found.meal_type)) setMealType(found.meal_type);
			} else {
				const found = await scanKitchen({ data: { imageDataUrl: dataUrl } });
				setItems(found);
				if (found.length === 0) toast.info("Didn't spot any ingredients", { description: "Try a clearer, closer photo." });
			}
		} catch (err) {
			toast.error("Couldn't scan that photo", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setBusy(false);
		}
	}
	async function saveDishToPlanner() {
		if (!dish || !user || saving) return;
		setSaving(true);
		try {
			const { error: planErr } = await firebaseData.from("meal_plans").insert({
				user_id: user.id,
				plan_date: planDate,
				meal_type: mealType,
				custom_name: dish.name
			});
			if (planErr) throw planErr;
			const { error: logErr } = await firebaseData.from("nutrition_logs").insert({
				user_id: user.id,
				name: dish.name,
				meal_type: mealType,
				logged_at: (/* @__PURE__ */ new Date(`${planDate}T12:00:00`)).toISOString(),
				calories: dish.calories ?? null,
				protein_g: dish.protein_g ?? null,
				carbs_g: dish.carbs_g ?? null,
				fat_g: dish.fat_g ?? null,
				servings: 1
			});
			if (logErr) throw logErr;
			queryClient.invalidateQueries({ queryKey: ["planner"] });
			toast.success(`${dish.name} added to ${mealType}`, {
				description: `${dish.calories ?? "–"} kcal logged`,
				action: {
					label: "Open planner",
					onClick: () => navigate({ to: "/planner" })
				}
			});
			reset();
		} catch (err) {
			toast.error("Couldn't save to planner", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setSaving(false);
		}
	}
	async function addAllToPantry() {
		if (!items || !user || saving) return;
		setSaving(true);
		try {
			const { error } = await firebaseData.from("pantry_items").insert(items.map((i) => ({
				user_id: user.id,
				name: i.name,
				quantity: i.quantity ?? null,
				category: i.category ?? null,
				source: "scan"
			})));
			if (error) throw error;
			queryClient.invalidateQueries({ queryKey: ["pantry"] });
			toast.success(`Added ${items.length} item${items.length === 1 ? "" : "s"} to your pantry`);
			reset();
		} catch (err) {
			toast.error("Couldn't save to pantry", { description: err instanceof Error ? err.message : void 0 });
		} finally {
			setSaving(false);
		}
	}
	const macros = dish ? [
		{
			label: "Protein",
			value: dish.protein_g,
			unit: "g"
		},
		{
			label: "Carbs",
			value: dish.carbs_g,
			unit: "g"
		},
		{
			label: "Fat",
			value: dish.fat_g,
			unit: "g"
		},
		{
			label: "Fibre",
			value: dish.fiber_g,
			unit: "g"
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-background",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-tight",
					children: "Food Scanner"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Point your camera at a dish — we'll name it, count the nutrition, and plan it."
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-sm",
				children: [{
					id: "dish",
					label: "Identify dish",
					icon: Utensils
				}, {
					id: "ingredients",
					label: "Log ingredients",
					icon: Camera
				}].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setMode(m.id);
						reset();
					},
					className: `flex items-center justify-center gap-2 rounded-full px-3 py-2 font-medium transition-colors ${mode === m.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m.icon, { className: "h-4 w-4" }), m.label]
				}, m.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: "image/*",
				capture: "environment",
				className: "hidden",
				onChange: handleFile
			}),
			!preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => inputRef.current?.click(),
				className: "mt-6 flex w-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card py-16 text-center transition-colors hover:bg-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-16 w-16 items-center justify-center rounded-full bg-ink text-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Tap to scan now"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-xs text-sm text-muted-foreground",
						children: mode === "dish" ? "Snap a plated meal to identify it and get calories and macros." : "Take or upload a photo of your ingredients or groceries."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-hidden rounded-3xl border border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: preview,
					alt: "Scanned food",
					className: "max-h-64 w-full object-cover"
				})
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-center gap-2 text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), mode === "dish" ? "Identifying your dish…" : "Identifying ingredients…"]
			}),
			dish && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-3xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: dish.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: [dish.cuisine, dish.portion].filter(Boolean).join(" · ")
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium",
							children: [Math.round(dish.confidence * 100), "% match"]
						})]
					}),
					dish.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: dish.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "h-6 w-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-2xl leading-none",
							children: dish.calories ?? "–"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs opacity-80",
							children: "kcal per portion"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "mt-3 grid grid-cols-4 gap-2",
						children: macros.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl bg-muted px-2 py-3 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[11px] uppercase tracking-wide text-muted-foreground",
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-display text-lg",
								children: [m.value ?? "–", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-normal",
									children: m.value != null ? m.unit : ""
								})]
							})]
						}, m.label))
					}),
					dish.ingredients.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 flex flex-wrap gap-2",
						children: dish.ingredients.map((ing, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full border border-border px-3 py-1 text-xs",
							children: ing
						}, `${ing}-${i}`))
					}),
					dish.health_note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: dish.health_note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mb-2 flex items-center gap-2 text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4" }), " Save to planner"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: planDate,
									onValueChange: setPlanDate,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-40",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: days.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: isoLocal(d),
										children: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString(void 0, {
											weekday: "short",
											day: "numeric",
											month: "short"
										})
									}, isoLocal(d))) })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: mealType,
									onValueChange: setMealType,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-32",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MEAL_TYPES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: m,
										children: m
									}, m)) })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: saveDishToPlanner,
									disabled: saving,
									className: "rounded-full",
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), "Add to planner"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "rounded-full",
									onClick: reset,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 h-4 w-4" }), "Scan again"]
								})]
							})
						]
					})
				]
			}),
			items && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-xl",
						children: [
							"Found ",
							items.length,
							" ingredients"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex flex-wrap gap-2",
						children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-full border border-border bg-card px-3 py-1.5 text-sm",
							children: [item.name, item.quantity ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [" · ", item.quantity]
							}) : null]
						}, `${item.name}-${i}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: addAllToPantry,
							disabled: saving,
							className: "rounded-full",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), "Add all to pantry"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "rounded-full",
							onClick: reset,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 h-4 w-4" }), "Scan again"]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ScanPage as component };
