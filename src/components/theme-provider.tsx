import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  APP_FONT_STORAGE_KEY,
  DEFAULT_APP_FONT,
  isAppFontId,
  type AppFontId,
} from "@/lib/app-fonts";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "mealmate-theme";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (m: ThemeMode) => void;
  font: AppFontId;
  setFont: (f: AppFontId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPref(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const DARK_APP_ICON = "/favicon.png";
const LIGHT_APP_ICON = "/favicon.png";

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset["theme"] = resolved;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = resolved === "dark" ? "#080808" : "#fafafa";
  const icon = resolved === "dark" ? DARK_APP_ICON : LIGHT_APP_ICON;
  for (const rel of ["icon", "apple-touch-icon"]) {
    const link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (link) link.href = icon;
  }
}

function applyAppFont(font: AppFontId) {
  document.documentElement.dataset["font"] = font;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");
  const [font, setFontState] = useState<AppFontId>(DEFAULT_APP_FONT);

  // Load stored appearance & font preferences on mount.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initial: ThemeMode =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setModeState(initial);
    const r = initial === "system" ? systemPref() : initial;
    setResolved(r);
    applyTheme(r);

    const storedFont = window.localStorage.getItem(APP_FONT_STORAGE_KEY);
    const initialFont = isAppFontId(storedFont) ? storedFont : DEFAULT_APP_FONT;
    setFontState(initialFont);
    applyAppFont(initialFont);
  }, []);

  // React to system changes when in system mode.
  useEffect(() => {
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

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    window.localStorage.setItem(STORAGE_KEY, m);
    const r = m === "system" ? systemPref() : m;
    setResolved(r);
    applyTheme(r);
  }, []);

  const setFont = useCallback((nextFont: AppFontId) => {
    setFontState(nextFont);
    window.localStorage.setItem(APP_FONT_STORAGE_KEY, nextFont);
    applyAppFont(nextFont);
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode, font, setFont }),
    [mode, resolved, setMode, font, setFont],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
