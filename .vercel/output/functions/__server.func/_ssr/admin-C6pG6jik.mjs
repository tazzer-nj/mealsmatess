import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { A as Send, Ct as Database, D as ShieldCheck, I as Plus, Jt as Bell, St as DollarSign, Ut as CalendarClock, Y as Megaphone, a as Utensils, en as Activity, f as TriangleAlert, h as Trash2, j as Search, jt as CircleCheck, kt as CircleX, m as TrendingDown, nt as LoaderCircle, p as TrendingUp, q as MessageCircle, s as Users, st as Image, vt as Eye, wt as Crown, xt as Download, z as Pencil } from "../_libs/lucide-react.mjs";
import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { c as sendPasswordReset } from "./hub-surface-DqCmg7ui.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { a as objectType, i as numberType, n as booleanType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { c as publishAdminAnnouncement, i as listAdminAnnouncements, s as previewAnnouncementAudience, t as cancelAdminAnnouncement, u as saveAdminAnnouncement } from "./notifications.functions-DkR4bOgG.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as RecipeImageBackfillCard } from "./recipe-image-tools-Bh6QtubJ.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, r as SelectGroup, t as Select } from "./select-CtS-l6xr.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { n as adminUpsertFeatureFlag, r as listFeatureFlags, t as adminDeleteFeatureFlag } from "./feature-flags.functions-BguzsvVA.mjs";
import { a as YAxis, c as Line, d as Pie, f as Cell, h as Legend, i as LineChart, l as CartesianGrid, m as Tooltip, n as PieChart, o as XAxis, p as ResponsiveContainer, r as BarChart, s as Area, t as AreaChart, u as Bar } from "../_libs/recharts+[...].mjs";
import { n as subDays, r as format, t as subMonths } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C6pG6jik.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PALETTE = [
	"hsl(var(--primary))",
	"hsl(var(--accent))",
	"hsl(24 95% 53%)",
	"hsl(142 71% 45%)",
	"hsl(199 89% 48%)",
	"hsl(340 82% 52%)",
	"hsl(48 96% 53%)",
	"hsl(262 83% 58%)"
];
var Fallback = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "flex h-[240px] items-center justify-center",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
});
function AreaTrend$1({ data, dataKey, xKey = "date", color = PALETTE[0] }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fallback, {}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: 220,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: `g-${dataKey}`,
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: color,
							stopOpacity: .4
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: color,
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						stroke: "hsl(var(--border))"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: xKey,
						tick: { fontSize: 11 },
						stroke: "hsl(var(--muted-foreground))"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: { fontSize: 11 },
						stroke: "hsl(var(--muted-foreground))",
						width: 40
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
						background: "hsl(var(--popover))",
						border: "1px solid hsl(var(--border))",
						borderRadius: 12,
						fontSize: 12
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey,
						stroke: color,
						fill: `url(#g-${dataKey})`,
						strokeWidth: 2,
						animationDuration: 600
					})
				]
			})
		})
	});
}
function LineTrend$1({ data, dataKey, xKey = "date", color = PALETTE[1] }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 220,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: xKey,
					tick: { fontSize: 11 },
					stroke: "hsl(var(--muted-foreground))"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: { fontSize: 11 },
					stroke: "hsl(var(--muted-foreground))",
					width: 40
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "hsl(var(--popover))",
					border: "1px solid hsl(var(--border))",
					borderRadius: 12,
					fontSize: 12
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
					type: "monotone",
					dataKey,
					stroke: color,
					strokeWidth: 2,
					dot: false,
					animationDuration: 600
				})
			]
		})
	});
}
function BarBreakdown$1({ data, dataKey, xKey = "name" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 220,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					stroke: "hsl(var(--border))"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: xKey,
					tick: { fontSize: 11 },
					stroke: "hsl(var(--muted-foreground))"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: { fontSize: 11 },
					stroke: "hsl(var(--muted-foreground))",
					width: 40
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
					background: "hsl(var(--popover))",
					border: "1px solid hsl(var(--border))",
					borderRadius: 12,
					fontSize: 12
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey,
					radius: [
						8,
						8,
						0,
						0
					],
					animationDuration: 600,
					children: data.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PALETTE[i % PALETTE.length] }, i))
				})
			]
		})
	});
}
function DonutBreakdown$1({ data, dataKey, nameKey = "name" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 220,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
				background: "hsl(var(--popover))",
				border: "1px solid hsl(var(--border))",
				borderRadius: 12,
				fontSize: 12
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey,
				nameKey,
				innerRadius: 50,
				outerRadius: 80,
				paddingAngle: 2,
				animationDuration: 600,
				children: data.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PALETTE[i % PALETTE.length] }, i))
			})
		] })
	});
}
createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("10a641dfa6186bd8d694a402cd2db1bb1aba27e22aa1da48db923d023be771ff"));
createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("eb5ac993c8f2f99caac2a9df1e1f1c9581b22ad281f925bc293e05d2a8a3b827"));
createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("840cb71512c551c8a5136239b241fbdeb6b5019bef7790ef8a708459a7c23b11"));
createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ code: stringType().min(4).max(16) }).parse(v)).handler(createSsrRpc("8769d67d525029ca41e5b0902a41efacd26d4925a460926ece13032b617db70d"));
createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ code: stringType().min(2).max(40) }).parse(v)).handler(createSsrRpc("e873178ef83b7ab30e9ca62af476c1d3f391a27daf0641f7fdb289d9b41edd50"));
var adminListSubscribers = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("bd0d44708ee674951da325f305446a716708e5e1d9f83ab3eec9b9bd13ad0325"));
createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("d09d86bf59b1abd7f57dafe2b67b0d8a9ae1a281c844e72d16946b809600ec95"));
var adminListPromos = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("b55de083da7fcc8ea1a39003aadbddde9e81c39dc5c28f31c01f68cf038454fc"));
var PromoInput = objectType({
	id: stringType().uuid().optional(),
	code: stringType().min(2).max(40),
	reward_kind: enumType([
		"percent_discount",
		"free_days",
		"free_month",
		"free_year",
		"lifetime"
	]),
	reward_value: numberType().int().min(0).max(1e5).default(0),
	max_redemptions: numberType().int().positive().nullable().optional(),
	expires_at: stringType().nullable().optional(),
	enabled: booleanType().default(true),
	notes: stringType().max(500).nullable().optional()
});
var adminSavePromo = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => PromoInput.parse(v)).handler(createSsrRpc("b1ca427078f80da466b82fc6563fc0a4eb8f9d38102fb1f3d7f52e5d736b2c6c"));
var adminDeletePromo = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ id: stringType().uuid() }).parse(v)).handler(createSsrRpc("770cd247435cec8a1d98a9d5ee4746e20b6114235ca7af63d1a5b31f831dbb5d"));
var adminGrantPremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	userId: stringType().uuid(),
	days: numberType().int().min(1).max(3650)
}).parse(v)).handler(createSsrRpc("f7d0eaff445b66345ee47401f4a146baa46162a5061de652da85ae6b9289d5aa"));
var adminRevokePremium = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ userId: stringType().uuid() }).parse(v)).handler(createSsrRpc("a6357198c849b3b994124e6afa517b66fd51a993f1f9a4db0dfba98e07f96e87"));
var adminIsAdmin = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("c1b620e24146eaf29191f9e8b089333a331bfc4c75d914d0e4f88c1e20c549e1"));
var CreateManagedRestaurantSchema = objectType({
	email: stringType().email(),
	name: stringType().trim().min(2).max(120),
	ownerName: stringType().trim().min(2).max(120)
});
var RestaurantIdSchema = objectType({ restaurantId: stringType().uuid() });
var listManagedRestaurants = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("ba6c08072634b78abdf8d139bb5a2a2c3d64eecde403ce17b167e01765503ec8"));
var launchManagedRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => RestaurantIdSchema.parse(value)).handler(createSsrRpc("c516fbfc83aa4c473aef3261efed7c6468f696e69887cb462e5efe27f0e85c32"));
var createManagedRestaurant = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => CreateManagedRestaurantSchema.parse(value)).handler(createSsrRpc("aae2e6d6e4f758acb0cb303583a33888da6ce3dac9ea60596ac7dd3fb94eeecf"));
var RangeInput = objectType({
	from: stringType(),
	to: stringType()
});
var getAdminAnalytics = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => RangeInput.parse(v)).handler(createSsrRpc("8cdecb504a406c2f10d271053b1d5cd02490c42b10fad70cf602df4574a0a34c"));
var adminListAuditLogs = createServerFn({ method: "GET" }).middleware([requireFirebaseAuth]).handler(createSsrRpc("213b1145b0606ba233a03ebceb79e49edaeb2a25fa092e75da984dff48d03aa3"));
var adminListUsers = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ search: stringType().optional() }).parse(v)).handler(createSsrRpc("18d0cfac92ac9dfa1fb728896a174135794ed23212f19aeabdf0022c81ed6766"));
var getAdminTelemetry = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => RangeInput.parse(v)).handler(createSsrRpc("9762357fbaafc77dec2af173dfde797958357fce06cb4f320f595d1e223b30a1"));
var categories = [
	{
		value: "recipes",
		label: "Recipes"
	},
	{
		value: "healthy_eating",
		label: "Healthy eating"
	},
	{
		value: "dining",
		label: "MealMate Dining"
	},
	{
		value: "mia",
		label: "Mia AI"
	},
	{
		value: "features",
		label: "New features"
	},
	{
		value: "general",
		label: "General update"
	}
];
var destinations = [
	{
		value: "/",
		label: "Home"
	},
	{
		value: "/recipes",
		label: "Recipes"
	},
	{
		value: "/restaurants",
		label: "Dining"
	},
	{
		value: "/chat",
		label: "Mia AI"
	},
	{
		value: "/planner",
		label: "Meal planner"
	},
	{
		value: "/profile",
		label: "Profile"
	}
];
var audienceOptions = [{
	value: "all_consumers",
	label: "All eligible Consumer users"
}, {
	value: "healthy_interest",
	label: "Healthy recipe interest"
}];
var emptyDraft = {
	title: "",
	body: "",
	imageUrl: null,
	category: "general",
	audience: "all_consumers",
	destination: "/",
	scheduledAt: null,
	status: "draft"
};
function statusLabel(status) {
	return status === "processing" ? "Sending in batches" : status.charAt(0).toUpperCase() + status.slice(1);
}
function displayDate(value) {
	if (typeof value !== "string" || !value) return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}
function dateTimeLocal(value) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? "" : (/* @__PURE__ */ new Date(date.getTime() - date.getTimezoneOffset() * 6e4)).toISOString().slice(0, 16);
}
function AnnouncementsTab() {
	const queryClient = useQueryClient();
	const [draft, setDraft] = (0, import_react.useState)(emptyDraft);
	const [scheduleLocal, setScheduleLocal] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const announcements = useQuery({
		queryKey: ["admin-announcements"],
		queryFn: async () => await listAdminAnnouncements(),
		refetchInterval: (query) => query.state.data?.some((item) => item.status === "processing") ? 15e3 : false
	});
	const audience = useQuery({
		queryKey: ["announcement-audience", draft.audience],
		queryFn: () => previewAnnouncementAudience({ data: { audience: draft.audience } }),
		staleTime: 3e4
	});
	const selectedCategory = (0, import_react.useMemo)(() => categories.find((item) => item.value === draft.category)?.label ?? "General update", [draft.category]);
	function update(key, value) {
		setDraft((current) => ({
			...current,
			[key]: value
		}));
	}
	function edit(item) {
		setDraft({
			id: String(item.id),
			title: String(item.title ?? ""),
			body: String(item.body ?? ""),
			imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
			category: item.category ?? "general",
			audience: item.audience ?? "all_consumers",
			destination: item.destination ?? "/",
			scheduledAt: typeof item.scheduleAt === "string" ? item.scheduleAt : null,
			status: item.status === "scheduled" ? "scheduled" : "draft"
		});
		setScheduleLocal(typeof item.scheduleAt === "string" ? dateTimeLocal(item.scheduleAt) : "");
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}
	async function save(status) {
		if (status === "scheduled" && !scheduleLocal) {
			toast.error("Choose a date and time before scheduling.");
			return null;
		}
		if (status === "scheduled" && new Date(scheduleLocal).getTime() <= Date.now()) {
			toast.error("Choose a future date and time.");
			return null;
		}
		setSaving(true);
		try {
			const result = await saveAdminAnnouncement({ data: {
				...draft,
				status,
				scheduledAt: status === "scheduled" ? new Date(scheduleLocal).toISOString() : null,
				imageUrl: draft.imageUrl || null
			} });
			setDraft({ ...emptyDraft });
			setScheduleLocal("");
			await queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
			toast.success(status === "scheduled" ? "Announcement scheduled." : "Draft saved.");
			return result;
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not save announcement.");
			return null;
		} finally {
			setSaving(false);
		}
	}
	async function publishNow(id) {
		setSaving(true);
		try {
			let announcementId = id;
			if (!announcementId) announcementId = (await saveAdminAnnouncement({ data: {
				...draft,
				status: "draft",
				scheduledAt: null,
				imageUrl: draft.imageUrl || null
			} })).id;
			const result = await publishAdminAnnouncement({ data: { id: announcementId } });
			setDraft({ ...emptyDraft });
			setScheduleLocal("");
			await queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
			toast.success(result.status === "processing" ? "Announcement is being sent in batches." : "Announcement published to eligible users.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not publish announcement.");
		} finally {
			setSaving(false);
		}
	}
	async function cancel(id) {
		try {
			if (!(await cancelAdminAnnouncement({ data: { id } })).cancelled) toast.error("This scheduled announcement can no longer be cancelled.");
			else toast.success("Scheduled announcement cancelled.");
			await queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not cancel announcement.");
		}
	}
	const rows = announcements.data ?? [];
	const canSubmit = draft.title.trim().length >= 2 && draft.body.trim().length >= 2 && !saving;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "flex flex-col gap-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-5 flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { "aria-hidden": "true" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl",
						children: "Announcement studio"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Draft, preview, schedule, or publish product updates to eligible recipients."
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 text-sm font-medium",
							htmlFor: "announcement-title",
							children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "announcement-title",
								value: draft.title,
								maxLength: 120,
								onChange: (event) => update("title", event.target.value),
								placeholder: "A useful MealMate update"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 text-sm font-medium",
							htmlFor: "announcement-message",
							children: [
								"Message",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "announcement-message",
									value: draft.body,
									maxLength: 2e3,
									rows: 4,
									onChange: (event) => update("body", event.target.value),
									placeholder: "Write a clear, helpful update for your audience."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-normal text-muted-foreground",
									children: [draft.body.length, "/2000 characters"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 text-sm font-medium",
							htmlFor: "announcement-image",
							children: [
								"Optional image URL",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "announcement-image",
									type: "url",
									inputMode: "url",
									value: draft.imageUrl ?? "",
									onChange: (event) => update("imageUrl", event.target.value || null),
									placeholder: "https://…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-normal text-muted-foreground",
									children: "Use an HTTPS image URL. The image appears in the preview and supported push notifications."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-2 text-sm font-medium",
								htmlFor: "announcement-category",
								children: ["Category", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.category,
									onValueChange: (value) => update("category", value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "announcement-category",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroup, { children: categories.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: category.value,
										children: category.label
									}, category.value)) }) })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "grid gap-2 text-sm font-medium",
								htmlFor: "announcement-destination",
								children: ["Destination", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.destination,
									onValueChange: (value) => update("destination", value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "announcement-destination",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroup, { children: destinations.map((destination) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: destination.value,
										children: destination.label
									}, destination.value)) }) })]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 text-sm font-medium",
							htmlFor: "announcement-audience",
							children: [
								"Recipients",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: draft.audience,
									onValueChange: (value) => update("audience", value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										id: "announcement-audience",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroup, { children: audienceOptions.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: option.value,
										children: option.label
									}, option.value)) }) })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-normal text-muted-foreground",
									children: audience.isLoading ? "Checking current eligible profiles…" : audience.isError ? "Could not read the current eligible profile count." : `${(audience.data?.count ?? 0).toLocaleString()} eligible profiles based on current records and update preferences.`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-2 text-sm font-medium",
							htmlFor: "announcement-schedule",
							children: ["Schedule for later (optional)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "announcement-schedule",
								type: "datetime-local",
								value: scheduleLocal,
								onChange: (event) => setScheduleLocal(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									onClick: () => void save("draft"),
									disabled: !canSubmit,
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
										className: "animate-spin",
										"data-icon": "inline-start"
									}) : null, "Save draft"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									onClick: () => void save("scheduled"),
									disabled: !canSubmit || !scheduleLocal,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, { "data-icon": "inline-start" }), "Schedule"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									onClick: () => void publishNow(),
									disabled: !canSubmit,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { "data-icon": "inline-start" }), "Publish now"]
								}),
								draft.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									onClick: () => {
										setDraft({ ...emptyDraft });
										setScheduleLocal("");
									},
									children: "Discard edits"
								})
							]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-card p-5 sm:p-6",
				"aria-labelledby": "announcement-history-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "announcement-history-heading",
						className: "font-display text-lg",
						children: "Announcement history"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Current delivery attempts and recorded activity; push acceptance is not a device delivery receipt."
					})] }), announcements.isFetching && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						"aria-label": "Refreshing history",
						className: "animate-spin text-muted-foreground"
					})]
				}), announcements.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Loading real announcement records…"
				}) : announcements.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground",
					children: "Could not load announcement history. Check the Firebase server configuration and admin access."
				}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground",
					children: "No announcements yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col divide-y divide-border",
					children: rows.map((item) => {
						const status = String(item.status ?? "draft");
						const editable = status === "draft" || status === "scheduled";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold",
											children: String(item.title ?? "Untitled")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: status === "published" ? "secondary" : status === "failed" ? "destructive" : "outline",
											children: statusLabel(status)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
										children: String(item.body ?? "")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted-foreground",
										children: [
											"Created ",
											displayDate(item.createdAt),
											status === "scheduled" ? ` · Scheduled ${displayDate(item.scheduleAt)}` : status === "published" ? ` · Published ${displayDate(item.publishedAt)}` : ""
										]
									}),
									status === "published" || status === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Number(item.recipientCount ?? 0).toLocaleString(), " in-app notifications stored"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Number(item.readCount ?? 0).toLocaleString(), " read"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Number(item.pushAcceptedTokens ?? 0).toLocaleString(), " push tokens accepted by FCM"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Number(item.pushAttemptedTokens ?? 0).toLocaleString(), " push attempts"] }),
											Number(item.pushFailedTokens ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Number(item.pushFailedTokens).toLocaleString(), " failed"] })
										]
									}) : null,
									status === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-destructive",
										children: String(item.lastError ?? "Processing failed.")
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start gap-2 sm:justify-end",
								children: [
									editable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										onClick: () => edit(item),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { "data-icon": "inline-start" }), "Edit"]
									}),
									(editable || status === "failed") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => void publishNow(String(item.id)),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { "data-icon": "inline-start" }), "Publish now"]
									}),
									status === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => void cancel(String(item.id)),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { "data-icon": "inline-start" }), "Cancel"]
									})
								]
							})]
						}, String(item.id));
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "flex flex-col gap-5",
			"aria-label": "Announcement preview",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { "aria-hidden": "true" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg",
								children: "Live preview"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: selectedCategory
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-sm rounded-2xl border border-border bg-background p-4 shadow-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { "aria-hidden": "true" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: "MealMate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground",
										children: ["Just now · ", selectedCategory]
									})]
								})]
							}),
							draft.imageUrl?.startsWith("https://") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: draft.imageUrl,
								alt: draft.title ? `Announcement image for ${draft.title}` : "Announcement preview",
								className: "mt-3 aspect-[16/9] w-full rounded-xl object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-semibold",
								children: draft.title || "Your announcement title"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 whitespace-pre-wrap text-sm text-muted-foreground",
								children: draft.body || "Your message will appear here as recipients see it."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 border-t border-border pt-3 text-xs text-muted-foreground",
								children: [
									"Opens",
									" ",
									destinations.find((destination) => destination.value === draft.destination)?.label ?? "Home"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground",
						children: "This preview reflects the current message and destination. Nothing is sent until you publish or schedule it."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Delivery notes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-2 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "In-app history is stored per recipient and remains available in their account." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Push is sent only to users who opted in and have a registered device." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Firebase acceptance is an attempt status, not proof the device displayed it." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Scheduled sends are processed in bounded batches by the protected Vercel cron route." })
					]
				})]
			})]
		})]
	});
}
function TelemetryTab({ range }) {
	const q = useQuery({
		queryKey: [
			"admin-telemetry",
			range.from,
			range.to
		],
		queryFn: () => getAdminTelemetry({ data: range }),
		staleTime: 6e4
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	const t = q.data;
	if (!t) return null;
	const kpis = [
		{
			label: "Events",
			value: t.totals.events.toLocaleString()
		},
		{
			label: "Success rate",
			value: `${t.totals.successRate}%`
		},
		{
			label: "Errors",
			value: t.totals.errors.toLocaleString()
		},
		{
			label: "Active users",
			value: t.totals.activeUsers.toLocaleString()
		},
		{
			label: "Avg latency",
			value: `${t.totals.avgLatencyMs} ms`
		},
		{
			label: "P95 latency",
			value: `${t.totals.p95LatencyMs} ms`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 md:grid-cols-6",
				children: kpis.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: k.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 font-display text-2xl",
						children: k.value
					})]
				}, k.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 font-medium",
						children: "Events per day"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend$1, {
						data: t.series.map((s) => ({
							date: s.date,
							value: s.count
						})),
						dataKey: "value",
						color: "hsl(var(--primary))"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 font-medium",
						children: "By kind"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutBreakdown$1, {
						data: t.events_by_kind,
						dataKey: "count",
						nameKey: "name"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-3 font-medium",
						children: "Top events"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarBreakdown$1, {
						data: t.events_by_name.slice(0, 10).map((e) => ({
							name: e.name,
							count: e.count
						})),
						dataKey: "count",
						xKey: "name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-left text-xs uppercase text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Event"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Count"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Errors"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2",
										children: "Avg latency"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: t.events_by_name.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 font-mono text-xs",
										children: e.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.count }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: e.errors }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [e.successRate, "%"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [e.avgLatencyMs, " ms"] })
								]
							}, e.name)) })]
						})
					})
				]
			})
		]
	});
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
var DiagnosticSchema = objectType({ test: enumType([
	"backend",
	"recipe",
	"mia",
	"gateway",
	"image",
	"database",
	"storage",
	"security"
]) });
var runAiDiagnostics = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((value) => DiagnosticSchema.parse(value)).handler(createSsrRpc("9d5e9f5ee81062614332b581a5d6fe6f3f78a0175deb109531e05bd7c06546f1"));
var tests = [
	{
		name: "backend",
		label: "Backend + provider config",
		description: "Authenticated server and selected model configuration",
		icon: Activity
	},
	{
		name: "recipe",
		label: "Structured recipe output",
		description: "Live recipe generation and schema validation",
		icon: CircleCheck
	},
	{
		name: "mia",
		label: "Mia food response",
		description: "Live food question through the assistant model",
		icon: MessageCircle
	},
	{
		name: "gateway",
		label: "AI Gateway",
		description: "Live text request using server-side provider credentials",
		icon: Activity
	},
	{
		name: "image",
		label: "Recipe image generation",
		description: "Live image model call; may use Gateway credits",
		icon: Image
	},
	{
		name: "database",
		label: "Database read + write",
		description: "Temporary user-scoped record, read back, then delete",
		icon: Database
	},
	{
		name: "storage",
		label: "Image storage + retrieval",
		description: "Temporary upload, signed retrieval, then cleanup",
		icon: Image
	},
	{
		name: "security",
		label: "Auth + rate limiting",
		description: "Admin authorization and repeat-request rejection",
		icon: ShieldCheck
	}
];
function AiDiagnosticsTab() {
	const [results, setResults] = (0, import_react.useState)({});
	const [busy, setBusy] = (0, import_react.useState)(null);
	async function run(test) {
		setBusy(test);
		try {
			const result = await runAiDiagnostics({ data: { test } });
			setResults((current) => ({
				...current,
				[test]: result
			}));
		} catch {
			setResults((current) => ({
				...current,
				[test]: {
					test,
					ok: false,
					detail: "The protected diagnostics request failed. Check authentication and server logs."
				}
			}));
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "ai-diagnostics-heading",
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
			id: "ai-diagnostics-heading",
			children: "MealMate AI diagnostics"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Admin-only live checks. Credentials are never displayed. Image generation can incur AI provider charges." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid gap-3 sm:grid-cols-2",
			children: tests.map(({ name, label, description, icon: Icon }) => {
				const result = results[name];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-col gap-3 rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									"aria-hidden": "true",
									className: "mt-0.5 size-4 shrink-0 text-muted-foreground"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-medium",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: description
									})]
								}),
								result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: result.ok ? "secondary" : "destructive",
									children: result.ok ? "Passed" : "Failed"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							size: "sm",
							className: "self-start",
							disabled: busy !== null,
							onClick: () => void run(name),
							"aria-label": `Run ${label} diagnostic`,
							children: [busy === name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								"aria-hidden": "true",
								className: "mr-2 size-4 animate-spin"
							}) : null, busy === name ? "Testing…" : "Run test"]
						}),
						result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							role: "status",
							"aria-live": "polite",
							className: "text-xs text-muted-foreground",
							children: [
								result.detail,
								result.provider ? ` Provider: ${result.provider}.` : "",
								result.model ? ` Model: ${result.model}.` : ""
							]
						})
					]
				}, name);
			})
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "flex items-start gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
				"aria-hidden": "true",
				className: "mt-0.5 size-4 shrink-0"
			}), "Database and storage tests create temporary records in your signed-in admin account and remove them immediately after verification."]
		})]
	});
}
function FlagsTab() {
	const qc = useQueryClient();
	const { data: flags, isLoading } = useQuery({
		queryKey: ["feature-flags-admin"],
		queryFn: () => listFeatureFlags()
	});
	const upsert = useMutation({
		mutationFn: (v) => adminUpsertFeatureFlag({ data: v }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["feature-flags-admin"] });
			qc.invalidateQueries({ queryKey: ["feature-flags"] });
		},
		onError: (e) => toast.error(e instanceof Error ? e.message : "Failed")
	});
	const del = useMutation({
		mutationFn: (key) => adminDeleteFeatureFlag({ data: { key } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["feature-flags-admin"] })
	});
	const [newKey, setNewKey] = (0, import_react.useState)("");
	const [newDesc, setNewDesc] = (0, import_react.useState)("");
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex justify-center py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border bg-card p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-medium",
				children: "New flag"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 md:grid-cols-[220px_1fr_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "flag_key",
						value: newKey,
						onChange: (e) => setNewKey(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Description",
						value: newDesc,
						onChange: (e) => setNewDesc(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: !newKey || upsert.isPending,
						onClick: () => {
							upsert.mutate({
								key: newKey.trim(),
								enabled: false,
								rollout_percent: 100,
								...newDesc.trim() ? { description: newDesc.trim() } : {}
							}, { onSuccess: () => {
								setNewKey("");
								setNewDesc("");
								toast.success("Flag created");
							} });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-4 w-4" }), " Add"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: (flags ?? []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-sm",
						children: f.key
					}), f.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: f.description
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: !!f.enabled,
							onCheckedChange: (v) => upsert.mutate({
								key: f.key,
								enabled: v,
								rollout_percent: f.rollout_percent ?? 100,
								...f.description ? { description: f.description } : {}
							})
						}), f.enabled ? "On" : "Off"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "ghost",
						onClick: () => del.mutate(f.key),
						"aria-label": "Delete flag",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
					})]
				})]
			}, f.key))
		})]
	});
}
var AreaTrend = (0, import_react.lazy)(() => import("./charts-C_dU_ODB.mjs").then((m) => ({ default: m.AreaTrend })));
var BarBreakdown = (0, import_react.lazy)(() => import("./charts-C_dU_ODB.mjs").then((m) => ({ default: m.BarBreakdown })));
var DonutBreakdown = (0, import_react.lazy)(() => import("./charts-C_dU_ODB.mjs").then((m) => ({ default: m.DonutBreakdown })));
var LineTrend = (0, import_react.lazy)(() => import("./charts-C_dU_ODB.mjs").then((m) => ({ default: m.LineTrend })));
function usePresetRange(preset, custom) {
	return (0, import_react.useMemo)(() => {
		const now = /* @__PURE__ */ new Date();
		if (preset === "custom") return {
			from: custom.from,
			to: custom.to
		};
		if (preset === "7d") return {
			from: subDays(now, 7).toISOString(),
			to: now.toISOString()
		};
		if (preset === "30d") return {
			from: subDays(now, 30).toISOString(),
			to: now.toISOString()
		};
		return {
			from: subMonths(now, 12).toISOString(),
			to: now.toISOString()
		};
	}, [
		preset,
		custom.from,
		custom.to
	]);
}
function ManagedRestaurantsTab() {
	const queryClient = useQueryClient();
	const managed = useQuery({
		queryKey: ["managed-restaurants"],
		queryFn: () => listManagedRestaurants()
	});
	const [email, setEmail] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [ownerName, setOwnerName] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function launch(restaurantId) {
		try {
			await launchManagedRestaurant({ data: { restaurantId } });
			await queryClient.invalidateQueries({ queryKey: ["managed-restaurants"] });
			toast.success("Restaurant launched in Consumer.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not launch restaurant.");
		}
	}
	async function submit(event) {
		event.preventDefault();
		setBusy(true);
		try {
			if ((await createManagedRestaurant({ data: {
				email,
				name,
				ownerName
			} })).invited) try {
				await sendPasswordReset(email.trim().toLowerCase());
				toast.success("Password setup email sent. The owner must also verify their email before first sign-in.");
			} catch {
				toast.error("Restaurant created, but Firebase could not send the setup email. Check Firebase Auth email settings.");
			}
			else toast.success("Restaurant linked to the existing Firebase account.");
			setEmail("");
			setName("");
			setOwnerName("");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not create restaurant account.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "max-w-2xl rounded-3xl border border-border/60 bg-card p-6 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: "Create a restaurant account"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Invite a restaurant owner by email. Their account starts with a one-month RevenueCat trial and becomes visible to Consumer after Hub launch."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "grid gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						type: "text",
						placeholder: "Restaurant name",
						value: name,
						onChange: (event) => setName(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						type: "text",
						placeholder: "Owner full name",
						value: ownerName,
						onChange: (event) => setOwnerName(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						type: "email",
						placeholder: "Owner email",
						value: email,
						onChange: (event) => setEmail(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Send invite and start trial"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg",
					children: "Restaurants"
				}), managed.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : managed.data?.length ? managed.data.map((restaurant) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: restaurant.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: restaurant.owner_email
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: restaurant.onboarding_complete,
						onClick: () => launch(restaurant.id),
						children: restaurant.onboarding_complete ? "Launched" : "Launch"
					})]
				}, restaurant.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No managed restaurants yet."
				})]
			})
		]
	});
}
function AdminPage() {
	const { user, loading: sessLoading } = useSession();
	const navigate = useNavigate();
	const { data: gate, isLoading: gateLoading } = useQuery({
		queryKey: ["is-admin", user?.id],
		queryFn: () => adminIsAdmin(),
		enabled: !!user
	});
	(0, import_react.useEffect)(() => {
		if (!sessLoading && !user) navigate({
			to: "/auth",
			replace: true
		});
	}, [
		sessLoading,
		user,
		navigate
	]);
	const [preset, setPreset] = (0, import_react.useState)("30d");
	const [custom, setCustom] = (0, import_react.useState)({
		from: format(subDays(/* @__PURE__ */ new Date(), 30), "yyyy-MM-dd"),
		to: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
	});
	const range = usePresetRange(preset, {
		from: new Date(custom.from).toISOString(),
		to: (/* @__PURE__ */ new Date(custom.to + "T23:59:59")).toISOString()
	});
	const analytics = useQuery({
		queryKey: [
			"admin-analytics",
			range.from,
			range.to
		],
		queryFn: () => getAdminAnalytics({ data: range }),
		enabled: !!gate?.isAdmin,
		staleTime: 6e4
	});
	if (sessLoading || gateLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto flex max-w-3xl flex-1 items-center justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
	});
	if (!gate?.isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl flex-1 px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "mx-auto h-10 w-10 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-display text-2xl",
				children: "Admin only"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "You don't have access to this dashboard."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "admin-workspace mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 sm:px-7",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "admin-header flex flex-col gap-5 pb-6 md:flex-row md:items-end md:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crown, { className: "h-6 w-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 text-xs font-semibold text-muted-foreground",
						children: "MEALMATE / ADMIN"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold leading-tight sm:text-3xl",
						children: "Admin Center"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: "Users, revenue & your growing community."
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateRangeControl, {
				preset,
				onPresetChange: setPreset,
				custom,
				onCustomChange: setCustom
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "overview",
			className: "mt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
					className: "admin-tabs flex h-auto w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "overview",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "mr-2 size-4" }), "Overview"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "users",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 size-4" }), "Users"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "revenue",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mr-2 size-4" }), "Revenue"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "recipes",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, { className: "mr-2 size-4" }), "Recipes"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "telemetry",
							children: "Telemetry"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "ai",
							children: "AI checks"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "flags",
							children: "Flags"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "subs",
							children: "Subscribers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "promos",
							children: "Promos"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "grant",
							children: "Grant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "restaurants",
							children: "Restaurants"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "announce",
							children: "Announce"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
							value: "audit",
							children: "Audit"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "overview",
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewTab, {
						...analytics.data ? { analytics: analytics.data } : {},
						loading: analytics.isLoading
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImageBackfillCard, {})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "users",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersTab, {
						...analytics.data ? { analytics: analytics.data } : {},
						loading: analytics.isLoading
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "revenue",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevenueTab, {
						...analytics.data ? { analytics: analytics.data } : {},
						loading: analytics.isLoading
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "recipes",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipesTab, {
						...analytics.data ? { analytics: analytics.data } : {},
						loading: analytics.isLoading
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "telemetry",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelemetryTab, { range })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "ai",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiDiagnosticsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "flags",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "subs",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubscribersTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "promos",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromosTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "grant",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrantTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "restaurants",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagedRestaurantsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "announce",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnnouncementsTab, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "audit",
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditTab, {})
				})
			]
		})]
	});
}
function DateRangeControl({ preset, onPresetChange, custom, onCustomChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: preset,
			onValueChange: (v) => onPresetChange(v),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "w-[160px] rounded-lg bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "7d",
					children: "Last 7 days"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "30d",
					children: "Last 30 days"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "12m",
					children: "Last 12 months"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "custom",
					children: "Custom range"
				})
			] })]
		}), preset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "date",
			value: custom.from,
			onChange: (e) => onCustomChange({
				...custom,
				from: e.target.value
			}),
			className: "w-[150px] rounded-full"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "date",
			value: custom.to,
			onChange: (e) => onCustomChange({
				...custom,
				to: e.target.value
			}),
			className: "w-[150px] rounded-full"
		})] })]
	});
}
function KpiCard({ label, value, icon: Icon, delta, hint }) {
	const positive = (delta ?? 0) >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-kpi group min-w-0 rounded-lg border border-border bg-card p-5 transition motion-safe:hover:-translate-y-0.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "kpi-icon flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10 text-chart-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
				}), delta !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: `flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${positive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"}`,
					children: [
						positive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-3 w-3" }),
						Math.abs(delta).toFixed(1),
						"%"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-xs font-semibold text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 break-words font-display text-3xl font-semibold leading-tight tabular-nums",
				children: value
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
function ChartCard({ title, subtitle, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-chart min-w-0 rounded-lg border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg leading-tight",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-[220px] items-center justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" })
			}),
			children
		})]
	});
}
function LoadingBlock() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
		children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-3xl bg-muted" }, i))
	});
}
function OverviewTab({ analytics, loading }) {
	if (loading || !analytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, {});
	const { users, revenue, subscriptions, recipes } = analytics;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Total users",
						value: users.total.toLocaleString(),
						icon: Users,
						delta: users.growthPct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Revenue (range)",
						value: `$${revenue.total.toFixed(2)}`,
						icon: DollarSign,
						delta: revenue.growthPct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Active premium",
						value: subscriptions.active + subscriptions.lifetime,
						icon: Crown,
						hint: `${subscriptions.trialing} in trial`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Conversion",
						value: `${subscriptions.conversionRate.toFixed(1)}%`,
						icon: TrendingUp
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "New users",
					subtitle: "Signups in selected range",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend, {
						data: users.series,
						dataKey: "count"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Revenue",
					subtitle: "Daily payments (USD)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend, {
						data: revenue.series,
						dataKey: "amount",
						color: "hsl(142 71% 45%)"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "New users",
						value: users.new.toLocaleString(),
						icon: Users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "New recipes",
						value: recipes.newInRange.toLocaleString(),
						icon: Utensils
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Grocery items",
						value: analytics.grocery.itemsInRange.toLocaleString(),
						icon: Activity
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Meal plans",
						value: analytics.planner.entriesInRange.toLocaleString(),
						icon: Activity
					})
				]
			})
		]
	});
}
function UsersTab({ analytics, loading }) {
	const [search, setSearch] = (0, import_react.useState)("");
	const users = useQuery({
		queryKey: ["admin-users", search],
		queryFn: () => adminListUsers({ data: { search } }),
		staleTime: 3e4
	});
	if (loading || !analytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, {});
	const pie = [{
		name: "Premium",
		value: analytics.users.premium
	}, {
		name: "Free",
		value: analytics.users.free
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Total users",
						value: analytics.users.total.toLocaleString(),
						icon: Users,
						delta: analytics.users.growthPct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "New in range",
						value: analytics.users.new.toLocaleString(),
						icon: Users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Premium users",
						value: analytics.users.premium.toLocaleString(),
						icon: Crown
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Free users",
						value: analytics.users.free.toLocaleString(),
						icon: Users
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Signups over time",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineTrend, {
						data: analytics.users.series,
						dataKey: "count"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Premium vs Free",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutBreakdown, {
						data: pie,
						dataKey: "value"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg",
						children: "Recent users"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full max-w-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search name or username",
							className: "rounded-full pl-9"
						})]
					})]
				}), users.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-xs uppercase tracking-wide text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "User"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "Username"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "Locale"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "Joined"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 text-left",
									children: "ID"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [(users.data ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: u.display_name ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-muted-foreground",
									children: u.username ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-muted-foreground",
									children: u.locale
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-muted-foreground",
									children: format(new Date(u.created_at), "MMM d, yyyy")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2 font-mono text-xs text-muted-foreground",
									children: [u.id.slice(0, 8), "…"]
								})
							]
						}, u.id)), (users.data ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "px-3 py-8 text-center text-muted-foreground",
							children: "No users found."
						}) })] })]
					})
				})]
			})
		]
	});
}
function RevenueTab({ analytics, loading }) {
	if (loading || !analytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, {});
	const currencies = Object.entries(analytics.revenue.currencyBreakdown).map(([name, value]) => ({
		name,
		value: Number(value.toFixed(2))
	}));
	const storePie = analytics.subscriptions.storeBreakdown.map((s) => ({
		name: s.name,
		value: s.count
	}));
	const monthlyEstimate = analytics.range.days > 0 ? analytics.revenue.total / analytics.range.days * 30 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Revenue (range)",
						value: `$${analytics.revenue.total.toFixed(2)}`,
						icon: DollarSign,
						delta: analytics.revenue.growthPct
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Monthly (est.)",
						value: `$${monthlyEstimate.toFixed(2)}`,
						icon: TrendingUp,
						hint: "Extrapolated from range"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "ARPU",
						value: `$${analytics.revenue.arpu.toFixed(2)}`,
						icon: Users,
						hint: "Revenue / premium user"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Refunds",
						value: `$${analytics.revenue.refunds.toFixed(2)}`,
						icon: TrendingDown
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
				title: "Revenue over time",
				subtitle: "Daily payments in USD",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AreaTrend, {
					data: analytics.revenue.series,
					dataKey: "amount",
					color: "hsl(142 71% 45%)"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Currency breakdown",
					children: currencies.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarBreakdown, {
						data: currencies,
						dataKey: "value"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMini, { label: "No revenue in this range." })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Subscriptions by store",
					children: storePie.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutBreakdown, {
						data: storePie,
						dataKey: "value"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMini, { label: "No subscriptions yet." })
				})]
			})
		]
	});
}
function RecipesTab({ analytics, loading }) {
	if (loading || !analytics) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Total recipes",
						value: analytics.recipes.total.toLocaleString(),
						icon: Utensils
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "New in range",
						value: analytics.recipes.newInRange.toLocaleString(),
						icon: Utensils
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Grocery items",
						value: analytics.grocery.itemsInRange.toLocaleString(),
						icon: Activity
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Meal plan entries",
						value: analytics.planner.entriesInRange.toLocaleString(),
						icon: Activity
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Top categories",
					children: analytics.recipes.categories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarBreakdown, {
						data: analytics.recipes.categories,
						dataKey: "count"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMini, { label: "No categorized recipes yet." })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartCard, {
					title: "Top cuisines",
					children: analytics.recipes.cuisines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutBreakdown, {
						data: analytics.recipes.cuisines,
						dataKey: "count"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMini, { label: "No cuisines yet." })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-display text-lg",
					children: "Most saved recipes"
				}), analytics.recipes.topByFavorites.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyMini, { label: "No favorites yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border/60",
					children: analytics.recipes.topByFavorites.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-sm font-medium text-muted-foreground",
								children: i + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
								recipe: r,
								size: "thumb",
								alt: `${r.name} recipe`,
								className: "h-10 w-10 rounded-xl object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 truncate",
								children: r.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
								children: [r.saves, " saves"]
							})
						]
					}, r.id))
				})]
			})
		]
	});
}
function EmptyMini({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-[180px] items-center justify-center text-sm text-muted-foreground",
		children: label
	});
}
function SubscribersTab() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-subs"],
		queryFn: () => adminListSubscribers()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" });
	const rows = data ?? [];
	function exportCsv() {
		const csv = [[
			"user_id",
			"display_name",
			"tier",
			"status",
			"store",
			"period_end",
			"trial_end",
			"is_manual"
		].join(","), ...rows.map((r) => [
			r.user_id,
			JSON.stringify(r.display_name ?? ""),
			r.tier,
			r.status,
			r.store ?? "",
			r.period_end ?? "",
			r.trial_end ?? "",
			r.is_manual
		].join(","))].join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `mealmate-subscribers-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [rows.length, " subscribers"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "secondary",
				onClick: exportCsv,
				className: "rounded-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-4 w-4" }), " Export CSV"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "User"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Tier"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Store"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Ends"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: r.display_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 capitalize",
							children: r.tier
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 capitalize",
							children: r.status
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: r.store ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: r.period_end ? new Date(r.period_end).toLocaleDateString() : "—"
						})
					]
				}, r.id)), rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
					colSpan: 5,
					className: "px-3 py-6 text-center text-muted-foreground",
					children: "No subscribers yet."
				}) })] })]
			})
		})]
	});
}
function PromosTab() {
	const qc = useQueryClient();
	const { data: promos, isLoading } = useQuery({
		queryKey: ["admin-promos"],
		queryFn: () => adminListPromos()
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	async function save() {
		if (!editing) return;
		try {
			await adminSavePromo({ data: editing });
			toast.success("Promo saved");
			setEditing(null);
			qc.invalidateQueries({ queryKey: ["admin-promos"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Save failed");
		}
	}
	async function remove(id) {
		if (!confirm("Delete this promo code?")) return;
		await adminDeletePromo({ data: { id } });
		qc.invalidateQueries({ queryKey: ["admin-promos"] });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-3 flex justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				className: "rounded-full",
				onClick: () => setEditing({
					code: "",
					reward_kind: "free_days",
					reward_value: 7,
					max_redemptions: null,
					expires_at: null,
					enabled: true,
					notes: null
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " New promo"]
			})
		}),
		isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "space-y-2",
			children: [(promos ?? []).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
						className: "font-mono font-semibold",
						children: p.code
					}), !p.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase",
						children: "Disabled"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						p.reward_kind,
						" · value ",
						p.reward_value,
						" · redeemed ",
						p.redemption_count,
						p.max_redemptions ? `/${p.max_redemptions}` : ""
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => setEditing({
							id: p.id,
							code: p.code,
							reward_kind: p.reward_kind,
							reward_value: p.reward_value,
							max_redemptions: p.max_redemptions,
							expires_at: p.expires_at,
							enabled: p.enabled,
							notes: p.notes
						}),
						children: "Edit"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => remove(p.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-destructive" })
					})]
				})]
			}, p.id)), promos && promos.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm text-muted-foreground",
				children: "No promo codes yet."
			})]
		}),
		editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-md rounded-3xl border border-border/60 bg-card p-5 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: editing.id ? "Edit promo" : "New promo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Code (e.g. WELCOME)",
								value: editing.code,
								onChange: (e) => setEditing({
									...editing,
									code: e.target.value.toUpperCase()
								}),
								className: "uppercase"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: editing.reward_kind,
								onValueChange: (v) => setEditing({
									...editing,
									reward_kind: v
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "free_days",
										children: "Free days"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "free_month",
										children: "Free month"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "free_year",
										children: "Free year"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "lifetime",
										children: "Lifetime"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "percent_discount",
										children: "Percent discount"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								placeholder: "Value (days or %)",
								value: editing.reward_value,
								onChange: (e) => setEditing({
									...editing,
									reward_value: Number(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								placeholder: "Max redemptions (blank = unlimited)",
								value: editing.max_redemptions ?? "",
								onChange: (e) => setEditing({
									...editing,
									max_redemptions: e.target.value ? Number(e.target.value) : null
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-xl border border-border/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: "Enabled"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: editing.enabled,
									onCheckedChange: (v) => setEditing({
										...editing,
										enabled: v
									})
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => setEditing(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: save,
							children: "Save"
						})]
					})
				]
			})
		})
	] });
}
function GrantTab() {
	const [userId, setUserId] = (0, import_react.useState)("");
	const [days, setDays] = (0, import_react.useState)(30);
	const qc = useQueryClient();
	async function grant() {
		try {
			await adminGrantPremium({ data: {
				userId,
				days
			} });
			toast.success(`Granted ${days} days`);
			qc.invalidateQueries({ queryKey: ["admin-subs"] });
			qc.invalidateQueries({ queryKey: ["admin-analytics"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Grant failed");
		}
	}
	async function revoke() {
		try {
			await adminRevokePremium({ data: { userId } });
			toast.success("Revoked Premium");
			qc.invalidateQueries({ queryKey: ["admin-subs"] });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Revoke failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md space-y-3 rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-lg",
				children: "Manual grant / revoke"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "User ID (uuid)",
				value: userId,
				onChange: (e) => setUserId(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				placeholder: "Days",
				value: days,
				onChange: (e) => setDays(Number(e.target.value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: grant,
					disabled: !userId,
					children: "Grant Premium"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: revoke,
					disabled: !userId,
					children: "Revoke"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Find user IDs in the Users tab."
			})
		]
	});
}
function AuditTab() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin-audit"],
		queryFn: () => adminListAuditLogs()
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" });
	const rows = data ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl border border-border/60 bg-card p-5 shadow-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-3 font-display text-lg",
			children: "Recent admin activity"
		}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No audit events yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Action"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Target"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "Actor"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 text-left",
							children: "IP"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-muted-foreground",
							children: format(new Date(r.created_at), "MMM d, HH:mm")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2",
							children: r.action
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-3 py-2 font-mono text-xs text-muted-foreground",
							children: [r.target_table ?? "—", r.target_id ? ` · ${r.target_id.slice(0, 8)}…` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 font-mono text-xs text-muted-foreground",
							children: r.actor_id ? r.actor_id.slice(0, 8) + "…" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-3 py-2 text-muted-foreground",
							children: r.ip_address ?? "—"
						})
					]
				}, r.id)) })]
			})
		})]
	});
}
//#endregion
export { AdminPage as component, LineTrend$1 as i, BarBreakdown$1 as n, DonutBreakdown$1 as r, AreaTrend$1 as t };
