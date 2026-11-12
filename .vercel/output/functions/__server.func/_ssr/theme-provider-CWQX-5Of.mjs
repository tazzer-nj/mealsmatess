import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/theme-provider-CWQX-5Of.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "mealmate-theme";
var ThemeContext = (0, import_react.createContext)(null);
function systemPref() {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
var DARK_APP_ICON = "/favicon.png";
var LIGHT_APP_ICON = "/favicon.png";
function applyTheme(resolved) {
	const root = document.documentElement;
	root.classList.toggle("dark", resolved === "dark");
	root.dataset["theme"] = resolved;
	const icon = resolved === "dark" ? DARK_APP_ICON : LIGHT_APP_ICON;
	for (const rel of ["icon", "apple-touch-icon"]) {
		const link = document.querySelector(`link[rel="${rel}"]`);
		if (link) link.href = icon;
	}
}
function ThemeProvider({ children }) {
	const [mode, setModeState] = (0, import_react.useState)("system");
	const [resolved, setResolved] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		const initial = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
		setModeState(initial);
		const r = initial === "system" ? systemPref() : initial;
		setResolved(r);
		applyTheme(r);
	}, []);
	(0, import_react.useEffect)(() => {
		if (mode !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => {
			const r = systemPref();
			setResolved(r);
			applyTheme(r);
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [mode]);
	const setMode = (0, import_react.useCallback)((m) => {
		setModeState(m);
		window.localStorage.setItem(STORAGE_KEY, m);
		const r = m === "system" ? systemPref() : m;
		setResolved(r);
		applyTheme(r);
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		mode,
		resolved,
		setMode
	}), [
		mode,
		resolved,
		setMode
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value,
		children
	});
}
function useTheme() {
	const ctx = (0, import_react.useContext)(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
//#endregion
export { useTheme as n, ThemeProvider as t };
