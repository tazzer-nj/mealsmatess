import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { B as Pencil, I as RefreshCw, L as Plus, dt as ImagePlus, h as Trash2, rt as LoaderCircle, y as Store } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as CONSUMER_URL } from "./hub-surface-DqCmg7ui.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as useServerFn } from "./useServerFn-CrZF2pjq.mjs";
import { i as NEXT_STATUS, l as RESTAURANT_IMAGE_TYPES, o as ORDER_STATUS_LABEL } from "./restaurants.schemas-DO_5wjxM.mjs";
import { d as uploadRestaurantMedia, i as listRestaurantOrders, l as updateMyRestaurant, n as getMyRestaurant, r as getRestaurantStats, s as saveMenuItem, t as deleteMenuItem, u as updateOrderStatus } from "./restaurants.functions-B6Ld_8Bw.mjs";
import { o as money } from "./bits-CMPYjCg6.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-CwLzEEob.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as usePartnerOrdersRealtime } from "./marketplace.realtime-B-w0rbk5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/partner.dashboard-_SlkIkuG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RestaurantImageUpload({ restaurantId, kind, label, value, onUploaded, onBusyChange }) {
	const id = (0, import_react.useId)();
	const upload = useServerFn(uploadRestaurantMedia);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: id,
				children: label
			}),
			value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: value,
				alt: label,
				className: "h-28 w-full rounded-xl bg-muted object-cover",
				loading: "lazy"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-20 place-items-center rounded-xl border border-dashed border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
					className: "size-6 text-muted-foreground",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id,
				type: "file",
				accept: RESTAURANT_IMAGE_TYPES.join(","),
				disabled: busy,
				"aria-describedby": `${id}-hint`,
				onChange: async (event) => {
					const file = event.currentTarget.files?.[0];
					event.currentTarget.value = "";
					if (!file || busy) return;
					if (!RESTAURANT_IMAGE_TYPES.some((type) => type === file.type) || file.size > 2097152) {
						toast.error("Choose a JPEG, PNG or WebP image smaller than 2MB.");
						return;
					}
					setBusy(true);
					onBusyChange?.(true);
					try {
						const base64 = await new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onload = () => resolve(String(reader.result));
							reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read the image."));
							reader.readAsDataURL(file);
						});
						onUploaded((await upload({ data: {
							restaurantId,
							kind,
							fileName: file.name,
							contentType: file.type,
							base64
						} })).url);
						toast.success("Photo uploaded");
					} catch (error) {
						toast.error(error instanceof Error ? error.message : "Could not upload the photo.");
					} finally {
						setBusy(false);
						onBusyChange?.(false);
					}
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: `${id}-hint`,
				className: "text-xs text-muted-foreground",
				children: "Public restaurant photo · JPEG, PNG or WebP · up to 2MB"
			}),
			busy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "status",
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Uploading photo…"]
			})
		]
	});
}
function RestaurantSettings({ restaurant }) {
	const qc = useQueryClient();
	const update = useServerFn(updateMyRestaurant);
	const [form, setForm] = (0, import_react.useState)(() => Object.fromEntries([
		"name",
		"description",
		"cuisine",
		"phone",
		"email",
		"address"
	].map((key) => [key, String(restaurant[key] ?? "")])));
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function save(event) {
		event.preventDefault();
		if (busy) return;
		setBusy(true);
		try {
			await update({ data: {
				restaurantId: restaurant.id,
				...form
			} });
			await qc.invalidateQueries({ queryKey: ["partner", "mine"] });
			toast.success("Restaurant details saved");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not save restaurant details.");
		} finally {
			setBusy(false);
		}
	}
	const refresh = () => {
		qc.invalidateQueries({ queryKey: ["partner", "mine"] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Restaurant profile"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "These details and photos appear on your approved MealMate listing."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantImageUpload, {
					restaurantId: restaurant.id,
					kind: "logo",
					label: "Restaurant logo",
					value: restaurant.logo_url,
					onUploaded: refresh
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantImageUpload, {
					restaurantId: restaurant.id,
					kind: "cover",
					label: "Cover photo",
					value: restaurant.cover_image_url,
					onUploaded: refresh
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: save,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							"name",
							"cuisine",
							"phone",
							"email",
							"address"
						].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: key === "address" ? "space-y-2 sm:col-span-2" : "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `restaurant-${key}`,
								className: "capitalize",
								children: key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: `restaurant-${key}`,
								value: form[key],
								required: key === "name" || key === "email",
								type: key === "email" ? "email" : "text",
								onChange: (e) => setForm((prev) => ({
									...prev,
									[key]: e.target.value
								}))
							})]
						}, key))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "restaurant-description",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "restaurant-description",
							value: form.description,
							onChange: (e) => setForm((prev) => ({
								...prev,
								description: e.target.value
							}))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						className: "rounded-full",
						children: busy ? "Saving…" : "Save restaurant details"
					})
				]
			})
		]
	});
}
var emptyItem = {
	name: "",
	description: "",
	price: "",
	category: "",
	is_available: true,
	image_url: ""
};
function PartnerDashboard() {
	const { user, loading } = useSession();
	const qc = useQueryClient();
	const fetchMine = useServerFn(getMyRestaurant);
	const mine = useQuery({
		queryKey: [
			"partner",
			"mine",
			user?.id
		],
		enabled: !!user,
		queryFn: () => fetchMine({ data: void 0 })
	});
	if (loading || user && mine.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-full max-w-3xl space-y-4 px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-56 rounded-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 rounded-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-3xl" })
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "Sign in to your partner account",
		body: "Restaurant owners sign in with the same MealMate account used to apply.",
		cta: {
			to: "/auth",
			label: "Sign in"
		}
	});
	if (mine.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Could not load your restaurant." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => mine.refetch(),
			className: "mt-4",
			children: "Try again"
		})]
	});
	const restaurant = mine.data?.restaurant;
	if (!restaurant) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "No restaurant yet",
		body: "Apply to partner with MealMate and your dashboard unlocks as soon as we approve you.",
		cta: {
			to: "/partner",
			label: "Apply now"
		}
	});
	if (restaurant.approval_status !== "approved") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: `Application ${restaurant.approval_status.replace("_", " ")}`,
		body: "Your dashboard opens when your restaurant is approved. Contact support if you need help with your application.",
		cta: {
			to: "/support",
			label: "Contact support"
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "page-enter mx-auto w-full max-w-3xl px-4 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Partner dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl",
					children: restaurant.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AcceptingToggle, {
					restaurantId: restaurant.id,
					value: restaurant.is_accepting_orders,
					onDone: () => qc.invalidateQueries({ queryKey: ["partner", "mine"] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatsRow, {
				restaurantId: restaurant.id,
				currency: restaurant.currency
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "orders",
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "w-full rounded-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "orders",
								className: "flex-1 rounded-full",
								children: "Orders"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "menu",
								className: "flex-1 rounded-full",
								children: "Menu"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "settings",
								className: "flex-1 rounded-full",
								children: "Settings"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "orders",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersPanel, {
							restaurantId: restaurant.id,
							currency: restaurant.currency
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "menu",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuPanel, {
							restaurantId: restaurant.id,
							currency: restaurant.currency,
							items: mine.data?.menu ?? []
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "settings",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantSettings, { restaurant }, restaurant.id)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-center text-xs text-muted-foreground",
				children: [
					"Your live customer page:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `${CONSUMER_URL}/restaurant/${encodeURIComponent(String(restaurant["slug"] ?? ""))}`,
						className: "underline",
						children: "view in MealMate Consumer"
					})
				]
			})
		]
	});
}
function Empty({ title, body, cta }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-10 w-10 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "rounded-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: cta.to,
					children: cta.label
				})
			})
		]
	});
}
function AcceptingToggle({ restaurantId, value, onDone }) {
	const update = useServerFn(updateMyRestaurant);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "md3-surface flex items-center gap-3 rounded-full border border-border/60 bg-card px-4 py-2 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: value ? "Accepting orders" : "Paused"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked: value,
			disabled: busy,
			onCheckedChange: async (checked) => {
				setBusy(true);
				try {
					await update({ data: {
						restaurantId,
						is_accepting_orders: checked
					} });
					toast.success(checked ? "You're open for orders" : "Orders paused");
					onDone();
				} catch (e) {
					toast.error(e instanceof Error ? e.message : "Could not update");
				} finally {
					setBusy(false);
				}
			}
		})]
	});
}
function StatsRow({ restaurantId, currency }) {
	const fetchStats = useServerFn(getRestaurantStats);
	const { data } = useQuery({
		queryKey: [
			"partner",
			"stats",
			restaurantId
		],
		queryFn: () => fetchStats({ data: { restaurantId } })
	});
	const cards = [
		{
			label: "Active orders",
			value: data ? String(data.active) : "—"
		},
		{
			label: "Orders (30d)",
			value: data ? String(data.orders30d) : "—"
		},
		{
			label: "Revenue (30d)",
			value: data ? money(data.revenue30d, currency) : "—"
		},
		{
			label: "Avg order",
			value: data ? money(data.avgOrder, currency) : "—"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4",
		children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "md3-surface rounded-2xl border border-border/60 bg-card p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-wide text-muted-foreground",
				children: c.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-lg font-semibold",
				children: c.value
			})]
		}, c.label))
	});
}
function OrdersPanel({ restaurantId, currency }) {
	const qc = useQueryClient();
	const listOrders = useServerFn(listRestaurantOrders);
	const setStatus = useServerFn(updateOrderStatus);
	const [scope, setScope] = (0, import_react.useState)("active");
	usePartnerOrdersRealtime(restaurantId);
	const { data, isLoading, isFetching, isError, refetch } = useQuery({
		queryKey: [
			"partner",
			"orders",
			restaurantId,
			scope
		],
		queryFn: () => listOrders({ data: {
			restaurantId,
			scope
		} }),
		refetchInterval: scope === "active" ? 2e4 : false
	});
	const move = useMutation({
		mutationFn: (v) => setStatus({ data: v }),
		onSuccess: (_r, v) => {
			toast.success(`Order marked ${ORDER_STATUS_LABEL[v.status].toLowerCase()}`);
			qc.invalidateQueries({ queryKey: [
				"partner",
				"orders",
				restaurantId
			] });
			qc.invalidateQueries({ queryKey: [
				"partner",
				"stats",
				restaurantId
			] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update order")
	});
	const orders = data ?? [];
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Could not load orders." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => refetch(),
			className: "mt-3",
			children: "Try again"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scope === "active" ? "default" : "outline",
					className: "rounded-full",
					onClick: () => setScope("active"),
					children: "Active"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: scope === "completed" ? "default" : "outline",
					className: "rounded-full",
					onClick: () => setScope("completed"),
					children: "History"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "ml-auto rounded-full",
					onClick: () => refetch(),
					disabled: isFetching,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${isFetching ? "animate-spin" : ""}` })
				})
			]
		}), isLoading ? [0, 1].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 rounded-3xl" }, i)) : orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "md3-surface rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
			children: scope === "active" ? "No live orders right now." : "No past orders yet."
		}) : orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "md3-surface rounded-3xl border border-border/60 bg-card p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm font-semibold",
						children: ["#", o.id.slice(0, 8)]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: new Date(o.placed_at).toLocaleString()
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: o.status === "cancelled" ? "destructive" : "secondary",
						className: "rounded-full",
						children: ORDER_STATUS_LABEL[o.status]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-1 text-sm",
					children: o.order_items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 truncate",
							children: [
								it.quantity,
								"× ",
								it.name,
								it.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [" — ", it.notes]
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-muted-foreground",
							children: money(Number(it.unit_price) * it.quantity, currency)
						})]
					}, it.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex justify-between border-t border-border/60 pt-3 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(o.total, currency) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 space-y-0.5 text-xs text-muted-foreground",
					children: [
						o.delivery_address && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Address: ", o.delivery_address] }),
						o.contact_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Phone: ", o.contact_phone] }),
						o.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Notes: ", o.notes] })
					]
				}),
				NEXT_STATUS[o.status].length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: NEXT_STATUS[o.status].map((next) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: next === "cancelled" ? "outline" : "default",
						className: "rounded-full",
						disabled: move.isPending,
						onClick: () => move.mutate({
							orderId: o.id,
							status: next
						}),
						children: next === "cancelled" ? "Cancel" : `Mark ${ORDER_STATUS_LABEL[next].toLowerCase()}`
					}, next))
				})
			]
		}, o.id))]
	});
}
function MenuPanel({ restaurantId, currency, items }) {
	const qc = useQueryClient();
	const save = useServerFn(saveMenuItem);
	const remove = useServerFn(deleteMenuItem);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(emptyItem);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const it of items) {
			const key = it.category?.trim() || "Menu";
			map.set(key, [...map.get(key) ?? [], it]);
		}
		return [...map.entries()];
	}, [items]);
	function openNew() {
		setEditing(null);
		setForm(emptyItem);
		setOpen(true);
	}
	function openEdit(item) {
		setEditing(item);
		setForm({
			name: item.name,
			description: item.description ?? "",
			price: String(item.price ?? ""),
			category: item.category ?? "",
			is_available: item.is_available,
			image_url: item.image_url ?? ""
		});
		setOpen(true);
	}
	async function refresh() {
		await qc.invalidateQueries({ queryKey: ["partner", "mine"] });
	}
	async function submit(e) {
		e.preventDefault();
		if (busy || uploading) return;
		const price = Number(form.price);
		if (!Number.isFinite(price) || price < 0) {
			toast.error("Enter a valid price");
			return;
		}
		setBusy(true);
		try {
			await save({ data: {
				...editing ? { id: editing.id } : {},
				restaurantId,
				name: form.name.trim(),
				price,
				is_available: form.is_available,
				image_url: form.image_url || null,
				sort_order: editing?.sort_order ?? items.length,
				...form.description.trim() ? { description: form.description.trim() } : {},
				...form.category.trim() ? { category: form.category.trim() } : {}
			} });
			toast.success(editing ? "Dish updated" : "Dish added");
			setOpen(false);
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save the dish");
		} finally {
			setBusy(false);
		}
	}
	async function destroy(item) {
		if (!window.confirm(`Remove "${item.name}" from your menu?`)) return;
		try {
			await remove({ data: { id: item.id } });
			toast.success("Dish removed");
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not remove the dish");
		}
	}
	async function toggleAvailable(item, checked) {
		try {
			await save({ data: {
				id: item.id,
				restaurantId,
				name: item.name,
				price: Number(item.price),
				is_available: checked,
				image_url: item.image_url,
				sort_order: item.sort_order,
				...item.description ? { description: item.description } : {},
				...item.category ? { category: item.category } : {}
			} });
			await refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not update availability");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openNew,
				className: "w-full rounded-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add dish"]
			}),
			items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "md3-surface rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
				children: "Your menu is empty. Add your first dish so customers can order."
			}) : grouped.map(([category, rows]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
				children: category
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "md3-surface overflow-hidden rounded-3xl border border-border/60 bg-card",
				children: rows.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: `flex items-center gap-3 p-4 ${i > 0 ? "border-t border-border/60" : ""}`,
					children: [
						item.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.image_url,
							alt: "",
							loading: "lazy",
							className: "h-12 w-12 shrink-0 rounded-lg object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: item.name
								}),
								item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: item.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-sm font-semibold",
									children: money(item.price, currency)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: item.is_available,
							"aria-label": `${item.name} available`,
							onCheckedChange: (c) => toggleAvailable(item, c)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: () => openEdit(item),
							"aria-label": "Edit dish",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "ghost",
							onClick: () => destroy(item),
							"aria-label": "Delete dish",
							className: "text-destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
						})
					]
				}, item.id))
			})] }, category)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: (next) => {
					if (!busy && !uploading) setOpen(next);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90dvh] overflow-y-auto rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "Edit dish" : "Add dish" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "dish-name",
									children: "Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "dish-name",
									required: true,
									value: form.name,
									onChange: (e) => setForm((f) => ({
										...f,
										name: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										htmlFor: "dish-price",
										children: [
											"Price (",
											currency,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "dish-price",
										required: true,
										inputMode: "decimal",
										value: form.price,
										onChange: (e) => setForm((f) => ({
											...f,
											price: e.target.value
										}))
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "dish-category",
										children: "Category"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "dish-category",
										placeholder: "e.g. Mains",
										value: form.category,
										onChange: (e) => setForm((f) => ({
											...f,
											category: e.target.value
										}))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "dish-desc",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "dish-desc",
									rows: 3,
									value: form.description,
									onChange: (e) => setForm((f) => ({
										...f,
										description: e.target.value
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantImageUpload, {
								restaurantId,
								kind: "menu-item",
								label: "Dish photo",
								value: form.image_url,
								onUploaded: (url) => setForm((prev) => ({
									...prev,
									image_url: url
								})),
								onBusyChange: setUploading
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 text-sm",
								children: ["Available to order", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: form.is_available,
									onCheckedChange: (c) => setForm((f) => ({
										...f,
										is_available: c
									}))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: busy || uploading,
								className: "w-full rounded-full",
								children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), editing ? "Save changes" : "Add dish"]
							}) })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { PartnerDashboard as component };
