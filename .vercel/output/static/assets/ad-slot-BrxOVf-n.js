import { r as __toESM } from "./rolldown-runtime-DC62tzP2.js";
import { t as require_react } from "./react-EWLbHI2A.js";
import { t as Link } from "./link-DqHkHLEB.js";
import { t as require_jsx_runtime } from "./jsx-runtime-D5J9-8SJ.js";
import { t as useQuery } from "./useQuery-C9s6b3XV.js";
import { t as createLucideIcon } from "./createLucideIcon-5qODTz61.js";
import { t as Megaphone } from "./megaphone-tG2AYarH.js";
import { t as cn } from "./utils-B301wYFs.js";
import { t as firebaseData } from "./firebase-data-8L_7gg2z.js";
import { Mt as ExternalLink, Ut as usePremium } from "./index-CfUBRHG1.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SlidersHorizontal = createLucideIcon("sliders-horizontal", [
	["path", {
		d: "M10 5H3",
		key: "1qgfaw"
	}],
	["path", {
		d: "M12 19H3",
		key: "yhmn1j"
	}],
	["path", {
		d: "M14 3v4",
		key: "1sua03"
	}],
	["path", {
		d: "M16 17v4",
		key: "1q0r14"
	}],
	["path", {
		d: "M21 12h-9",
		key: "1o4lsq"
	}],
	["path", {
		d: "M21 19h-5",
		key: "1rlt1p"
	}],
	["path", {
		d: "M21 5h-7",
		key: "1oszz2"
	}],
	["path", {
		d: "M8 10v4",
		key: "tgpxqk"
	}],
	["path", {
		d: "M8 12H3",
		key: "a7s4jb"
	}]
]);
//#endregion
//#region src/components/ad-slot.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
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
//#endregion
export { SlidersHorizontal as n, AdSlot as t };
