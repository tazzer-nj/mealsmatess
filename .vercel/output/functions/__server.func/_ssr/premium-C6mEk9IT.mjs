import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { D as ShieldCheck, F as Refrigerator, Jt as CalendarCheck, K as Mic, M as ScanLine, Ot as Compass, Vt as Check, Yt as Bot, a as Utensils, nn as ArrowLeft, rt as LoaderCircle, x as Sparkles } from "../_libs/lucide-react.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as verifyCheckout, i as redeemPromoCode, n as createPurchaseSession, o as verifyMyPremium, r as getIntroCompletion } from "./billing2.functions-CEnn8pYc.mjs";
import { n as Capacitor } from "../_libs/capacitor__app+capacitor__core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/premium-C6mEk9IT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function planKind(identifier, product, period) {
	const key = `${identifier}_${product}`.toLowerCase();
	if (/(?:^|[_.-])family(?:$|[_.-])/.test(key)) return "family";
	if (/(?:^|[_.-])lifetime(?:$|[_.-])/.test(key) || period === "") {
		if (/lifetime|forever|one.?time/.test(key)) return "family";
	}
	if (period === "P1Y" || /(?:^|[_.-])(?:annual|yearly)(?:$|[_.-])/.test(key)) return "yearly";
	if (period === "P1M" || /(?:^|[_.-])monthly(?:$|[_.-])/.test(key)) return "monthly";
	return null;
}
function periodLabel(iso) {
	if (!iso) return "once";
	const match = /^P(\d+)([DWMY])$/.exec(iso);
	if (!match) return "billing period";
	const unit = {
		D: "day",
		W: "week",
		M: "month",
		Y: "year"
	}[match[2]];
	return Number(match[1]) === 1 ? unit : `${match[1]} ${unit}s`;
}
function sevenDayTrial(iso, hasIntroPrice) {
	return !hasIntroPrice && (iso === "P7D" || iso === "P1W") ? 7 : 0;
}
function purchaseWasCancelled(error) {
	if (!error || typeof error !== "object") return false;
	const e = error;
	return e.userCancelled === true || e.errorCode === 1 || String(e.code) === "1";
}
var nativeUser = null;
var webUser = null;
var queue = Promise.resolve();
function loadBillingStore(identity) {
	const task = queue.catch(() => void 0).then(() => configureStore(identity));
	queue = task;
	return task;
}
async function configureStore(identity) {
	if (Capacitor.isNativePlatform()) {
		if (Capacitor.getPlatform() !== "android" || !identity.androidApiKey) throw new Error("Purchases are not available on this device yet. Please try again later.");
		const { Purchases } = await import("../_libs/@revenuecat/purchases-capacitor+[...].mjs").then((n) => n.t);
		if (!nativeUser) await Purchases.configure({
			apiKey: identity.androidApiKey,
			appUserID: identity.appUserId
		});
		else if (nativeUser !== identity.appUserId) await Purchases.logIn({ appUserID: identity.appUserId });
		nativeUser = identity.appUserId;
		const offerings = await Purchases.getOfferings();
		const plans = (offerings.all[identity.offering]?.availablePackages ?? offerings.current?.availablePackages ?? []).flatMap((pkg) => {
			const product = pkg.product;
			const option = product.defaultOption;
			if (!option || option.isPrepaid || option.installmentsInfo || option.introPhase) return [];
			const iso = option.billingPeriod?.iso8601 ?? product.subscriptionPeriod ?? "";
			const kind = planKind(pkg.identifier, product.identifier, iso);
			if (!kind) return [];
			return [{
				id: pkg.identifier,
				kind,
				price: option.fullPricePhase?.price.formatted ?? product.priceString,
				period: periodLabel(iso),
				trialDays: sevenDayTrial(option.freePhase?.billingPeriod.iso8601, !!option.introPhase),
				purchase: () => Purchases.purchaseSubscriptionOption({ subscriptionOption: option })
			}];
		});
		if (!plans.length) throw new Error("Subscription plans are temporarily unavailable. Please try again.");
		return {
			plans,
			restore: () => Purchases.restorePurchases()
		};
	}
	if (!identity.webApiKey) throw new Error("Web subscriptions are not configured. Add REVENUECAT_WEB_PUBLIC_KEY (Web Billing or Test Store public key) in Vercel.");
	const { Purchases } = await import("../_libs/revenuecat__purchases-js.mjs").then((n) => n.t);
	const sdk = webUser ? Purchases.getSharedInstance() : Purchases.configure({
		apiKey: identity.webApiKey,
		appUserId: identity.appUserId
	});
	if (webUser && webUser !== identity.appUserId) await sdk.changeUser(identity.appUserId);
	webUser = identity.appUserId;
	const offerings = await sdk.getOfferings();
	const plans = (offerings.all[identity.offering]?.availablePackages ?? offerings.current?.availablePackages ?? []).flatMap((pkg) => {
		const product = pkg.product;
		if (product.introPricePhase) return [];
		const iso = product.period ? `P${product.period.number}${product.period.unit[0].toUpperCase()}` : "";
		const kind = planKind(pkg.identifier, product.identifier, iso);
		if (!kind) return [];
		return [{
			id: pkg.identifier,
			kind,
			price: product.price.formattedPrice,
			period: periodLabel(iso),
			trialDays: sevenDayTrial(product.freeTrialPhase?.periodDuration, !!product.introPricePhase),
			purchase: () => sdk.purchase({
				rcPackage: pkg,
				skipSuccessPage: true
			})
		}];
	});
	if (!plans.length) throw new Error("Subscription plans are temporarily unavailable. Please try again.");
	return {
		plans,
		restore: () => sdk.getCustomerInfo()
	};
}
var BENEFITS = [
	{
		icon: Bot,
		title: "Your personal AI food companion",
		desc: "Mia, in your kitchen."
	},
	{
		icon: Utensils,
		title: "Intelligent recipe generation",
		desc: "Tailored to your taste and household."
	},
	{
		icon: ScanLine,
		title: "Smart ingredient scanning",
		desc: "Turn a photo into a recipe."
	},
	{
		icon: CalendarCheck,
		title: "Personalised meal planning",
		desc: "Weeks that plan themselves."
	},
	{
		icon: Refrigerator,
		title: "Pantry assistance",
		desc: "Cook with what you already have."
	},
	{
		icon: Compass,
		title: "Advanced food discovery",
		desc: "Find something new, easily."
	},
	{
		icon: Mic,
		title: "Voice conversations with Mia",
		desc: "Hands-free while you cook."
	}
];
var PLAN_LABEL = {
	monthly: "Monthly",
	yearly: "Yearly",
	family: "Family"
};
/** Percentage saved by the yearly plan versus paying monthly, when both prices parse. */
function yearlySaving(store) {
	if (!store) return null;
	const price = (kind) => {
		const plan = store.plans.find((p) => p.kind === kind);
		if (!plan) return null;
		const digits = plan.price.replace(/[^\d.,]/g, "").replace(/,/g, "");
		const value = Number.parseFloat(digits);
		return Number.isFinite(value) && value > 0 ? value : null;
	};
	const monthly = price("monthly");
	const yearly = price("yearly");
	if (!monthly || !yearly) return null;
	const saving = Math.round((1 - yearly / (monthly * 12)) * 100);
	return saving > 0 && saving < 100 ? saving : null;
}
function PremiumPaywall() {
	const { user, loading: sessionLoading } = useSession();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [store, setStore] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)("yearly");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [online, setOnline] = (0, import_react.useState)(true);
	const [message, setMessage] = (0, import_react.useState)("");
	const [pendingVerification, setPendingVerification] = (0, import_react.useState)(false);
	const [attempt, setAttempt] = (0, import_react.useState)(0);
	const [promoCode, setPromoCode] = (0, import_react.useState)("");
	const [promoOpen, setPromoOpen] = (0, import_react.useState)(false);
	const [promoBusy, setPromoBusy] = (0, import_react.useState)(false);
	const lock = (0, import_react.useRef)(false);
	const userId = user?.id;
	(0, import_react.useEffect)(() => {
		const update = () => setOnline(navigator.onLine);
		update();
		window.addEventListener("online", update);
		window.addEventListener("offline", update);
		return () => {
			window.removeEventListener("online", update);
			window.removeEventListener("offline", update);
		};
	}, []);
	async function routeNext() {
		if (!userId) {
			await navigate({
				to: "/auth",
				replace: true
			});
			return;
		}
		if (!await getIntroCompletion().catch(() => false)) await navigate({
			to: "/welcome",
			replace: true
		});
		else await navigate({
			to: "/",
			replace: true
		});
	}
	(0, import_react.useEffect)(() => {
		if (sessionLoading) return;
		let active = true;
		setLoading(true);
		setStore(null);
		setMessage("");
		createPurchaseSession().then(async (identity) => {
			if (!active) return null;
			if (identity.isActive) {
				await routeNext();
				return null;
			}
			return loadBillingStore(identity);
		}).then((next) => {
			if (!active || !next) return;
			setStore(next);
			setSelected(next.plans.find((p) => p.kind === "yearly")?.kind ?? next.plans[0].kind);
		}).catch((error) => {
			if (!active) return;
			const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
			if (/unavailable|temporarily|not available|plans|not configured|REVENUECAT/i.test(raw)) setMessage(raw);
			else if (/forbidden|401|403|unauthorized/i.test(raw)) setMessage("We couldn't start checkout from this page. Refresh and try again.");
			else if (!navigator.onLine) setMessage("You're offline. Connect to the internet and try again.");
			else setMessage("We couldn't load subscription plans. Check your connection and try again. If this continues, confirm RevenueCat web billing is configured.");
		}).finally(() => {
			if (active) setLoading(false);
		});
		return () => {
			active = false;
		};
	}, [
		userId,
		sessionLoading,
		attempt,
		navigate
	]);
	async function confirm() {
		for (let i = 0; i < 3; i++) {
			if ((userId ? await verifyMyPremium() : await verifyCheckout()).isPremium) {
				await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
				if (userId) await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
				await routeNext();
				return;
			}
			if (i < 2) await new Promise((resolve) => window.setTimeout(resolve, 1e3));
		}
		setPendingVerification(true);
		setMessage("Your subscription isn't confirmed yet. If you just purchased, check access again. You won't be charged by checking.");
	}
	async function applyPromo() {
		if (!userId) {
			setMessage("Sign in first, then enter your promo code.");
			return;
		}
		if (!promoCode.trim() || promoBusy || lock.current) return;
		lock.current = true;
		setPromoBusy(true);
		setMessage("");
		try {
			if ((await redeemPromoCode({ data: { code: promoCode.trim() } })).isPremium) {
				await queryClient.invalidateQueries({ queryKey: ["entitlement"] });
				await queryClient.invalidateQueries({ queryKey: ["user-flow-progress", userId] });
				setMessage("Promo applied — Premium is unlocked.");
				await routeNext();
				return;
			}
			setMessage("Promo could not be applied. Try again.");
		} catch {
			setMessage("That promo code is not valid, or you need to sign in and try again.");
		} finally {
			lock.current = false;
			setPromoBusy(false);
		}
	}
	async function perform(action) {
		if (lock.current || !online) return;
		lock.current = true;
		setBusy(true);
		setMessage("");
		try {
			if (action === "purchase") {
				const plan = store?.plans.find((p) => p.kind === selected);
				if (!plan) throw new Error("Plan unavailable");
				await plan.purchase();
				setPendingVerification(true);
			} else if (action === "restore") {
				if (store) await store.restore();
			}
			await confirm();
		} catch (error) {
			setMessage(purchaseWasCancelled(error) ? "Checkout cancelled. Choose a plan whenever you're ready." : "We couldn't confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.");
			if (!purchaseWasCancelled(error) && action === "purchase") setPendingVerification(true);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	}
	const plan = store?.plans.find((p) => p.kind === selected);
	const saving = yearlySaving(store);
	const disabled = loading || busy || !online;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "premium-flow mm-fade-in",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-lg px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void navigate({ to: "/" }),
							"aria-label": "Back to MealMate",
							className: "flex h-10 w-10 items-center justify-center rounded-full text-[#A1A1AA] transition-colors hover:bg-[#141414] hover:text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
								className: "h-[18px] w-[18px]",
								strokeWidth: 1.75
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[13px] font-medium tracking-[0.02em] text-[#A1A1AA]",
							children: ["MealMate", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-white",
								children: "."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-10 w-10",
							"aria-hidden": true
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 overflow-hidden rounded-[20px] border border-[#1E1E1E]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-[16/10] w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
								recipe: { name: "Creamy chicken alfredo" },
								size: "hero",
								priority: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									className: "h-3.5 w-3.5",
									strokeWidth: 1.75
								}), " MealMate Premium"]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-7 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[38px]",
					children: [
						"Make every meal",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"better."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[15px] leading-relaxed text-[#A1A1AA]",
					children: "Unlock your personal food companion. Discover recipes, plan meals and cook smarter with Mia."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-7 space-y-3.5",
					children: BENEFITS.map(({ icon: Icon, title, desc }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-white",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "h-4 w-4",
								strokeWidth: 1.75
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[14px] font-medium leading-tight text-white",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-[12.5px] text-[#71717A]",
								children: desc
							})]
						})]
					}, title))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "mt-8 space-y-2.5",
					disabled,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "sr-only",
						children: "Choose a subscription plan"
					}), loading ? [0, 1].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mm-skeleton h-[76px] w-full" }, i)) : [
						"monthly",
						"yearly",
						"family"
					].map((kind) => {
						const option = store?.plans.find((p) => p.kind === kind);
						if (!option) return null;
						const active = selected === kind;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex cursor-pointer items-center gap-3 rounded-[16px] border p-4 transition-colors duration-150 " + (active ? "border-white bg-[#171717]" : "border-[#262626] bg-[#141414] hover:border-[#303030]"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "subscription",
									value: kind,
									checked: active,
									onChange: () => setSelected(kind),
									className: "sr-only"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									className: "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border " + (active ? "border-white bg-white text-[#080808]" : "border-[#3F3F46]"),
									children: active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "h-3 w-3",
										strokeWidth: 3
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex flex-wrap items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[15px] font-medium text-white",
											children: PLAN_LABEL[kind] ?? kind
										}), kind === "yearly" && saving !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-full border border-white/20 px-2 py-0.5 text-[10.5px] font-medium text-white",
											children: [
												"Save ",
												saving,
												"%"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block text-[12px] text-[#71717A]",
										children: option.trialDays === 7 ? `7 days free, then ${option.price} / ${option.period}` : `Billed every ${option.period}`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[16px] font-semibold tracking-[-0.01em] text-white",
										children: option.price
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-[11.5px] text-[#71717A]",
										children: ["/ ", option.period]
									})]
								})
							]
						}, kind);
					})]
				}),
				!online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mm-alert mt-4",
					children: "You're offline. Connect to verify your subscription or make a purchase."
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "mm-alert mt-4",
					children: message
				}),
				!store && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mm-btn mm-btn-secondary mm-btn-block mt-4",
					onClick: () => setAttempt((n) => n + 1),
					disabled: busy || !online,
					children: "Try again"
				}),
				pendingVerification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mm-btn mm-btn-primary mm-btn-block mt-5",
					disabled: busy || !online,
					onClick: () => void perform("verify"),
					children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-[18px] w-[18px] animate-spin" }) : "Check subscription access"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mm-btn mm-btn-primary mm-btn-block mt-5",
					disabled: disabled || !plan,
					onClick: () => void perform("purchase"),
					children: busy || loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-[18px] w-[18px] animate-spin" }) : plan?.trialDays === 7 ? "Start 7-day free trial" : "Unlock MealMate Premium"
				}),
				plan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-center text-[11px] leading-relaxed text-[#71717A]",
					children: [plan.trialDays === 7 ? `7 days free, then ${plan.price} every ${plan.period}. ` : `${plan.price} billed every ${plan.period}. `, "Auto-renews until cancelled. Cancel before renewal in your store or billing account settings. Final taxes are confirmed at checkout."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center justify-center gap-3 text-[13px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void perform("restore"),
						disabled,
						className: "font-medium text-[#A1A1AA] underline-offset-4 transition-colors hover:text-white hover:underline disabled:opacity-50",
						children: "Restore purchases"
					}), !userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#3F3F46]",
						children: "·"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signin" },
						className: "font-medium text-[#A1A1AA] transition-colors hover:text-white",
						children: "Already subscribed?"
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 border-t border-[#1E1E1E] pt-4",
					children: promoOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "promo-code",
							type: "text",
							"aria-label": "Promo code",
							className: "mm-input",
							placeholder: "Enter promo code",
							value: promoCode,
							autoCapitalize: "none",
							autoCorrect: "off",
							spellCheck: false,
							disabled: busy || promoBusy || !online,
							onChange: (e) => setPromoCode(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									applyPromo();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mm-btn mm-btn-secondary shrink-0 px-5",
							disabled: busy || promoBusy || !online || !promoCode.trim(),
							onClick: () => void applyPromo(),
							children: promoBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Apply"
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setPromoOpen(true),
						className: "mx-auto block text-[12.5px] text-[#71717A] transition-colors hover:text-white",
						children: "Have a promo code?"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#52525B]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						className: "h-3.5 w-3.5",
						strokeWidth: 1.75
					}), " Secure checkout · Access after confirmation"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 flex items-center justify-center gap-2 text-[11px] text-[#71717A]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/terms",
							className: "transition-colors hover:text-white",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/privacy",
							className: "transition-colors hover:text-white",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/support",
							className: "transition-colors hover:text-white",
							children: "Help"
						})
					]
				})
			]
		})
	});
}
var SplitComponent = PremiumPaywall;
//#endregion
export { SplitComponent as component };
