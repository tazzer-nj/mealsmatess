import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { D as ShieldCheck, Gt as Bot, P as Refrigerator, Wt as CalendarCheck, Zt as ArrowRight, a as Utensils, nt as LoaderCircle, x as Sparkles } from "../_libs/lucide-react.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { t as RecipeImage } from "./recipe-image-KYtS0QAS.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { a as verifyCheckout, i as redeemPromoCode, n as createPurchaseSession, o as verifyMyPremium, r as getIntroCompletion } from "./billing2.functions-CEnn8pYc.mjs";
import { n as Capacitor } from "../_libs/capacitor__app+capacitor__core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/premium-hk10U6L5.js
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
var VALUE_BENEFITS = [
	{
		icon: Bot,
		title: "AI-Powered Mia Assistant",
		desc: "Hands-free voice and interactive chat assistance directly in the kitchen."
	},
	{
		icon: Utensils,
		title: "Personalized Recipe Engine",
		desc: "Authentic meals tailored to your dietary restrictions, household and preferences."
	},
	{
		icon: CalendarCheck,
		title: "AI Weekly Meal Planning",
		desc: "Automated, waste-free schedules that sync directly with smart shopping lists."
	},
	{
		icon: Refrigerator,
		title: "Pantry & Fridge Cooking",
		desc: "Snap a photo of ingredients to unlock delicious recipes with what you have on hand."
	}
];
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
			else if (/forbidden|401|403|unauthorized/i.test(raw)) setMessage("We couldn’t start checkout from this page. Refresh and try again.");
			else if (!navigator.onLine) setMessage("You’re offline. Connect to the internet and try again.");
			else setMessage("We couldn’t load subscription plans. Check your connection and try again. If this continues, confirm RevenueCat web billing is configured.");
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
		setMessage("Your subscription isn’t confirmed yet. If you just purchased, check access again. You won’t be charged by checking.");
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
			setMessage(purchaseWasCancelled(error) ? "Checkout cancelled. Choose a plan whenever you’re ready." : "We couldn’t confirm your subscription. Please try again or restore purchases. If you were charged, check access before purchasing again.");
			if (!purchaseWasCancelled(error) && action === "purchase") setPendingVerification(true);
		} finally {
			lock.current = false;
			setBusy(false);
		}
	}
	const plan = store?.plans.find((p) => p.kind === selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "premium-flow paywall paywall-redesign",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "paywall-photo",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipeImage, {
				recipe: { name: "Creamy chicken alfredo" },
				size: "hero",
				priority: true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "paywall-photo-badge",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
					size: 14,
					className: "text-periwinkle",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "MealMate Premium" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "paywall-content",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "premium-eyebrow",
					children: "Unlock Full Access"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
					"Elevate your cooking.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Every single day." })
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "premium-description",
					children: "Experience personal AI chef Mia, tailored recipes, automated grocery planning, and smart pantry management."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "paywall-features-grid",
					children: VALUE_BENEFITS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "paywall-feature-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "paywall-feature-icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								size: 18,
								className: "text-periwinkle"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "paywall-feature-text",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "paywall-feature-title",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "paywall-feature-desc",
								children: item.desc
							})]
						})]
					}, item.title))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "premium-plans",
					disabled: busy || loading,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "sr-only",
						children: "Choose a subscription plan"
					}), [
						"monthly",
						"yearly",
						"family"
					].map((kind) => {
						const option = store?.plans.find((p) => p.kind === kind);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `premium-plan ${selected === kind && option ? "selected" : ""} ${!option ? "unavailable" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "subscription",
									value: kind,
									checked: !!option && selected === kind,
									disabled: !option,
									onChange: () => setSelected(kind)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "plan-name",
									children: [kind[0].toUpperCase() + kind.slice(1), kind === "yearly" && option && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "plan-badge",
										children: "Best value"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "plan-price",
									children: loading ? "Loading…" : option ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [option.price, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [" / ", option.period] })] }) : "Currently unavailable"
								}),
								option?.trialDays === 7 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "plan-trial",
									children: [
										"7 days free, then ",
										option.price,
										" / ",
										option.period
									]
								})
							]
						}, kind);
					})]
				}),
				!online && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "premium-notice",
					children: "You’re offline. Connect to verify your subscription or make a purchase."
				}),
				message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "status",
					className: "premium-notice",
					children: message
				}),
				!store && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "premium-secondary",
					onClick: () => setAttempt((n) => n + 1),
					disabled: busy || !online,
					children: "Try again"
				}),
				pendingVerification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "premium-primary",
					disabled: busy || !online,
					onClick: () => void perform("verify"),
					children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "animate-spin",
						size: 20
					}) : "Check subscription access"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "premium-primary",
					disabled: loading || busy || !online || !plan,
					onClick: () => void perform("purchase"),
					children: busy || loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
						className: "animate-spin",
						size: 20
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: plan?.trialDays === 7 ? "Start 7-day free trial" : "Subscribe" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						size: 18,
						"aria-hidden": "true"
					})] })
				}),
				plan && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "premium-terms",
					children: [
						plan.trialDays === 7 ? `7 days free, then ${plan.price} every ${plan.period}.` : `${plan.price} billed every ${plan.period}.`,
						" ",
						"Auto-renews until cancelled. Cancel before renewal in your store or billing account settings. Trial eligibility and final taxes are confirmed at checkout."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-promo",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "premium-promo-label",
							htmlFor: "promo-code",
							children: "Have a promo code?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "premium-promo-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "promo-code",
								type: "text",
								className: "premium-promo-input",
								placeholder: "Enter code",
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
								className: "premium-promo-apply",
								disabled: busy || promoBusy || !online || !promoCode.trim(),
								onClick: () => void applyPromo(),
								children: promoBusy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
									className: "animate-spin",
									size: 16
								}) : "Apply"
							})]
						}),
						!userId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "premium-promo-hint",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/auth",
									search: { mode: "signin" },
									children: "Sign in"
								}),
								" ",
								"to redeem a code."
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "premium-recovery",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void perform("restore"),
						disabled: busy || loading || !online,
						children: "Restore Purchases"
					}), !userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signin" },
						children: "Already subscribed? Sign in"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "premium-assurance",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
						size: 14,
						"aria-hidden": "true"
					}), " Secure checkout · Access after confirmation"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "premium-legal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/terms",
							children: "Terms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/legal/privacy",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/support",
							children: "Help"
						})
					]
				})
			]
		})]
	});
}
var SplitComponent = PremiumPaywall;
//#endregion
export { SplitComponent as component };
