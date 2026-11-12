import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { $ as LogOut, At as CircleQuestionMark, E as Shield, H as Moon, Jt as Bell, Lt as Check, Nt as ChevronRight, O as Share2, St as DollarSign, Z as Mail, _t as FileText, b as Star, c as User, d as Trophy, et as Lock, ht as Flame, mt as Gem, nt as LoaderCircle, ot as Info, pt as Globe, u as UserCog, v as Sun } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { c as sendPasswordReset } from "./hub-surface-DqCmg7ui.mjs";
import { n as useSession, t as signOutUnified } from "./use-session-DD4jPZEV.mjs";
import { d as saveMyNotificationPreferences, l as registerMyPushToken, n as getMyNotificationPreferences } from "./notifications.functions-DkR4bOgG.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as SelectTrigger, i as SelectItem, n as SelectContent, o as SelectValue, t as Select } from "./select-CtS-l6xr.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { n as claimElite, r as getGamification } from "./xp.functions-CxtV_ELG.mjs";
import { i as useMascotTheme, t as MASCOT_THEMES } from "./use-mascot-theme-BE-yJYn6.mjs";
import { i as formatXp } from "./xp-CfZ9EY1i.mjs";
import { a as useUpgradeModal, i as revokeBrowserPushToken, r as requestBrowserPushToken } from "./upgrade-modal-Onxoqw7b.mjs";
import { n as useTheme } from "./theme-provider-CWQX-5Of.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-iyBGUyWY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Full gamification panel for the profile screen: level progress, streaks,
* active challenges, achievements and the once-ever Elite reward claim.
*/
function GamificationCard() {
	const { user } = useSession();
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["gamification"],
		queryFn: () => getGamification(),
		enabled: !!user,
		staleTime: 6e4
	});
	const claim = useMutation({
		mutationFn: () => claimElite(),
		onSuccess: (res) => {
			toast.success("Elite reward claimed!", { description: `Premium active until ${new Date(res.premiumUntil).toLocaleDateString()}.` });
			queryClient.invalidateQueries({ queryKey: ["gamification"] });
			queryClient.invalidateQueries({ queryKey: ["entitlement"] });
		},
		onError: (err) => toast.error("Couldn't claim the reward", { description: err instanceof Error ? err.message : "Try again in a moment." })
	});
	if (!user) return null;
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 rounded-3xl border border-border bg-card p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-14 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-2 w-full rounded-full" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full rounded-2xl" })]
	});
	const { level } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "h-8 w-8" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "truncate font-display text-2xl leading-tight",
								children: level.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary",
								children: [formatXp(data.totalXp), " XP"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 h-2 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-primary transition-all duration-700",
								style: { width: `${Math.round(level.progress * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-xs text-muted-foreground",
							children: level.nextMin ? `${formatXp(level.xpToNext)} XP to ${level.nextName}` : "Top level reached — legendary!"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					{
						icon: Flame,
						label: "Day streak",
						value: String(data.currentStreak)
					},
					{
						icon: Trophy,
						label: "Best streak",
						value: String(data.longestStreak)
					},
					{
						icon: Gem,
						label: "Total XP",
						value: formatXp(data.totalXp)
					}
				].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-1 rounded-2xl bg-muted/50 px-2 py-3 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "h-4 w-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl leading-none",
							children: s.value
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
							children: s.label
						})
					]
				}, s.label))
			}),
			data.eliteRewardAvailable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-ember/15 via-primary/10 to-ember/15 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-bold",
					children: "Elite reward unlocked"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "50,000 XP earns you 30 days of Premium — once, ever."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					className: "rounded-full",
					disabled: claim.isPending,
					onClick: () => claim.mutate(),
					children: claim.isPending ? "Claiming…" : "Claim"
				})]
			}),
			data.challenges.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Challenges"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-2",
				children: data.challenges.map((c) => {
					const done = !!c.completedAt;
					const pct = Math.min(c.progress / c.goal * 100, 100);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: cn("rounded-2xl border border-border p-3", done && "border-primary/30 bg-primary/5"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "flex items-center gap-1.5 text-sm font-semibold",
									children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 shrink-0 text-primary" }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: c.title
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: c.description
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 rounded-full bg-ember/15 px-2 py-0.5 text-[10px] font-bold text-ember",
								children: [
									"+",
									c.xpReward,
									" XP"
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: cn("h-full rounded-full transition-all", done ? "bg-primary" : "bg-ember"),
									style: { width: `${pct}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[10px] font-semibold text-muted-foreground",
								children: [
									c.progress,
									"/",
									c.goal
								]
							})]
						})]
					}, c.code);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Achievements"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6",
				children: data.achievements.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					title: a.title + (a.unlockedAt ? " — unlocked" : " — " + a.description),
					className: cn("flex flex-col items-center gap-1 rounded-xl border p-2 text-center", a.unlockedAt ? "border-primary/30 bg-primary/5" : "border-border opacity-40 grayscale"),
					children: [a.unlockedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, {
						className: "h-4 w-4 text-primary",
						"aria-hidden": "true"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "line-clamp-2 text-[9px] font-semibold leading-tight",
						children: a.title
					})]
				}, a.code))
			})] }),
			data.recentEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xs font-bold uppercase tracking-widest text-muted-foreground",
				children: "Recent XP"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 space-y-1",
				children: data.recentEvents.slice(0, 5).map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: e.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-bold text-primary",
						children: ["+", e.points]
					})]
				}, i))
			})] })
		]
	});
}
/** Native-style mascot theme setting. Colourful themes are Premium, matching the artwork. */
function ThemePicker() {
	const { theme, setTheme, saving } = useMascotTheme();
	const { isPremium } = usePremium();
	const { open } = useUpgradeModal();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		"aria-labelledby": "theme-heading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "theme-heading",
				className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "App theme"
			}), saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "h-3.5 w-3.5 animate-spin text-muted-foreground",
				"aria-label": "Saving"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-3xl border border-border bg-card p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "radiogroup",
				"aria-label": "Mascot theme",
				className: "grid grid-cols-3 gap-3 sm:grid-cols-6",
				children: MASCOT_THEMES.map((t) => {
					const selected = t.id === theme.id;
					const locked = t.premium && !isPremium;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "radio",
						"aria-checked": selected,
						"aria-label": `${t.name}${locked ? " (Premium)" : ""}`,
						onClick: () => locked ? open(`Unlock the ${t.name} theme with MealMate Premium.`) : void setTheme(t.id),
						className: "group flex flex-col items-center gap-2 rounded-2xl p-1.5 text-center transition-transform active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("relative block aspect-square w-full overflow-hidden rounded-2xl border-2 transition-colors", selected ? "border-foreground" : "border-transparent"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: t.image,
									alt: "",
									loading: "lazy",
									className: "h-full w-full object-cover"
								}),
								locked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" })
								}),
								selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background motion-safe:animate-in motion-safe:zoom-in-50",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" })
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5 text-xs font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-2 w-2 rounded-full",
								style: { background: t.accent },
								"aria-hidden": "true"
							}), t.name]
						})]
					}, t.id);
				})
			})
		})]
	});
}
var CURRENCIES = [
	{
		code: "USD",
		symbol: "$",
		name: "US Dollar"
	},
	{
		code: "ZAR",
		symbol: "R",
		name: "South African Rand"
	},
	{
		code: "EUR",
		symbol: "€",
		name: "Euro"
	},
	{
		code: "GBP",
		symbol: "£",
		name: "British Pound"
	},
	{
		code: "AUD",
		symbol: "A$",
		name: "Australian Dollar"
	},
	{
		code: "CAD",
		symbol: "C$",
		name: "Canadian Dollar"
	},
	{
		code: "NZD",
		symbol: "NZ$",
		name: "New Zealand Dollar"
	}
];
var LANGUAGES = [
	{
		code: "en",
		name: "English"
	},
	{
		code: "zu",
		name: "isiZulu"
	},
	{
		code: "af",
		name: "Afrikaans"
	},
	{
		code: "xh",
		name: "isiXhosa"
	},
	{
		code: "st",
		name: "Sesotho"
	},
	{
		code: "tn",
		name: "Setswana"
	},
	{
		code: "nso",
		name: "Sepedi"
	},
	{
		code: "ve",
		name: "Tshivenda"
	},
	{
		code: "ts",
		name: "Xitsonga"
	},
	{
		code: "ss",
		name: "Siswati"
	},
	{
		code: "nr",
		name: "isiNdebele"
	}
];
var REGION_CURRENCY = {
	US: "USD",
	ZA: "ZAR",
	GB: "GBP",
	IE: "EUR",
	DE: "EUR",
	FR: "EUR",
	ES: "EUR",
	IT: "EUR",
	NL: "EUR",
	PT: "EUR",
	AT: "EUR",
	BE: "EUR",
	FI: "EUR",
	GR: "EUR",
	AU: "AUD",
	CA: "CAD",
	NZ: "NZD"
};
function detectCurrency() {
	if (typeof navigator === "undefined") return "USD";
	return REGION_CURRENCY[Intl.DateTimeFormat().resolvedOptions().locale?.split("-")?.[1]?.toUpperCase() ?? ""] ?? "USD";
}
function SettingsPage() {
	const { user } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { resolved, setMode } = useTheme();
	const notificationPreferences = useQuery({
		queryKey: ["notification-preferences", user?.id],
		queryFn: () => getMyNotificationPreferences(),
		enabled: !!user,
		staleTime: 3e4
	});
	const productUpdatesEnabled = notificationPreferences.data?.productUpdatesEnabled ?? true;
	const pushEnabled = notificationPreferences.data?.pushEnabled ?? false;
	const [notificationBusy, setNotificationBusy] = (0, import_react.useState)(false);
	async function updateNotificationPreferences(change) {
		if (!user) {
			toast.error("Sign in to manage notification preferences.");
			return;
		}
		const current = {
			productUpdatesEnabled: notificationPreferences.data?.productUpdatesEnabled ?? true,
			pushEnabled: notificationPreferences.data?.pushEnabled ?? false
		};
		const next = {
			...current,
			...change
		};
		if (!next.productUpdatesEnabled) next.pushEnabled = false;
		setNotificationBusy(true);
		let consentSaved = false;
		try {
			const token = next.pushEnabled && !current.pushEnabled ? await requestBrowserPushToken() : null;
			await saveMyNotificationPreferences({ data: next });
			consentSaved = next.pushEnabled;
			if (token) await registerMyPushToken({ data: { token } });
			if (!next.pushEnabled) await revokeBrowserPushToken().catch(() => void 0);
			await queryClient.invalidateQueries({ queryKey: ["notification-preferences", user.id] });
			toast.success(next.pushEnabled ? "Push notifications enabled for this account." : "Notification preferences saved.");
		} catch (error) {
			if (consentSaved) await saveMyNotificationPreferences({ data: current }).catch(() => void 0);
			toast.error(error instanceof Error ? error.message : "Could not update notification preferences.");
		} finally {
			setNotificationBusy(false);
		}
	}
	const { data: prefs } = useQuery({
		queryKey: ["profile-prefs", user?.id],
		enabled: !!user,
		queryFn: async () => {
			const { data } = await firebaseData.from("profiles").select("currency, locale").eq("id", user.id).maybeSingle();
			return data ?? null;
		}
	});
	const [currency, setCurrency] = (0, import_react.useState)("USD");
	const [lang, setLang] = (0, import_react.useState)("en");
	(0, import_react.useEffect)(() => {
		const storedCur = window.localStorage.getItem("mealmate-currency");
		const storedLang = window.localStorage.getItem("mealmate-lang");
		setCurrency(prefs?.currency ?? storedCur ?? detectCurrency());
		setLang(prefs?.locale ?? storedLang ?? "en");
	}, [prefs]);
	async function saveCurrency(next) {
		setCurrency(next);
		window.localStorage.setItem("mealmate-currency", next);
		window.dispatchEvent(new CustomEvent("mealmate-currency-changed", { detail: next }));
		if (!user) return;
		const { error } = await firebaseData.from("profiles").update({ currency: next }).eq("id", user.id);
		if (error) {
			toast.error("Couldn't save currency", { description: error.message });
			return;
		}
		queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
		queryClient.invalidateQueries({ queryKey: ["currency"] });
	}
	async function saveLanguage(next) {
		setLang(next);
		window.localStorage.setItem("mealmate-lang", next);
		window.dispatchEvent(new CustomEvent("mealmate-lang-changed", { detail: next }));
		if (!user) return;
		const { error } = await firebaseData.from("profiles").update({ locale: next }).eq("id", user.id);
		if (error) {
			toast.error("Couldn't save language", { description: error.message });
			return;
		}
		queryClient.invalidateQueries({ queryKey: ["profile-prefs", user.id] });
		queryClient.invalidateQueries({ queryKey: ["locale"] });
	}
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOutUnified();
		toast.success("Signed out");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	async function share() {
		const url = "https://mealmate.app";
		const shareData = {
			title: "MealMate",
			text: "Cook smarter with MealMate — recipes, planner, and AI in your kitchen.",
			url
		};
		try {
			if (navigator.share) await navigator.share(shareData);
			else {
				await navigator.clipboard.writeText(url);
				toast.success("Link copied to clipboard");
			}
		} catch {}
	}
	function rate() {
		toast.success("Thanks for the love!", { description: "Ratings will open in the App Store once we ship." });
	}
	async function resetPassword() {
		if (!user?.email) {
			toast.error("No email on file");
			return;
		}
		try {
			await sendPasswordReset(user.email, `${window.location.origin}/reset-password`);
			toast.success("Password reset email sent");
		} catch {
			toast.error("Couldn't send the reset email. Please try again.");
		}
	}
	const profileItems = [
		{
			label: "Edit my preferences",
			description: "Goals, tastes, allergies, time and budget",
			icon: UserCog,
			to: "/onboarding"
		},
		{
			label: "MealMate Premium",
			description: "AI, recipes and meal plans · View subscription plans",
			icon: Star,
			to: "/premium"
		},
		{
			label: "Admin dashboard",
			description: "Subscribers, promos, revenue (admin only)",
			icon: Shield,
			to: "/admin"
		}
	];
	const accountItems = [{
		label: "Email",
		description: user?.email ?? "Not signed in",
		icon: Mail
	}, {
		label: "Change password",
		description: "We'll email you a secure reset link",
		icon: Lock,
		onClick: resetPassword
	}];
	const supportItems = [{
		label: "Help Center",
		description: "Answers to common questions",
		icon: CircleQuestionMark,
		to: "/support"
	}, {
		label: "Contact support",
		description: "Get in touch with the team",
		icon: Mail,
		href: "mailto:support@mealmate.app"
	}];
	const aboutItems = [
		{
			label: "About MealMate",
			description: "Version and credits",
			icon: Info,
			to: "/about"
		},
		{
			label: "Follow on Instagram",
			description: "@mealmate.sp",
			icon: Share2,
			href: "https://www.instagram.com/mealmate.sp"
		},
		{
			label: "Follow on TikTok",
			description: "@mealmate.sp",
			icon: Share2,
			href: "https://www.tiktok.com/@mealmate.sp"
		}
	];
	const legalItems = [{
		label: "Terms of Service",
		description: "The rules for using MealMate",
		icon: FileText,
		to: "/legal/terms"
	}, {
		label: "Privacy Policy",
		description: "How we handle your data",
		icon: Shield,
		to: "/legal/privacy"
	}];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-6 w-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl leading-tight",
							children: "Settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted-foreground",
							children: user?.email ?? "Sign in to sync your recipes"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GamificationCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePicker, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Profile",
				items: profileItems
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Account",
				items: accountItems
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Notifications",
				items: [
					{
						label: "MealMate updates",
						description: "Show product announcements in your notification history",
						icon: Bell,
						trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: productUpdatesEnabled,
							disabled: !user || notificationPreferences.isLoading || notificationBusy,
							onCheckedChange: (checked) => void updateNotificationPreferences({ productUpdatesEnabled: checked }),
							"aria-label": "MealMate product updates"
						})
					},
					{
						label: "Push notifications",
						description: "Allow browser notifications on this device",
						icon: Bell,
						trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: pushEnabled,
							disabled: !user || !productUpdatesEnabled || notificationPreferences.isLoading || notificationBusy,
							onCheckedChange: (checked) => void updateNotificationPreferences({ pushEnabled: checked }),
							"aria-label": "Push notifications"
						})
					},
					{
						label: "Notification history",
						description: "View unread and past MealMate updates",
						icon: Bell,
						to: "/notifications"
					}
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Appearance",
				items: [{
					label: resolved === "dark" ? "Dark mode" : "Light mode",
					description: resolved === "dark" ? "Easier on your eyes at night" : "Bright and airy interface",
					icon: resolved === "dark" ? Moon : Sun,
					onClick: () => setMode(resolved === "dark" ? "light" : "dark"),
					trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: resolved === "dark",
						onCheckedChange: (v) => setMode(v ? "dark" : "light"),
						"aria-label": "Dark mode"
					})
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Region",
				items: [{
					label: "Currency",
					description: "Prices shown throughout the app",
					icon: DollarSign,
					trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						onClick: (e) => e.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: currency,
							onValueChange: saveCurrency,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-[140px] rounded-full text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								align: "end",
								children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: c.code,
									children: [
										c.symbol,
										" ",
										c.code,
										" — ",
										c.name
									]
								}, c.code))
							})]
						})
					})
				}, {
					label: "App language",
					description: "Interface and recipe language",
					icon: Globe,
					trailing: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						onClick: (e) => e.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: lang,
							onValueChange: saveLanguage,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 w-[150px] rounded-full text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
								align: "end",
								children: LANGUAGES.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: l.code,
									children: l.name
								}, l.code))
							})]
						})
					})
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Privacy & Security",
				items: [{
					label: "Privacy Policy",
					description: "How we handle your data",
					icon: Shield,
					to: "/legal/privacy"
				}, {
					label: "Change password",
					description: "Send a secure reset link to your email",
					icon: UserCog,
					onClick: resetPassword
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Help & Support",
				items: supportItems
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "About MealMate",
				items: aboutItems
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Terms & Privacy",
				items: legalItems
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
					icon: Star,
					label: "Rate the app",
					onClick: rate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionCard, {
					icon: Share2,
					label: "Share MealMate",
					onClick: share
				})]
			}),
			user && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					onClick: signOut,
					className: "h-12 w-full rounded-2xl text-destructive hover:text-destructive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), "Log out"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-center text-xs text-muted-foreground",
				children: "MealMate · Made with care"
			})
		]
	});
}
function Section({ title, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
			children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: i > 0 ? "border-t border-border/70" : "",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { item })
			}, item.label))
		})]
	});
}
function Row({ item }) {
	const Icon = item.icon;
	const showChevron = !!(item.to || item.href) && !item.trailing;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-muted/60 active:bg-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-[18px] w-[18px]" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium leading-tight",
					children: item.label
				}), item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 truncate text-xs text-muted-foreground",
					children: item.description
				})]
			}),
			item.trailing ?? (showChevron ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }) : null)
		]
	});
	if (item.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: item.href,
		target: item.href.startsWith("http") ? "_blank" : void 0,
		rel: "noreferrer",
		className: "block",
		children: body
	});
	if (item.to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: item.to,
		className: "block",
		children: body
	});
	if (item.onClick && !item.trailing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: item.onClick,
		className: "block w-full text-left",
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: body });
}
function ActionCard({ icon: Icon, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "group flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-[18px] w-[18px]" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-semibold",
			children: label
		})]
	});
}
//#endregion
export { SettingsPage as component };
