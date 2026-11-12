import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Ht as CheckCheck, Lt as ChevronRight, Qt as Bell, a as Utensils, rt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { a as listMyNotifications, f as setMyNotificationReadStatus, o as markAllMyNotificationsRead } from "./notifications.functions-DkR4bOgG.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CCu5hqCB.js
var import_jsx_runtime = require_jsx_runtime();
var categoryNames = {
	recipes: "Recipes",
	healthy_eating: "Healthy eating",
	dining: "MealMate Dining",
	mia: "Mia AI",
	features: "New features",
	general: "MealMate update"
};
function NotificationCenter() {
	const { user } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const notifications = useQuery({
		queryKey: ["notifications", user?.id],
		queryFn: () => listMyNotifications(),
		enabled: !!user,
		staleTime: 15e3
	});
	const items = notifications.data?.items ?? [];
	async function open(item) {
		try {
			if (!item.readAt) await setMyNotificationReadStatus({ data: {
				id: item.id,
				read: true
			} });
			await Promise.all([queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }), queryClient.invalidateQueries({ queryKey: ["notification-count", user?.id] })]);
			navigate({ to: item.destination });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not open notification.");
		}
	}
	async function toggleRead(item) {
		try {
			await setMyNotificationReadStatus({ data: {
				id: item.id,
				read: !item.readAt
			} });
			await Promise.all([queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }), queryClient.invalidateQueries({ queryKey: ["notification-count", user?.id] })]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not update notification.");
		}
	}
	async function markAllRead() {
		try {
			await markAllMyNotificationsRead();
			await Promise.all([queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }), queryClient.invalidateQueries({ queryKey: ["notification-count", user?.id] })]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Could not update notifications.");
		}
	}
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 pb-24 pt-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-14 items-center justify-center rounded-2xl bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { "aria-hidden": "true" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl",
				children: "Your notifications"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-sm text-sm text-muted-foreground",
				children: "Sign in to view your personal MealMate updates and notification history."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => navigate({ to: "/auth" }),
				children: "Sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-6 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground",
					children: "MealMate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl",
					children: "Notifications"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: notifications.data?.unreadCount ? `${notifications.data.unreadCount} unread update${notifications.data.unreadCount === 1 ? "" : "s"}` : "You’re all caught up."
				})
			] }), (notifications.data?.unreadCount ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				onClick: () => void markAllRead(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { "data-icon": "inline-start" }), "Mark all read"]
			})]
		}), notifications.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-48 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				"aria-label": "Loading notifications",
				className: "animate-spin text-muted-foreground"
			})
		}) : notifications.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl border border-border p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "Could not load your notifications"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Check your connection and try again."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "outline",
					onClick: () => void notifications.refetch(),
					children: "Retry"
				})
			]
		}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-12 items-center justify-center rounded-2xl bg-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Utensils, { "aria-hidden": "true" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-display text-xl",
					children: "Nothing new yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-sm text-sm text-muted-foreground",
					children: "MealMate announcements and feature updates will appear here."
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-3",
			children: items.map((item) => {
				const isUnread = !item.readAt;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: `overflow-hidden rounded-2xl border bg-card transition-colors ${isUnread ? "border-foreground/20" : "border-border"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3 p-4 sm:p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${isUnread ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { "aria-hidden": "true" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										children: categoryNames[item.category] ?? "MealMate update"
									}), isUnread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										children: "Unread"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void open(item),
									className: "mt-2 block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold leading-snug",
										children: item.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground",
										children: item.body
									})]
								}),
								item.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.imageUrl,
									alt: `Announcement image for ${item.title}`,
									loading: "lazy",
									className: "mt-3 max-h-64 w-full rounded-xl object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
										className: "text-xs text-muted-foreground",
										dateTime: item.createdAt,
										children: new Date(item.createdAt).toLocaleString()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "ghost",
											size: "sm",
											onClick: () => void toggleRead(item),
											children: isUnread ? "Mark read" : "Mark unread"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "outline",
											size: "sm",
											onClick: () => void open(item),
											children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { "data-icon": "inline-end" })]
										})]
									})]
								})
							]
						})]
					})
				}, item.id);
			})
		})]
	});
}
var SplitComponent = NotificationCenter;
//#endregion
export { SplitComponent as component };
