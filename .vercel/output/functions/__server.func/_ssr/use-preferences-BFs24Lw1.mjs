import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { Ct as ExternalLink, X as Megaphone } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { c as readLocalPreferences, l as writeLocalPreferences, n as PREFERENCES_EVENT, r as clearLocalPreferences, t as EMPTY_PREFERENCES } from "./preferences-CRPr2kaW.mjs";
import { t as usePremium } from "./use-premium-Dz4Ba5b3.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
import { n as saveMyPreferences, t as getMyPreferences } from "./preferences.functions-BC8eI4b9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-preferences-BFs24Lw1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Remotely managed sponsored placements — controlled from the ad_placements table. */
function adPlacementsQuery(slot) {
	return {
		queryKey: ["ad-placements", slot],
		staleTime: 3e5,
		queryFn: async () => {
			const { data, error } = await firebaseData.from("ad_placements").select("id, slot, title, body, image_url, cta_label, target_url, advertiser, weight, starts_at, ends_at").eq("slot", slot).eq("is_active", true).limit(10);
			if (error) throw error;
			const now = Date.now();
			return (data ?? []).filter((p) => (!p.starts_at || new Date(p.starts_at).getTime() <= now) && (!p.ends_at || new Date(p.ends_at).getTime() >= now));
		}
	};
}
/**
* Tasteful in-feed sponsored card. Renders nothing for Premium members,
* while their entitlement is still being checked, or when no placement is live.
*/
function AdSlot({ slot, className }) {
	const { isPremium, loading } = usePremium();
	const { data } = useQuery({
		...adPlacementsQuery(slot),
		enabled: !isPremium
	});
	const ad = (0, import_react.useMemo)(() => {
		if (!data?.length) return null;
		const pool = data.flatMap((p) => Array(Math.max(1, Math.min(p.weight, 5))).fill(p));
		return pool[Math.floor(Math.random() * pool.length)] ?? null;
	}, [data]);
	if (loading || isPremium || !ad) return null;
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 transition-colors hover:bg-card", className),
		children: [
			ad.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: ad.image_url,
				alt: "",
				loading: "lazy",
				className: "h-14 w-14 shrink-0 rounded-xl object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground",
						children: ["Sponsored", ad.advertiser ? ` · ${ad.advertiser}` : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold text-foreground",
						children: ad.title
					}),
					ad.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "line-clamp-2 text-xs text-muted-foreground",
						children: ad.body
					})
				]
			}),
			ad.cta_label && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground",
				children: [ad.cta_label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
			})
		]
	});
	const href = ad.target_url ?? "";
	if (href.startsWith("http")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		target: "_blank",
		rel: "noopener noreferrer sponsored",
		"aria-label": `Sponsored: ${ad.title}`,
		children: inner
	});
	if (href.startsWith("/")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		"aria-label": `Sponsored: ${ad.title}`,
		children: inner
	});
	return inner;
}
/**
* Preferences work for guests (local only) and sync up to the profile
* whenever a session exists. Local answers win when they are newer.
*/
function usePreferences() {
	const { user } = useSession();
	const [prefs, setPrefs] = (0, import_react.useState)(() => readLocalPreferences());
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const sync = () => setPrefs(readLocalPreferences());
		window.addEventListener(PREFERENCES_EVENT, sync);
		window.addEventListener("storage", sync);
		sync();
		setLoading(false);
		return () => {
			window.removeEventListener(PREFERENCES_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		(async () => {
			try {
				const local = readLocalPreferences();
				const remote = await getMyPreferences();
				if (cancelled) return;
				if (local?.onboarding_completed && (!remote?.onboarding_completed || (local.updated_at ?? "") > (remote.updated_at ?? "")) && local) {
					const { updated_at: _drop, ...rest } = local;
					await saveMyPreferences({ data: rest });
				} else if (remote?.onboarding_completed) writeLocalPreferences(remote);
			} catch {}
		})();
		return () => {
			cancelled = true;
		};
	}, [user]);
	const save = (0, import_react.useCallback)(async (next) => {
		writeLocalPreferences(next);
		setPrefs(next);
		if (user) {
			const { updated_at: _drop, ...rest } = next;
			try {
				await saveMyPreferences({ data: rest });
			} catch (err) {
				console.error("[preferences] save failed", err);
				throw err;
			}
		}
	}, [user]);
	const reset = (0, import_react.useCallback)(() => {
		clearLocalPreferences();
		setPrefs(null);
	}, []);
	return {
		preferences: prefs ?? EMPTY_PREFERENCES,
		hasPreferences: Boolean(prefs?.onboarding_completed),
		loading,
		save,
		reset
	};
}
//#endregion
export { usePreferences as n, AdSlot as t };
