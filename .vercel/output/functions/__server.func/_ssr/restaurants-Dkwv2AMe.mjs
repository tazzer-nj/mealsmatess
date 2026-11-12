import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { At as Clock3, C as SlidersHorizontal, G as Minus, K as Mic, L as Plus, Lt as ChevronRight, P as RotateCcw, T as ShoppingBag, Z as MapPin, Zt as Bike, b as Star, j as Search, n as X, nt as LocateFixed, pt as Heart, y as Store, zt as ChevronDown } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as RECIPE_PHOTOS } from "./recipe-image-6RW6Z0iJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as DialogOverlay, c as DialogTrigger, i as DialogDescription, n as DialogClose, o as DialogPortal, r as DialogContent, s as DialogTitle, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { o as personalize } from "./preferences-CRPr2kaW.mjs";
import { t as useCart } from "./cart-DfJUbDy7.mjs";
import { a as isOpenNow, i as haversineKm, o as money, r as formatDistance, s as useUserLocation } from "./bits-CMPYjCg6.mjs";
import { t as Skeleton } from "./skeleton-sb0rC7yB.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { t as useMarketplaceRealtime } from "./marketplace.realtime-B-w0rbk5.mjs";
import { n as usePreferences, t as AdSlot } from "./use-preferences-BFs24Lw1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restaurants-Dkwv2AMe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Sheet = Dialog;
var SheetTrigger = DialogTrigger;
var SheetPortal = DialogPortal;
var SheetOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
SheetOverlay.displayName = DialogOverlay.displayName;
var sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
	variants: { side: {
		top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
		bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
		left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
		right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
	} },
	defaultVariants: { side: "right" }
});
var SheetContent = import_react.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
	ref,
	className: cn(sheetVariants({ side }), className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	}), children]
})] }));
SheetContent.displayName = DialogContent.displayName;
var SheetHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
SheetHeader.displayName = "SheetHeader";
var SheetFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
SheetFooter.displayName = "SheetFooter";
var SheetTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
	ref,
	className: cn("text-lg font-semibold text-foreground", className),
	...props
}));
SheetTitle.displayName = DialogTitle.displayName;
var SheetDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
SheetDescription.displayName = DialogDescription.displayName;
/**
* Customer-side discovery data for the Restaurants tab. Everything here reads
* live rows written by the MealMate Partner Platform — no hardcoded content.
*/
var RESTAURANT_COLUMNS = "id,slug,name,description,cuisine,logo_url,cover_image_url,opening_hours,price_range,delivery_fee,delivery_radius_km,min_order_amount,delivery_estimate_minutes,currency,avg_rating,rating_count,is_verified,is_accepting_orders,paused_until,pause_message,supports_pickup,supports_delivery,address,restaurant_locations(latitude,longitude,label,is_active)";
/** One round trip per table, run in parallel. RLS limits rows to approved restaurants. */
var marketplaceFeedQuery = () => queryOptions({
	queryKey: ["marketplace-feed"],
	staleTime: 6e4,
	queryFn: async () => {
		const [restaurantsRes, promotionsRes, dishesRes] = await Promise.all([
			firebaseData.from("restaurants").select(RESTAURANT_COLUMNS).eq("approval_status", "approved").eq("is_demo", false).order("name").limit(60),
			firebaseData.from("restaurant_promotions").select("id,restaurant_id,code,title,description,kind,value,min_order_amount,max_discount_amount,starts_at,ends_at,is_active").eq("is_active", true).limit(60),
			firebaseData.from("menu_items").select("id,restaurant_id,name,description,image_url,price,category,dietary_tags,is_available").eq("is_available", true).eq("is_hidden", false).order("sort_order").limit(80)
		]);
		if (restaurantsRes.error) throw restaurantsRes.error;
		if (dishesRes.error) throw dishesRes.error;
		if (promotionsRes.error) console.error("[marketplace] promotions failed", promotionsRes.error);
		const now = Date.now();
		const promotions = (promotionsRes.data ?? []).map((p) => ({
			...p,
			value: Number(p.value ?? 0),
			min_order_amount: Number(p.min_order_amount ?? 0),
			max_discount_amount: p.max_discount_amount == null ? null : Number(p.max_discount_amount)
		})).filter((p) => {
			const startsOk = !p.starts_at || new Date(p.starts_at).getTime() <= now;
			const endsOk = !p.ends_at || new Date(p.ends_at).getTime() >= now;
			return startsOk && endsOk;
		});
		return {
			restaurants: (restaurantsRes.data ?? []).map((row) => ({
				...row,
				delivery_fee: Number(row.delivery_fee ?? 0),
				delivery_radius_km: Number(row.delivery_radius_km ?? 0),
				min_order_amount: Number(row.min_order_amount ?? 0),
				delivery_estimate_minutes: Number(row.delivery_estimate_minutes ?? 30),
				avg_rating: Number(row.avg_rating ?? 0),
				rating_count: Number(row.rating_count ?? 0),
				restaurant_locations: (row.restaurant_locations ?? []).filter((l) => l.is_active !== false).map((l) => ({
					latitude: Number(l.latitude),
					longitude: Number(l.longitude),
					label: l.label ?? null
				}))
			})),
			promotions,
			dishes: (dishesRes.data ?? []).map((d) => ({
				...d,
				price: Number(d.price ?? 0),
				dietary_tags: d.dietary_tags ?? []
			}))
		};
	}
});
var FAVOURITES_KEY = "mealmate.favourite-restaurants.v1";
var FAVOURITES_EVENT = "mealmate:favourites";
function readFavourites() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(FAVOURITES_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function useFavouriteRestaurants() {
	const [favourites, setFavourites] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const sync = () => setFavourites(readFavourites());
		sync();
		window.addEventListener(FAVOURITES_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(FAVOURITES_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	return {
		favourites,
		toggle: (0, import_react.useCallback)((id) => {
			const current = readFavourites();
			const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
			window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
			window.dispatchEvent(new Event(FAVOURITES_EVENT));
		}, []),
		isFavourite: (id) => favourites.includes(id)
	};
}
var DISCOVERY_CATEGORIES = [
	{
		key: "deals",
		label: "Hot Deals",
		emoji: "🔥",
		terms: []
	},
	{
		key: "pizza",
		label: "Pizza",
		emoji: "🍕",
		terms: ["pizza"]
	},
	{
		key: "fastfood",
		label: "Fast Food",
		emoji: "🍟",
		terms: [
			"fast",
			"fries",
			"kota",
			"takeaway"
		]
	},
	{
		key: "burgers",
		label: "Burgers",
		emoji: "🍔",
		terms: ["burger", "smash"]
	},
	{
		key: "chicken",
		label: "Chicken",
		emoji: "🍗",
		terms: [
			"chicken",
			"wings",
			"poultry"
		]
	},
	{
		key: "mexican",
		label: "Mexican",
		emoji: "🌮",
		terms: [
			"mexican",
			"taco",
			"burrito",
			"nacho"
		]
	},
	{
		key: "sushi",
		label: "Sushi",
		emoji: "🍣",
		terms: [
			"sushi",
			"maki",
			"sashimi",
			"japanese"
		]
	},
	{
		key: "healthy",
		label: "Healthy",
		emoji: "🥗",
		terms: [
			"healthy",
			"salad",
			"bowl",
			"vegan",
			"vegetarian"
		]
	},
	{
		key: "desserts",
		label: "Desserts",
		emoji: "🍰",
		terms: [
			"dessert",
			"cake",
			"sweet",
			"ice cream",
			"pudding"
		]
	},
	{
		key: "drinks",
		label: "Drinks",
		emoji: "🥤",
		terms: [
			"drink",
			"juice",
			"coffee",
			"smoothie",
			"soda"
		]
	}
];
function matchesCategory(category, haystack, hasDeal) {
	if (category === "deals") return hasDeal;
	const def = DISCOVERY_CATEGORIES.find((c) => c.key === category);
	if (!def) return true;
	const text = haystack.toLowerCase();
	return def.terms.some((t) => text.includes(t));
}
function promoHeadline(p, currency = "ZAR") {
	const amount = (n) => {
		try {
			return new Intl.NumberFormat(void 0, {
				style: "currency",
				currency,
				maximumFractionDigits: 0
			}).format(n);
		} catch {
			return `${currency} ${n.toFixed(0)}`;
		}
	};
	switch (p.kind) {
		case "percent_off": return `${Math.round(p.value)}% OFF`;
		case "amount_off": return `GET ${amount(p.value)} OFF`;
		case "free_delivery": return "FREE DELIVERY";
		case "bogo": return "BUY 1 GET 1";
		case "combo": return "COMBO DEAL";
		case "first_order": return "FIRST ORDER DEAL";
		default: return p.title.toUpperCase();
	}
}
var FILTERS = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "rated",
		label: "Top Rated"
	},
	{
		key: "fast",
		label: "Fast"
	},
	{
		key: "halal",
		label: "Halal"
	},
	{
		key: "vegetarian",
		label: "Vegetarian"
	},
	{
		key: "deals",
		label: "Deals"
	},
	{
		key: "under100",
		label: "Under R100"
	}
];
var FALLBACKS = Object.values(RECIPE_PHOTOS).map((photo) => photo.card);
function restaurantText(restaurant, dishes) {
	return `${restaurant.name} ${restaurant.cuisine ?? ""} ${restaurant.description ?? ""} ${dishes.filter((dish) => dish.restaurant_id === restaurant.id).map((dish) => `${dish.name} ${dish.category ?? ""} ${dish.dietary_tags.join(" ")}`).join(" ")}`.toLowerCase();
}
function sectionTitle(title, subtitle) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-3 flex items-end justify-between gap-4 px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-sans text-xl font-bold text-foreground",
				children: title
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: subtitle
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5 shrink-0 text-muted-foreground" })]
	});
}
function RestaurantsPage() {
	const navigate = useNavigate();
	const { data, isLoading, isError, refetch, isFetching } = useQuery(marketplaceFeedQuery());
	useMarketplaceRealtime();
	const { coords, state: geoState, request: requestLocation, clear: clearLocation } = useUserLocation();
	const { cart, addItem, setQuantity, count, subtotal } = useCart();
	const { preferences, hasPreferences } = usePreferences();
	const { isFavourite, toggle } = useFavouriteRestaurants();
	const [search, setSearch] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [slide, setSlide] = (0, import_react.useState)(0);
	const [locationLabel, setLocationLabel] = (0, import_react.useState)("Choose delivery location");
	const [manualLocation, setManualLocation] = (0, import_react.useState)("");
	const carouselRef = (0, import_react.useRef)(null);
	const restaurants = (0, import_react.useMemo)(() => data?.restaurants ?? [], [data?.restaurants]);
	const dishes = (0, import_react.useMemo)(() => data?.dishes ?? [], [data?.dishes]);
	const promotions = (0, import_react.useMemo)(() => data?.promotions ?? [], [data?.promotions]);
	const restaurantById = (0, import_react.useMemo)(() => new Map(restaurants.map((restaurant) => [restaurant.id, restaurant])), [restaurants]);
	const promoRestaurantIds = (0, import_react.useMemo)(() => new Set(promotions.map((promotion) => promotion.restaurant_id)), [promotions]);
	(0, import_react.useEffect)(() => {
		if (geoState === "granted") setLocationLabel("Current location");
	}, [geoState]);
	const rows = (0, import_react.useMemo)(() => restaurants.map((restaurant) => {
		const place = restaurant.restaurant_locations?.[0];
		return {
			restaurant,
			distance: coords && place ? haversineKm(coords, place) : null,
			hasDeal: promoRestaurantIds.has(restaurant.id)
		};
	}).filter(({ restaurant, distance, hasDeal }) => {
		const text = restaurantText(restaurant, dishes);
		const searchMatch = !search.trim() || text.includes(search.trim().toLowerCase());
		const categoryMatch = !category || matchesCategory(category, text, hasDeal);
		if (!searchMatch || !categoryMatch) return false;
		if (coords && distance != null && distance > Number(restaurant.delivery_radius_km ?? 10) + 5) return false;
		if (filter === "rated") return Number(restaurant.avg_rating) >= 4;
		if (filter === "fast") return restaurant.delivery_estimate_minutes <= 35;
		if (filter === "halal") return text.includes("halal");
		if (filter === "vegetarian") return text.includes("vegetarian") || text.includes("vegan");
		if (filter === "deals") return hasDeal;
		if (filter === "under100") return dishes.some((dish) => dish.restaurant_id === restaurant.id && Number(dish.price) < 100);
		return true;
	}).sort((a, b) => filter === "rated" ? Number(b.restaurant.avg_rating) - Number(a.restaurant.avg_rating) : filter === "fast" ? a.restaurant.delivery_estimate_minutes - b.restaurant.delivery_estimate_minutes : a.distance != null && b.distance != null ? a.distance - b.distance : Number(b.restaurant.avg_rating) - Number(a.restaurant.avg_rating)), [
		restaurants,
		coords,
		dishes,
		promoRestaurantIds,
		search,
		category,
		filter
	]);
	const visibleDishes = (0, import_react.useMemo)(() => dishes.filter((dish) => rows.some((row) => row.restaurant.id === dish.restaurant_id)), [dishes, rows]);
	const banners = (0, import_react.useMemo)(() => {
		if (promotions.length) return promotions.slice(0, 4);
		return restaurants.slice(0, 3).map((restaurant, index) => ({
			id: `feature-${restaurant.id}`,
			restaurant_id: restaurant.id,
			code: null,
			title: [
				"Grab your lunch fix",
				"New season. New flavours.",
				"Local favourites, delivered"
			][index] ?? "Made for your appetite",
			description: restaurant.description,
			kind: "feature",
			value: 0,
			min_order_amount: 0,
			max_discount_amount: null,
			starts_at: null,
			ends_at: null,
			is_active: true
		}));
	}, [promotions, restaurants]);
	(0, import_react.useEffect)(() => {
		if (banners.length < 2) return;
		const timer = window.setInterval(() => {
			const next = (slide + 1) % banners.length;
			setSlide(next);
			carouselRef.current?.scrollTo({
				left: carouselRef.current.clientWidth * next,
				behavior: "smooth"
			});
		}, 5e3);
		return () => window.clearInterval(timer);
	}, [banners.length, slide]);
	const addDish = (dish) => {
		const restaurant = restaurantById.get(dish.restaurant_id);
		if (!restaurant) return;
		const { replaced } = addItem({
			restaurant_id: restaurant.id,
			restaurant_slug: restaurant.slug,
			restaurant_name: restaurant.name,
			currency: restaurant.currency,
			delivery_fee: Number(restaurant.delivery_fee),
			min_order_amount: Number(restaurant.min_order_amount)
		}, {
			menu_item_id: dish.id,
			name: dish.name,
			unit_price: Number(dish.price),
			image_url: dish.image_url
		});
		toast.success(`${dish.name} added`, { ...replaced ? { description: "Your previous restaurant cart was cleared." } : {} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "marketplace-dark min-h-screen bg-background pb-36 text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-border bg-background/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Sheet, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							className: "h-auto max-w-full justify-start rounded-2xl px-2 py-1.5 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5 shrink-0 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[10px] font-semibold uppercase text-muted-foreground",
										children: "Deliver to"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-bold",
										children: locationLabel
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
						side: "bottom",
						className: "marketplace-dark rounded-t-3xl border-border bg-card pb-[max(1.5rem,env(safe-area-inset-bottom))]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
							className: "text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "font-sans text-xl font-bold",
								children: "Delivery location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Use your position or enter an area to personalise nearby restaurants." })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "h-12 w-full rounded-xl",
									onClick: requestLocation,
									disabled: geoState === "prompting",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {}), geoState === "prompting" ? "Finding you…" : "Use current location"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: manualLocation,
										onChange: (event) => setManualLocation(event.target.value),
										placeholder: "Suburb, address or landmark",
										className: "h-12 rounded-xl bg-muted pl-10"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "h-11 w-full rounded-xl",
									disabled: !manualLocation.trim(),
									onClick: () => {
										setLocationLabel(manualLocation.trim());
										clearLocation();
										toast.success("Delivery area updated");
									},
									children: "Set this location"
								}),
								geoState === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: "Location access was blocked. Enter your area instead."
								})
							]
						})]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: search,
								onChange: (event) => setSearch(event.target.value),
								placeholder: "Search restaurants, dishes",
								"aria-label": "Search restaurants and dishes",
								className: "h-13 rounded-2xl border-border bg-card pl-12 pr-12 text-base shadow-none focus-visible:ring-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "absolute right-1.5 top-1/2 h-10 w-10 -translate-y-1/2 rounded-xl",
								"aria-label": "Voice search",
								onClick: () => toast.info("Voice search is not available on this device"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "h-5 w-5" })
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl space-y-8 pt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						"aria-label": "Food categories",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-1",
							children: DISCOVERY_CATEGORIES.slice(0, 8).map((item, index) => {
								const image = dishes[index % Math.max(dishes.length, 1)]?.image_url || restaurants[index % Math.max(restaurants.length, 1)]?.cover_image_url;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									className: "h-auto w-20 shrink-0 snap-start flex-col gap-2 rounded-2xl p-0",
									onClick: () => setCategory(category === item.key ? null : item.key),
									"aria-pressed": category === item.key,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("grid h-16 w-16 place-items-center overflow-hidden rounded-full border bg-card text-lg font-black text-primary transition-transform active:scale-95", category === item.key ? "border-primary bg-primary/15 ring-2 ring-primary/30" : "border-border"),
										children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: image,
											alt: "",
											className: "h-full w-full object-cover"
										}) : item.label.slice(0, 1)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("w-full whitespace-normal text-center text-xs", category === item.key ? "font-bold text-primary" : "text-foreground"),
										children: item.label
									})]
								}, item.key);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						"aria-label": "Restaurant filters",
						className: "no-scrollbar flex gap-2 overflow-x-auto px-4",
						children: FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: filter === item.key ? "default" : "outline",
							className: "h-9 shrink-0 rounded-full px-4 shadow-none",
							onClick: () => setFilter(item.key),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: cn("h-3.5 w-3.5", item.key !== "all" && "hidden") }), item.label]
						}, item.key))
					}),
					isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketplaceSkeleton, {}) : isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-4 rounded-2xl border border-destructive/40 bg-card p-6 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "mx-auto h-8 w-8 text-muted-foreground" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-3 font-sans text-lg font-bold",
								children: "Restaurants didn't load"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Check your connection and try again."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "mt-4 rounded-full",
								onClick: () => refetch(),
								disabled: isFetching,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {}), "Try again"]
							})
						]
					}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyResults, { clear: () => {
						setSearch("");
						setCategory(null);
						setFilter("all");
					} }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						banners.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromoCarousel, {
							banners,
							restaurants: restaurantById,
							slide,
							setSlide,
							carouselRef
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [sectionTitle("Popular brands", "Local names people love"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "no-scrollbar flex snap-x gap-4 overflow-x-auto px-4",
							children: rows.slice(0, 8).map(({ restaurant }, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/restaurant/$slug",
								params: { slug: restaurant.slug },
								className: "w-21 shrink-0 snap-start text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-auto grid h-18 w-18 place-items-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
										children: restaurant.logo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: restaurant.logo_url,
											alt: `${restaurant.name} logo`,
											className: "h-full w-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xl font-black text-primary",
											children: restaurant.name.slice(0, 2).toUpperCase()
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-2 block truncate text-xs font-semibold",
										children: restaurant.name
									}),
									index === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "Ad"
									})
								]
							}, restaurant.id))
						})] }),
						visibleDishes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DishSection, {
							title: "Lunchtime just got better!",
							dishes: visibleDishes.slice(0, 8),
							restaurants: restaurantById,
							cart,
							addDish,
							setQuantity
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantSection, {
							title: "Recommended for you",
							rows: personalize(hasPreferences ? preferences : null, rows, (row) => [
								row.restaurant.name,
								row.restaurant.cuisine,
								row.restaurant.description
							]),
							promotions,
							isFavourite,
							toggle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlot, { slot: "restaurants" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantSection, {
							title: "Fast near you",
							rows: [...rows].sort((a, b) => a.restaurant.delivery_estimate_minutes - b.restaurant.delivery_estimate_minutes),
							promotions,
							isFavourite,
							toggle
						}),
						visibleDishes.some((dish) => Number(dish.price) < 100) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DishSection, {
							title: "Under R100",
							dishes: visibleDishes.filter((dish) => Number(dish.price) < 100).slice(0, 8),
							restaurants: restaurantById,
							cart,
							addDish,
							setQuantity
						}),
						promotions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantSection, {
							title: "Deals you'll love",
							rows: rows.filter((row) => row.hasDeal),
							promotions,
							isFavourite,
							toggle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestaurantSection, {
							title: "Popular in your area",
							rows: [...rows].sort((a, b) => Number(b.restaurant.avg_rating) - Number(a.restaurant.avg_rating)),
							promotions,
							isFavourite,
							toggle
						})
					] })
				]
			}),
			count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "fixed inset-x-4 bottom-20 z-40 mx-auto h-13 max-w-md justify-between rounded-2xl px-5 shadow-xl",
				onClick: () => navigate({ to: "/checkout" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {}),
						count,
						" item",
						count === 1 ? "" : "s"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [money(subtotal, cart?.currency), " · View cart"] })]
			})
		]
	});
}
function PromoCarousel({ banners, restaurants, slide, setSlide, carouselRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Offers",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: carouselRef,
			className: "no-scrollbar flex snap-x snap-mandatory overflow-x-auto",
			onScroll: (event) => {
				const width = event.currentTarget.clientWidth;
				if (width) setSlide(Math.round(event.currentTarget.scrollLeft / width));
			},
			children: banners.map((promo, index) => {
				const restaurant = restaurants.get(promo.restaurant_id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
					className: "w-full shrink-0 snap-center px-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-52 overflow-hidden rounded-3xl border border-border bg-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: restaurant?.cover_image_url || FALLBACKS[(index + 3) % FALLBACKS.length],
								alt: "Promotional food",
								className: "h-full w-full object-cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "marketplace-promo-overlay absolute inset-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-y-0 left-0 flex w-3/4 flex-col justify-center p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-2 text-xs font-bold uppercase text-primary",
										children: promoHeadline(promo, restaurant?.currency)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-sans text-2xl font-black text-market-hero",
										children: promo.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 text-sm text-market-hero/75",
										children: promo.description || restaurant?.name || "Fresh flavour, delivered."
									}),
									restaurant && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "sm",
										className: "mt-4 w-fit rounded-full",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/restaurant/$slug",
											params: { slug: restaurant.slug },
											children: ["Order now ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {})]
										})
									})
								]
							})
						]
					})
				}, promo.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 flex justify-center gap-1.5",
			children: banners.map((banner, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "h-5 w-5 rounded-full p-0",
				"aria-label": `Show offer ${index + 1}`,
				onClick: () => {
					setSlide(index);
					carouselRef.current?.scrollTo({
						left: carouselRef.current.clientWidth * index,
						behavior: "smooth"
					});
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 rounded-full transition-all", slide === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40") })
			}, banner.id))
		})]
	});
}
function DishSection({ title, dishes, restaurants, cart, addDish, setQuantity }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [sectionTitle(title), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-scrollbar flex snap-x gap-3 overflow-x-auto px-4",
		children: dishes.map((dish, index) => {
			const restaurant = restaurants.get(dish.restaurant_id);
			if (!restaurant) return null;
			const quantity = cart?.restaurant_id === restaurant.id ? cart.lines.find((line) => line.menu_item_id === dish.id)?.quantity ?? 0 : 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/restaurant/$slug",
					params: { slug: restaurant.slug },
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-32 overflow-hidden bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: dish.image_url || FALLBACKS[index % FALLBACKS.length],
							alt: dish.name,
							loading: "lazy",
							className: "h-full w-full object-cover transition-transform duration-500 hover:scale-105"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[10px] font-bold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mr-1 inline h-3 w-3" }),
								restaurant.delivery_estimate_minutes,
								" min"
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-bold",
								children: dish.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 truncate text-xs text-muted-foreground",
								children: restaurant.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm font-black",
								children: money(dish.price, restaurant.currency)
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-12 items-center justify-end px-2 pb-2",
					children: quantity > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "ghost",
								className: "h-8 w-8 rounded-full",
								onClick: () => setQuantity(dish.id, quantity - 1),
								"aria-label": `Remove one ${dish.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-5 text-center text-sm font-bold",
								children: quantity
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								className: "h-8 w-8 rounded-full",
								onClick: () => setQuantity(dish.id, quantity + 1),
								"aria-label": `Add one ${dish.name}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {})
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "h-8 rounded-full",
						onClick: () => addDish(dish),
						disabled: !restaurant.is_accepting_orders,
						children: "Add"
					})
				})]
			}, dish.id);
		})
	})] });
}
function RestaurantSection({ title, rows, promotions, isFavourite, toggle }) {
	if (!rows.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [sectionTitle(title), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-1",
		children: rows.slice(0, 10).map(({ restaurant, distance, hasDeal }, index) => {
			const promotion = promotions.find((item) => item.restaurant_id === restaurant.id);
			const open = isOpenNow(restaurant.opening_hours);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "w-[82%] max-w-80 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-40 overflow-hidden bg-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/restaurant/$slug",
							params: { slug: restaurant.slug },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: restaurant.cover_image_url || FALLBACKS[(index + 5) % FALLBACKS.length],
								alt: `${restaurant.name} food`,
								loading: "lazy",
								className: "h-full w-full object-cover transition-transform duration-500 hover:scale-105"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							variant: "secondary",
							className: "absolute right-2 top-2 h-9 w-9 rounded-full bg-background/90",
							onClick: () => toggle(restaurant.id),
							"aria-label": isFavourite(restaurant.id) ? `Remove ${restaurant.name} from favourites` : `Save ${restaurant.name}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("h-4 w-4", isFavourite(restaurant.id) && "fill-primary text-primary") })
						}),
						hasDeal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute bottom-2 left-2 rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-primary-foreground",
							children: promotion ? promoHeadline(promotion, restaurant.currency) : "DEAL"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/restaurant/$slug",
					params: { slug: restaurant.slug },
					className: "block p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate font-sans text-base font-bold",
									children: restaurant.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 truncate text-xs text-muted-foreground",
									children: restaurant.cuisine || "Local favourites"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-center gap-1 text-sm font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5 fill-primary text-primary" }), Number(restaurant.avg_rating || 0).toFixed(1)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mr-1 inline h-3.5 w-3.5" }),
									restaurant.delivery_estimate_minutes,
									" min"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bike, { className: "mr-1 inline h-3.5 w-3.5" }), Number(restaurant.delivery_fee) === 0 ? "Free" : money(restaurant.delivery_fee, restaurant.currency)] }),
								distance != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mr-1 inline h-3.5 w-3.5" }), formatDistance(distance)] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex items-center justify-between border-t border-border pt-3 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: open === false || !restaurant.is_accepting_orders ? "text-destructive" : "text-primary",
								children: open === false ? "Closed" : restaurant.is_accepting_orders ? "Open now" : "Not accepting orders"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: restaurant.price_range || "Delivery"
							})]
						})
					]
				})]
			}, restaurant.id);
		})
	})] });
}
function MarketplaceSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 px-4",
		"aria-label": "Loading restaurants",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 rounded-3xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-20 rounded-2xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-20 rounded-2xl" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-20 rounded-2xl" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-72 shrink-0 rounded-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-72 shrink-0 rounded-2xl" })]
			})
		]
	});
}
function EmptyResults({ clear }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-4 rounded-2xl border border-dashed border-border bg-card p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mx-auto h-9 w-9 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-sans text-lg font-bold",
				children: "Nothing matches yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Try another dish, cuisine or filter."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 rounded-full",
				onClick: clear,
				children: "Clear filters"
			})
		]
	});
}
//#endregion
export { RestaurantsPage as component };
