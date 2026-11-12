import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Kt as CalendarDays, L as Plus, Wt as Camera, a as Utensils, dt as ImagePlus, n as X, rt as LoaderCircle, vt as Flame, x as Sparkles } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, t as Select } from "./select-CtS-l6xr.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { i as scanKitchen, r as scanDish } from "./ai.functions-ClgZvg8e.mjs";
import { t as Route } from "./scan-DjfdeTka.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scan-CXFN1WU7.js
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
	const [newItem, setNewItem] = (0, import_react.useState)("");
	const galleryRef = (0, import_react.useRef)(null);
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
		setNewItem("");
		if (inputRef.current) inputRef.current.value = "";
		if (galleryRef.current) galleryRef.current.value = "";
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
	async function addAllToPantry(options = {}) {
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
			if (options.thenFindRecipes) navigate({ to: "/pantry" });
			else reset();
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground",
					children: "Scan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl leading-tight tracking-tight",
					children: "Scan your food"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-md text-sm leading-relaxed text-muted-foreground",
					children: "Point your camera at a dish or at your ingredients. We'll identify them, count the nutrition and save them for you."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1 text-sm",
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
					className: `flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-medium transition-colors ${mode === m.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: galleryRef,
				type: "file",
				accept: "image/*",
				className: "hidden",
				onChange: handleFile
			}),
			!preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-7 w-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-base font-medium",
						children: "Scan with your camera"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground",
						children: mode === "dish" ? "Snap a plated meal to identify it and get calories and macros." : "Take or upload a photo of your ingredients or groceries."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto mt-6 flex max-w-xs flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "h-12 rounded-xl",
							onClick: () => inputRef.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 h-4 w-4" }), "Open camera"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							className: "h-12 rounded-xl",
							onClick: () => galleryRef.current?.click(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "mr-2 h-4 w-4" }), "Choose from gallery"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-muted-foreground",
						children: "We'll ask for camera access the first time you scan."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-6 overflow-hidden rounded-2xl border border-border bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: preview,
						alt: "Scanned food",
						className: "max-h-72 w-full object-cover"
					}),
					busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: mode === "dish" ? "Looking at your dish…" : "Looking at your ingredients…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px w-24 animate-pulse bg-foreground/60" })
						]
					}),
					!busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: reset,
						"aria-label": "Close",
						className: "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})
				]
			}),
			busy && !preview && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), "Preparing your photo…"]
			}),
			dish && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-2xl border border-border bg-card p-6",
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
						className: "mt-5 flex items-center gap-3 rounded-xl bg-primary px-4 py-4 text-primary-foreground",
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
							className: "rounded-xl border border-border bg-background px-2 py-3 text-center",
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
							className: "rounded-lg border border-border px-2.5 py-1 text-xs",
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
									className: "h-12 rounded-xl",
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), "Add to planner"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									className: "h-12 rounded-xl",
									onClick: reset,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "mr-2 h-4 w-4" }), "Scan again"]
								})]
							})
						]
					})
				]
			}),
			items && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-2xl border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-xl",
							children: [
								"Found ",
								items.length,
								" ingredients"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Review before saving"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border",
						children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: item.name
								}), item.quantity ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: item.quantity
								}) : null]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": `Remove ${item.name}`,
								onClick: () => setItems((prev) => (prev ?? []).filter((_, idx) => idx !== i)),
								className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})]
						}, `${item.name}-${i}`))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex gap-2",
						onSubmit: (e) => {
							e.preventDefault();
							const name = newItem.trim();
							if (!name) return;
							setItems((prev) => [...prev ?? [], { name }]);
							setNewItem("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: newItem,
							onChange: (e) => setNewItem(e.target.value),
							placeholder: "Add an ingredient",
							className: "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "secondary",
							className: "h-11 shrink-0 rounded-xl px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "h-12 w-full rounded-xl",
							disabled: saving || items.length === 0,
							onClick: () => addAllToPantry({ thenFindRecipes: true }),
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 h-4 w-4" }), "Find recipes with these ingredients"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "h-12 flex-1 rounded-xl",
								disabled: saving,
								onClick: () => addAllToPantry(),
								children: "Add to pantry"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								className: "h-12 flex-1 rounded-xl",
								onClick: reset,
								children: "Scan again"
							})]
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { ScanPage as component };
