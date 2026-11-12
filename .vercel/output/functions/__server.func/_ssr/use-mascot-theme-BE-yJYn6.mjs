import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as firebaseData } from "./firebase-data-D9Xq6Pfn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-mascot-theme-BE-yJYn6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MASCOT_THEMES = [
	{
		id: "classic",
		name: "Classic",
		image: "/mascots/mascot-classic.png",
		accent: "oklch(0.12 0 0)",
		accentDark: "oklch(0.98 0 0)",
		accentForeground: "oklch(0.99 0 0)",
		premium: false
	},
	{
		id: "sunset",
		name: "Sunset Kitchen",
		image: "/mascots/mascot-sunset.webp",
		accent: "oklch(0.68 0.17 55)",
		accentDark: "oklch(0.76 0.16 60)",
		accentForeground: "oklch(0.15 0.03 50)",
		premium: true
	},
	{
		id: "midnight",
		name: "Midnight",
		image: "/mascots/mascot-midnight.webp",
		accent: "oklch(0.5 0.2 275)",
		accentDark: "oklch(0.7 0.15 275)",
		accentForeground: "oklch(0.99 0 0)",
		premium: true
	},
	{
		id: "ocean",
		name: "Ocean",
		image: "/mascots/mascot-ocean.webp",
		accent: "oklch(0.6 0.14 230)",
		accentDark: "oklch(0.75 0.12 225)",
		accentForeground: "oklch(0.15 0.03 230)",
		premium: true
	},
	{
		id: "cherry",
		name: "Cherry",
		image: "/mascots/mascot-cherry.webp",
		accent: "oklch(0.55 0.2 15)",
		accentDark: "oklch(0.7 0.17 12)",
		accentForeground: "oklch(0.99 0 0)",
		premium: true
	},
	{
		id: "matcha",
		name: "Matcha",
		image: "/mascots/mascot-matcha.webp",
		accent: "oklch(0.52 0.12 140)",
		accentDark: "oklch(0.74 0.13 138)",
		accentForeground: "oklch(0.99 0 0)",
		premium: true
	}
];
var THEME_STORAGE_KEY = "mealmate.theme.v1";
function getTheme(id) {
	return MASCOT_THEMES.find((t) => t.id === id) ?? MASCOT_THEMES[0];
}
/** Writes the accent tokens onto <html>. Only accent-type tokens change. */
function applyTheme(id, animate = false) {
	if (typeof document === "undefined") return;
	const root = document.documentElement;
	const t = getTheme(id);
	if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		root.classList.add("theme-transition");
		window.setTimeout(() => root.classList.remove("theme-transition"), 350);
	}
	root.dataset["mascot"] = t.id;
	root.style.setProperty("--brand", t.accent);
	root.style.setProperty("--brand-dark", t.accentDark);
	root.style.setProperty("--brand-foreground", t.accentForeground);
}
/** Inline script for <head> so the saved theme paints before React hydrates. */
var THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var m=${JSON.stringify(Object.fromEntries(MASCOT_THEMES.map((t) => [t.id, [
	t.accent,
	t.accentDark,
	t.accentForeground
]])))};var v=m[t]||m.classic;var r=document.documentElement;r.dataset.mascot=m[t]?t:"classic";r.style.setProperty("--brand",v[0]);r.style.setProperty("--brand-dark",v[1]);r.style.setProperty("--brand-foreground",v[2]);}catch(e){}})();`;
var ThemeCtx = (0, import_react.createContext)(null);
function MascotThemeProvider({ children }) {
	const { user } = useSession();
	const [themeId, setThemeId] = (0, import_react.useState)("classic");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const local = window.localStorage.getItem(THEME_STORAGE_KEY);
			if (local) setThemeId(getTheme(local).id);
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let active = true;
		firebaseData.from("profiles").select("theme").eq("id", user.id).maybeSingle().then(({ data, error }) => {
			if (error) {
				console.error("[theme] load failed", error);
				return;
			}
			const remote = data?.theme;
			if (active && remote) {
				const id = getTheme(remote).id;
				setThemeId(id);
				try {
					window.localStorage.setItem(THEME_STORAGE_KEY, id);
				} catch {}
			}
		});
		return () => {
			active = false;
		};
	}, [user]);
	(0, import_react.useEffect)(() => {
		applyTheme(themeId);
	}, [themeId]);
	const setTheme = (0, import_react.useCallback)(async (id) => {
		const previous = themeId;
		applyTheme(id, true);
		setThemeId(id);
		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, id);
		} catch {}
		if (!user) return;
		setSaving(true);
		const { error } = await firebaseData.from("profiles").update({ theme: id }).eq("id", user.id);
		setSaving(false);
		if (error) {
			console.error("[theme] save failed", error);
			toast.error("Couldn't save your theme to your account. Please try again.");
			applyTheme(previous, true);
			setThemeId(previous);
		}
	}, [themeId, user]);
	const value = (0, import_react.useMemo)(() => ({
		theme: getTheme(themeId),
		setTheme,
		saving
	}), [
		themeId,
		setTheme,
		saving
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCtx.Provider, {
		value,
		children
	});
}
function useMascotTheme() {
	const ctx = (0, import_react.useContext)(ThemeCtx);
	if (!ctx) throw new Error("useMascotTheme must be used inside <MascotThemeProvider>");
	return ctx;
}
//#endregion
export { useMascotTheme as i, MascotThemeProvider as n, THEME_BOOT_SCRIPT as r, MASCOT_THEMES as t };
