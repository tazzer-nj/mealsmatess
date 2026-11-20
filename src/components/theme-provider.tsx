import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  APP_FONT_STORAGE_KEY,
  DEFAULT_APP_FONT,
  isAppFontId,
  type AppFontId,
} from "@/lib/app-fonts";
import {
  LEGACY_APPEARANCE_STORAGE_KEY,
  LEGACY_MASCOT_STORAGE_KEY,
  THEME_POLARITY_STORAGE_KEY,
  THEME_V2_STORAGE_KEY,
  applyMealMateThemeToDom,
  getMealMateTheme,
  getThemeTokensForScheme,
  isMealMateThemeId,
  normalizeThemeId,
  type MealMateTheme,
  type MealMateThemeId,
  type ThemeColorScheme,
} from "@/lib/themes";
import { getMyTheme, saveMyTheme } from "@/lib/preferences.functions";
import { useSession } from "@/hooks/use-session";

export type ThemeMode = "light" | "dark" | "dark-premium" | "system";
export type ResolvedTheme = "light" | "dark" | "dark-premium";
export type ThemeSaveStatus = "idle" | "saving" | "saved" | "error" | "unauthenticated";

type ThemeContextValue = {
  // Unified 8-theme API (2 default black & white + 6 logo themes)
  activeThemeId: MealMateThemeId;
  activeTheme: MealMateTheme;
  previewThemeId: MealMateThemeId | null;
  displayThemeId: MealMateThemeId;
  displayTheme: MealMateTheme;
  isPreviewing: boolean;
  accountLoaded: boolean;
  loadingAccount: boolean;
  saveStatus: ThemeSaveStatus;
  saveError: string | null;
  pendingThemeId: MealMateThemeId | null;
  isAuthenticated: boolean;
  previewTheme: (id: MealMateThemeId) => void;
  cancelPreview: () => void;
  applyTheme: (id?: MealMateThemeId) => Promise<{ ok: boolean; error?: string }>;
  retrySave: () => Promise<{ ok: boolean; error?: string }>;
  clearSaveStatus: () => void;

  // Legacy appearance & font compatibility API
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colorScheme: ThemeColorScheme;
  setMode: (m: ThemeMode) => void;
  setColorScheme: (scheme: ThemeColorScheme) => void;
  font: AppFontId;
  setFont: (f: AppFontId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredAppearanceMode(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(LEGACY_APPEARANCE_STORAGE_KEY);
    if (
      stored === "light" ||
      stored === "dark" ||
      stored === "dark-premium" ||
      stored === "system"
    ) {
      return stored;
    }
  } catch {
    /* storage unavailable */
  }
  return "system";
}

function readStoredThemeId(): MealMateThemeId {
  if (typeof window === "undefined") return "classic-light";
  try {
    const v2 = window.localStorage.getItem(THEME_V2_STORAGE_KEY);
    if (v2 && isMealMateThemeId(v2)) return v2;

    const ap = window.localStorage.getItem(LEGACY_APPEARANCE_STORAGE_KEY);
    if (ap === "dark-premium") return "midnight-pro";
    if (ap === "dark") return "midnight-black";
    if (ap === "light") return "classic-light";

    const legacyMascot = window.localStorage.getItem(LEGACY_MASCOT_STORAGE_KEY);
    if (legacyMascot) return normalizeThemeId(legacyMascot);
  } catch {
    /* storage unavailable */
  }
  return systemPref() === "dark" ? "midnight-black" : "classic-light";
}

function readStoredPolarity(): ThemeColorScheme | null {
  if (typeof window === "undefined") return null;
  try {
    const p = window.localStorage.getItem(THEME_POLARITY_STORAGE_KEY);
    if (p === "light" || p === "dark") return p;
  } catch {
    /* storage unavailable */
  }
  return null;
}

function writeStoredPolarity(polarity: ThemeColorScheme | null) {
  if (typeof window === "undefined") return;
  try {
    if (polarity) {
      window.localStorage.setItem(THEME_POLARITY_STORAGE_KEY, polarity);
    } else {
      window.localStorage.removeItem(THEME_POLARITY_STORAGE_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

function writeLocalThemeStorage(
  themeId: MealMateThemeId,
  explicitMode?: ThemeMode,
  polarity?: ThemeColorScheme | null,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_V2_STORAGE_KEY, themeId);
    window.localStorage.setItem(LEGACY_MASCOT_STORAGE_KEY, themeId);
    if (polarity !== undefined) {
      writeStoredPolarity(polarity);
    }
    if (explicitMode) {
      window.localStorage.setItem(LEGACY_APPEARANCE_STORAGE_KEY, explicitMode);
    } else {
      const theme = getMealMateTheme(themeId);
      const effectiveScheme = polarity ?? theme.colorScheme;
      const mappedMode: ThemeMode =
        themeId === "midnight-pro" && effectiveScheme === "dark"
          ? "dark-premium"
          : effectiveScheme === "dark"
            ? "dark"
            : "light";
      window.localStorage.setItem(LEGACY_APPEARANCE_STORAGE_KEY, mappedMode);
    }
  } catch {
    /* storage unavailable */
  }
}

function deriveResolvedFromTheme(
  themeId: MealMateThemeId,
  polarity?: ThemeColorScheme | null,
): ResolvedTheme {
  const theme = getMealMateTheme(themeId);
  const effectiveScheme = getThemeTokensForScheme(theme, polarity).colorScheme;
  if (theme.id === "midnight-pro" && effectiveScheme === "dark") return "dark-premium";
  return effectiveScheme === "dark" ? "dark" : "light";
}

function deriveModeFromTheme(
  themeId: MealMateThemeId,
  polarity?: ThemeColorScheme | null,
): ThemeMode {
  const theme = getMealMateTheme(themeId);
  const effectiveScheme = getThemeTokensForScheme(theme, polarity).colorScheme;
  if (themeId === "midnight-pro" && effectiveScheme === "dark") return "dark-premium";
  return effectiveScheme === "dark" ? "dark" : "light";
}

function formatThemeSaveError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  if (raw.includes("PREMIUM_REQUIRED:")) {
    return (
      raw.split("PREMIUM_REQUIRED:")[1]?.trim() || "Premium subscription required for this theme."
    );
  }
  if (/unauthorized|auth|401/i.test(raw)) {
    return "Your session expired. Sign in again to save your theme to your account.";
  }
  if (/network|fetch|timeout/i.test(raw)) {
    return "Connection issue while saving your theme. Check your internet and try again.";
  }
  return raw || "Couldn't save your theme to your account right now. Please try again.";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, loading: sessionLoading } = useSession();
  const [activeThemeId, setActiveThemeId] = useState<MealMateThemeId>(() => readStoredThemeId());
  const [previewThemeId, setPreviewThemeId] = useState<MealMateThemeId | null>(null);
  const [colorSchemeOverride, setColorSchemeOverride] = useState<ThemeColorScheme | null>(() =>
    readStoredPolarity(),
  );
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredAppearanceMode());
  const [font, setFontState] = useState<AppFontId>(DEFAULT_APP_FONT);
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [saveStatus, setSaveStatus] = useState<ThemeSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingThemeId, setPendingThemeId] = useState<MealMateThemeId | null>(null);

  const lastUserIdRef = useRef<string | null>(null);
  const userHasEditedRef = useRef(false);

  const displayThemeId = previewThemeId ?? activeThemeId;
  const activeTheme = useMemo(() => getMealMateTheme(activeThemeId), [activeThemeId]);
  const displayTheme = useMemo(() => getMealMateTheme(displayThemeId), [displayThemeId]);
  const effectiveColorScheme = useMemo(
    () => getThemeTokensForScheme(displayTheme, colorSchemeOverride).colorScheme,
    [displayTheme, colorSchemeOverride],
  );
  const resolved = useMemo(
    () => deriveResolvedFromTheme(displayThemeId, colorSchemeOverride),
    [displayThemeId, colorSchemeOverride],
  );

  // Synchronize initial mount font + DOM theme without flashing.
  useEffect(() => {
    const storedMode = readStoredAppearanceMode();
    const initialId = readStoredThemeId();
    const storedPolarity = readStoredPolarity();
    setModeState(storedMode);
    setActiveThemeId(initialId);
    setColorSchemeOverride(storedPolarity);
    applyMealMateThemeToDom(initialId, {
      colorSchemeOverride: storedPolarity,
      legacyDatasetTheme:
        storedMode === "system" ? systemPref() : deriveResolvedFromTheme(initialId, storedPolarity),
    });

    try {
      const storedFont = window.localStorage.getItem(APP_FONT_STORAGE_KEY);
      const initialFont = isAppFontId(storedFont) ? storedFont : DEFAULT_APP_FONT;
      setFontState(initialFont);
      document.documentElement.dataset["font"] = initialFont;
    } catch {
      document.documentElement.dataset["font"] = DEFAULT_APP_FONT;
    }
  }, []);

  // Re-apply DOM CSS variables whenever displayed theme or polarity changes.
  useEffect(() => {
    applyMealMateThemeToDom(displayThemeId, {
      colorSchemeOverride,
      legacyDatasetTheme:
        mode === "system"
          ? systemPref()
          : deriveResolvedFromTheme(displayThemeId, colorSchemeOverride),
    });
  }, [displayThemeId, mode, colorSchemeOverride]);

  // Follow OS dark/light preference only while mode === "system".
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const nextScheme: ThemeColorScheme = mq.matches ? "dark" : "light";
      const currentTheme = getMealMateTheme(activeThemeId);
      if (currentTheme.premium) {
        setColorSchemeOverride(nextScheme);
        applyMealMateThemeToDom(activeThemeId, {
          colorSchemeOverride: nextScheme,
          legacyDatasetTheme: nextScheme,
        });
      } else {
        const nextId: MealMateThemeId = mq.matches ? "midnight-black" : "classic-light";
        setActiveThemeId(nextId);
        setColorSchemeOverride(null);
        applyMealMateThemeToDom(nextId, { legacyDatasetTheme: nextScheme });
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, activeThemeId]);

  // Sync saved theme from authenticated account & keep synced across devices on window focus.
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      lastUserIdRef.current = null;
      userHasEditedRef.current = false;
      setAccountLoaded(false);
      setLoadingAccount(false);
      return;
    }

    const userChanged = lastUserIdRef.current !== user.id;
    if (userChanged) {
      lastUserIdRef.current = user.id;
      userHasEditedRef.current = false;
      setSaveStatus("idle");
      setSaveError(null);
      setPendingThemeId(null);
    }

    let cancelled = false;

    const syncFromAccount = async () => {
      setLoadingAccount(true);
      try {
        const res = await getMyTheme();
        if (cancelled) return;
        if (res?.themeId && !userHasEditedRef.current) {
          const remoteId = normalizeThemeId(res.themeId);
          setActiveThemeId(remoteId);
          setModeState(deriveModeFromTheme(remoteId));
          writeLocalThemeStorage(remoteId);
          applyMealMateThemeToDom(remoteId, { animate: false });
        }
        setAccountLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.error("[theme] account load failed", err);
        setAccountLoaded(true);
      } finally {
        if (!cancelled) setLoadingAccount(false);
      }
    };

    void syncFromAccount();

    const onFocus = () => {
      if (document.visibilityState === "visible" && !userHasEditedRef.current) {
        void syncFromAccount();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user, sessionLoading]);

  const previewTheme = useCallback((id: MealMateThemeId) => {
    const normalized = normalizeThemeId(id);
    setPreviewThemeId(normalized);
    setColorSchemeOverride(null);
    applyMealMateThemeToDom(normalized, { animate: true, colorSchemeOverride: null });
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewThemeId(null);
    const storedPolarity = readStoredPolarity();
    setColorSchemeOverride(storedPolarity);
    applyMealMateThemeToDom(activeThemeId, {
      animate: true,
      colorSchemeOverride: storedPolarity,
    });
  }, [activeThemeId]);

  const persistToAccount = useCallback(
    async (targetId: MealMateThemeId): Promise<{ ok: boolean; error?: string }> => {
      const theme = getMealMateTheme(targetId);

      if (!user) {
        const msg =
          "Sign in to save your theme to your account across devices. Applied on this device only.";
        setSaveStatus("unauthenticated");
        setSaveError(msg);
        setPendingThemeId(targetId);
        return { ok: false, error: msg };
      }

      setSaveStatus("saving");
      setSaveError(null);
      try {
        await saveMyTheme({ data: { themeId: theme.id } });
        userHasEditedRef.current = true;
        setActiveThemeId(theme.id);
        setPreviewThemeId(null);
        setColorSchemeOverride(null);
        setModeState(deriveModeFromTheme(theme.id, null));
        writeLocalThemeStorage(theme.id, undefined, null);
        applyMealMateThemeToDom(theme.id, { animate: true, colorSchemeOverride: null });
        setSaveStatus("saved");
        setSaveError(null);
        setPendingThemeId(null);
        return { ok: true };
      } catch (err) {
        const friendly = formatThemeSaveError(err);
        setSaveStatus("error");
        setSaveError(friendly);
        setPendingThemeId(theme.id);
        return { ok: false, error: friendly };
      }
    },
    [user],
  );

  const applyTheme = useCallback(
    async (id?: MealMateThemeId): Promise<{ ok: boolean; error?: string }> => {
      const targetId = normalizeThemeId(id ?? previewThemeId ?? activeThemeId);
      const theme = getMealMateTheme(targetId);

      // Unauthenticated users cannot save premium themes or sync to an account.
      if (!user) {
        if (theme.premium) {
          const msg = "Sign in with a MealMate Premium account to unlock and save premium themes.";
          setSaveStatus("unauthenticated");
          setSaveError(msg);
          setPendingThemeId(targetId);
          toast.info("Sign in required", { description: msg });
          return { ok: false, error: msg };
        }
        setActiveThemeId(targetId);
        setPreviewThemeId(null);
        setColorSchemeOverride(null);
        setModeState(deriveModeFromTheme(targetId, null));
        writeLocalThemeStorage(targetId, undefined, null);
        applyMealMateThemeToDom(targetId, { animate: true, colorSchemeOverride: null });
        const msg =
          "Applied on this device. Sign in to save this theme to your MealMate account across devices.";
        setSaveStatus("unauthenticated");
        setSaveError(msg);
        toast.info("Applied locally", {
          description: "Sign in to save your theme to your account across devices.",
        });
        return { ok: false, error: msg };
      }

      // Keep the chosen theme visible while saving; only commit active state on server confirmation.
      setPreviewThemeId(targetId);
      setColorSchemeOverride(null);
      applyMealMateThemeToDom(targetId, { animate: true, colorSchemeOverride: null });

      const result = await persistToAccount(targetId);
      if (result.ok) {
        toast.success(`${theme.name} applied`, {
          description: "Saved to your MealMate account.",
        });
      } else {
        toast.error("Couldn't save theme to your account", {
          description: result.error,
        });
      }
      return result;
    },
    [previewThemeId, activeThemeId, user, persistToAccount],
  );

  const retrySave = useCallback(async () => {
    const target = pendingThemeId ?? previewThemeId ?? activeThemeId;
    const result = await persistToAccount(target);
    if (result.ok) {
      const theme = getMealMateTheme(target);
      toast.success(`${theme.name} saved to your account`);
    } else {
      toast.error("Save still failed", { description: result.error });
    }
    return result;
  }, [pendingThemeId, previewThemeId, activeThemeId, persistToAccount]);

  const clearSaveStatus = useCallback(() => {
    setSaveStatus("idle");
    setSaveError(null);
    setPendingThemeId(null);
  }, []);

  const setColorScheme = useCallback(
    (scheme: ThemeColorScheme) => {
      userHasEditedRef.current = true;
      const targetId = previewThemeId ?? activeThemeId;
      const theme = getMealMateTheme(targetId);
      if (theme.premium && theme.altTokens) {
        const nextOverride = scheme === theme.colorScheme ? null : scheme;
        setColorSchemeOverride(nextOverride);
        setModeState(scheme);
        writeLocalThemeStorage(targetId, scheme, nextOverride);
        applyMealMateThemeToDom(targetId, {
          animate: true,
          colorSchemeOverride: nextOverride,
          legacyDatasetTheme:
            targetId === "midnight-pro" && scheme === "dark" ? "dark-premium" : scheme,
        });
      } else {
        const nextId: MealMateThemeId = scheme === "dark" ? "midnight-black" : "classic-light";
        setActiveThemeId(nextId);
        setPreviewThemeId(null);
        setColorSchemeOverride(null);
        setModeState(scheme);
        writeLocalThemeStorage(nextId, scheme, null);
        applyMealMateThemeToDom(nextId, { animate: true, legacyDatasetTheme: scheme });
        if (user) {
          void persistToAccount(nextId);
        }
      }
    },
    [activeThemeId, previewThemeId, user, persistToAccount],
  );

  const setMode = useCallback(
    (m: ThemeMode) => {
      userHasEditedRef.current = true;
      const currentTheme = getMealMateTheme(activeThemeId);

      // Preserve chosen premium colorway when toggling Light / Dark / System
      // (unless transitioning out of legacy "dark-premium" mode).
      if (m !== "dark-premium" && currentTheme.premium && mode !== "dark-premium") {
        const targetScheme: ThemeColorScheme =
          m === "system" ? systemPref() : m === "dark" ? "dark" : "light";
        const nextOverride = targetScheme === currentTheme.colorScheme ? null : targetScheme;
        setModeState(m);
        setPreviewThemeId(null);
        setColorSchemeOverride(nextOverride);
        writeLocalThemeStorage(activeThemeId, m, nextOverride);
        applyMealMateThemeToDom(activeThemeId, {
          animate: true,
          colorSchemeOverride: nextOverride,
          legacyDatasetTheme:
            activeThemeId === "midnight-pro" && targetScheme === "dark"
              ? "dark-premium"
              : targetScheme,
        });
        return;
      }

      setModeState(m);
      setPreviewThemeId(null);
      setColorSchemeOverride(null);

      const nextThemeId: MealMateThemeId =
        m === "dark-premium"
          ? "midnight-pro"
          : m === "dark"
            ? "midnight-black"
            : m === "light"
              ? "classic-light"
              : systemPref() === "dark"
                ? "midnight-black"
                : "classic-light";

      setActiveThemeId(nextThemeId);
      writeLocalThemeStorage(nextThemeId, m, null);
      applyMealMateThemeToDom(nextThemeId, {
        animate: true,
        legacyDatasetTheme: m === "system" ? systemPref() : m,
      });

      if (user) {
        void persistToAccount(nextThemeId);
      }
    },
    [activeThemeId, mode, user, persistToAccount],
  );

  const setFont = useCallback((nextFont: AppFontId) => {
    setFontState(nextFont);
    try {
      window.localStorage.setItem(APP_FONT_STORAGE_KEY, nextFont);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset["font"] = nextFont;
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeThemeId,
      activeTheme,
      previewThemeId,
      displayThemeId,
      displayTheme,
      isPreviewing: previewThemeId !== null && previewThemeId !== activeThemeId,
      accountLoaded,
      loadingAccount,
      saveStatus,
      saveError,
      pendingThemeId,
      isAuthenticated: Boolean(user),
      previewTheme,
      cancelPreview,
      applyTheme,
      retrySave,
      clearSaveStatus,
      mode,
      resolved,
      colorScheme: effectiveColorScheme,
      setMode,
      setColorScheme,
      font,
      setFont,
    }),
    [
      activeThemeId,
      activeTheme,
      previewThemeId,
      displayThemeId,
      displayTheme,
      accountLoaded,
      loadingAccount,
      saveStatus,
      saveError,
      pendingThemeId,
      user,
      previewTheme,
      cancelPreview,
      applyTheme,
      retrySave,
      clearSaveStatus,
      mode,
      resolved,
      effectiveColorScheme,
      setMode,
      setColorScheme,
      font,
      setFont,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useOptionalTheme() {
  return useContext(ThemeContext);
}
