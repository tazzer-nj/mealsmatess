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
  ensureAppFontLoaded,
  isAppFontId,
  type AppFontId,
} from "@/lib/app-fonts";
import {
  LEGACY_APPEARANCE_STORAGE_KEY,
  LEGACY_MASCOT_STORAGE_KEY,
  THEME_SCHEME_STORAGE_KEY,
  THEME_V2_STORAGE_KEY,
  applyMealMateThemeToDom,
  getMealMateTheme,
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
  colorScheme: ThemeColorScheme;
  isPreviewing: boolean;
  accountLoaded: boolean;
  loadingAccount: boolean;
  saveStatus: ThemeSaveStatus;
  saveError: string | null;
  pendingThemeId: MealMateThemeId | null;
  isAuthenticated: boolean;
  previewTheme: (id: MealMateThemeId) => void;
  cancelPreview: () => void;
  applyTheme: (
    id?: MealMateThemeId,
    scheme?: ThemeColorScheme,
  ) => Promise<{ ok: boolean; error?: string }>;
  retrySave: () => Promise<{ ok: boolean; error?: string }>;
  clearSaveStatus: () => void;

  // Legacy appearance & font compatibility API
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (m: ThemeMode) => void;
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

function readStoredThemeScheme(themeId: MealMateThemeId): ThemeColorScheme | null {
  if (typeof window === "undefined") return null;
  try {
    const theme = getMealMateTheme(themeId);
    if (!theme.premium) return null;
    const stored = window.localStorage.getItem(THEME_SCHEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return null;
}

function writeLocalThemeStorage(
  themeId: MealMateThemeId,
  explicitMode?: ThemeMode,
  explicitScheme?: ThemeColorScheme | null,
) {
  if (typeof window === "undefined") return;
  try {
    const theme = getMealMateTheme(themeId);
    const effectiveScheme: ThemeColorScheme = theme.premium
      ? (explicitScheme ?? theme.colorScheme)
      : theme.colorScheme;
    window.localStorage.setItem(THEME_V2_STORAGE_KEY, themeId);
    window.localStorage.setItem(LEGACY_MASCOT_STORAGE_KEY, themeId);
    if (theme.premium) {
      window.localStorage.setItem(THEME_SCHEME_STORAGE_KEY, effectiveScheme);
    } else {
      window.localStorage.removeItem(THEME_SCHEME_STORAGE_KEY);
    }
    if (explicitMode) {
      window.localStorage.setItem(LEGACY_APPEARANCE_STORAGE_KEY, explicitMode);
    } else {
      const mappedMode: ThemeMode =
        themeId === "midnight-pro" && effectiveScheme === "dark" && explicitScheme === undefined
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
  colorScheme?: ThemeColorScheme | null,
): ResolvedTheme {
  const theme = getMealMateTheme(themeId);
  const effectiveScheme = theme.premium ? (colorScheme ?? theme.colorScheme) : theme.colorScheme;
  if (theme.id === "midnight-pro" && effectiveScheme === "dark") return "dark-premium";
  return effectiveScheme === "dark" ? "dark" : "light";
}

function deriveModeFromTheme(
  themeId: MealMateThemeId,
  colorScheme?: ThemeColorScheme | null,
  preferLegacyDarkPremium = false,
): ThemeMode {
  const theme = getMealMateTheme(themeId);
  const effectiveScheme = theme.premium ? (colorScheme ?? theme.colorScheme) : theme.colorScheme;
  if (preferLegacyDarkPremium && themeId === "midnight-pro" && effectiveScheme === "dark") {
    return "dark-premium";
  }
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
  const [schemeOverride, setSchemeOverride] = useState<ThemeColorScheme | null>(() =>
    readStoredThemeScheme(readStoredThemeId()),
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
  const colorScheme = useMemo<ThemeColorScheme>(() => {
    if (!displayTheme.premium) return displayTheme.colorScheme;
    return schemeOverride ?? displayTheme.colorScheme;
  }, [displayTheme, schemeOverride]);
  const resolved = useMemo(
    () => deriveResolvedFromTheme(displayThemeId, colorScheme),
    [displayThemeId, colorScheme],
  );

  // Synchronize initial mount font + DOM theme without flashing.
  useEffect(() => {
    const storedMode = readStoredAppearanceMode();
    const initialId = readStoredThemeId();
    const initialScheme = readStoredThemeScheme(initialId);
    setModeState(storedMode);
    setActiveThemeId(initialId);
    setSchemeOverride(initialScheme);
    const effectiveScheme = getMealMateTheme(initialId).premium
      ? (initialScheme ?? (storedMode === "system" ? systemPref() : undefined))
      : undefined;
    applyMealMateThemeToDom(initialId, {
      colorScheme: effectiveScheme,
      legacyDatasetTheme:
        storedMode === "system"
          ? systemPref()
          : deriveResolvedFromTheme(initialId, effectiveScheme),
    });

    try {
      const storedFont = window.localStorage.getItem(APP_FONT_STORAGE_KEY);
      const initialFont = isAppFontId(storedFont) ? storedFont : DEFAULT_APP_FONT;
      setFontState(initialFont);
      ensureAppFontLoaded(initialFont);
      document.documentElement.dataset["font"] = initialFont;
    } catch {
      document.documentElement.dataset["font"] = DEFAULT_APP_FONT;
    }
  }, []);

  // Re-apply DOM CSS variables whenever displayed theme or scheme changes.
  useEffect(() => {
    applyMealMateThemeToDom(displayThemeId, {
      colorScheme,
      legacyDatasetTheme:
        mode === "system" && !displayTheme.premium
          ? systemPref()
          : deriveResolvedFromTheme(displayThemeId, colorScheme),
    });
  }, [displayThemeId, displayTheme.premium, colorScheme, mode]);

  // Follow OS dark/light preference only while mode === "system".
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (activeTheme.premium) {
        const nextScheme: ThemeColorScheme = mq.matches ? "dark" : "light";
        setSchemeOverride(nextScheme);
        applyMealMateThemeToDom(activeThemeId, {
          colorScheme: nextScheme,
          legacyDatasetTheme: nextScheme,
        });
      } else {
        const nextId: MealMateThemeId = mq.matches ? "midnight-black" : "classic-light";
        setActiveThemeId(nextId);
        applyMealMateThemeToDom(nextId, { legacyDatasetTheme: mq.matches ? "dark" : "light" });
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode, activeTheme.premium, activeThemeId]);

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
          const remoteTheme = getMealMateTheme(remoteId);
          const remoteScheme =
            remoteTheme.premium && (res.scheme === "light" || res.scheme === "dark")
              ? res.scheme
              : null;
          setActiveThemeId(remoteId);
          setSchemeOverride(remoteScheme);
          setModeState(deriveModeFromTheme(remoteId, remoteScheme));
          writeLocalThemeStorage(remoteId, undefined, remoteScheme);
          applyMealMateThemeToDom(remoteId, {
            animate: false,
            colorScheme: remoteScheme ?? undefined,
          });
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
    const theme = getMealMateTheme(normalized);
    setPreviewThemeId(normalized);
    setSchemeOverride(null);
    applyMealMateThemeToDom(normalized, { animate: true, colorScheme: theme.colorScheme });
  }, []);

  const cancelPreview = useCallback(() => {
    setPreviewThemeId(null);
    const active = getMealMateTheme(activeThemeId);
    const restoredScheme = readStoredThemeScheme(activeThemeId) ?? active.colorScheme;
    setSchemeOverride(active.premium ? restoredScheme : null);
    applyMealMateThemeToDom(activeThemeId, {
      animate: true,
      colorScheme: restoredScheme,
    });
  }, [activeThemeId]);

  const persistToAccount = useCallback(
    async (
      targetId: MealMateThemeId,
      explicitScheme?: ThemeColorScheme | null,
    ): Promise<{ ok: boolean; error?: string }> => {
      const theme = getMealMateTheme(targetId);
      const nextScheme = theme.premium ? (explicitScheme ?? theme.colorScheme) : theme.colorScheme;

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
        await saveMyTheme({
          data:
            theme.premium && nextScheme !== theme.colorScheme
              ? { themeId: theme.id, scheme: nextScheme }
              : { themeId: theme.id },
        });
        userHasEditedRef.current = true;
        setActiveThemeId(theme.id);
        setPreviewThemeId(null);
        setSchemeOverride(theme.premium ? nextScheme : null);
        setModeState(deriveModeFromTheme(theme.id, nextScheme));
        writeLocalThemeStorage(theme.id, undefined, nextScheme);
        applyMealMateThemeToDom(theme.id, { animate: true, colorScheme: nextScheme });
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
    async (
      id?: MealMateThemeId,
      explicitScheme?: ThemeColorScheme,
    ): Promise<{ ok: boolean; error?: string }> => {
      const targetId = normalizeThemeId(id ?? previewThemeId ?? activeThemeId);
      const theme = getMealMateTheme(targetId);
      const targetScheme: ThemeColorScheme = theme.premium
        ? (explicitScheme ??
          (previewThemeId === targetId && schemeOverride ? schemeOverride : theme.colorScheme))
        : theme.colorScheme;

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
        setSchemeOverride(null);
        setModeState(deriveModeFromTheme(targetId));
        writeLocalThemeStorage(targetId);
        applyMealMateThemeToDom(targetId, { animate: true });
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
      setSchemeOverride(theme.premium ? targetScheme : null);
      applyMealMateThemeToDom(targetId, { animate: true, colorScheme: targetScheme });

      const result = await persistToAccount(targetId, targetScheme);
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
    [previewThemeId, activeThemeId, schemeOverride, user, persistToAccount],
  );

  const retrySave = useCallback(async () => {
    const target = pendingThemeId ?? previewThemeId ?? activeThemeId;
    const theme = getMealMateTheme(target);
    const result = await persistToAccount(
      target,
      theme.premium ? (schemeOverride ?? theme.colorScheme) : theme.colorScheme,
    );
    if (result.ok) {
      toast.success(`${theme.name} saved to your account`);
    } else {
      toast.error("Save still failed", { description: result.error });
    }
    return result;
  }, [pendingThemeId, previewThemeId, activeThemeId, schemeOverride, persistToAccount]);

  const clearSaveStatus = useCallback(() => {
    setSaveStatus("idle");
    setSaveError(null);
    setPendingThemeId(null);
  }, []);

  const setMode = useCallback(
    (m: ThemeMode) => {
      userHasEditedRef.current = true;

      if (m === "dark-premium") {
        setModeState("dark-premium");
        setPreviewThemeId(null);
        setSchemeOverride("dark");
        setActiveThemeId("midnight-pro");
        writeLocalThemeStorage("midnight-pro", "dark-premium", "dark");
        applyMealMateThemeToDom("midnight-pro", {
          animate: true,
          colorScheme: "dark",
          legacyDatasetTheme: "dark-premium",
        });
        if (user) {
          void persistToAccount("midnight-pro", "dark");
        }
        return;
      }

      const targetScheme: ThemeColorScheme =
        m === "dark" ? "dark" : m === "light" ? "light" : systemPref();
      const targetTheme = getMealMateTheme(previewThemeId ?? activeThemeId);
      const keepPremiumTheme = targetTheme.premium && mode !== "dark-premium";

      if (keepPremiumTheme) {
        setModeState(m);
        setSchemeOverride(targetScheme);
        if (previewThemeId) {
          applyMealMateThemeToDom(targetTheme.id, {
            animate: true,
            colorScheme: targetScheme,
            legacyDatasetTheme: targetScheme,
          });
          return;
        }
        writeLocalThemeStorage(targetTheme.id, m, targetScheme);
        applyMealMateThemeToDom(targetTheme.id, {
          animate: true,
          colorScheme: targetScheme,
          legacyDatasetTheme: targetScheme,
        });
        if (user) {
          void persistToAccount(targetTheme.id, targetScheme);
        }
        return;
      }

      setModeState(m);
      setPreviewThemeId(null);
      setSchemeOverride(null);
      const nextThemeId: MealMateThemeId =
        targetScheme === "dark" ? "midnight-black" : "classic-light";
      setActiveThemeId(nextThemeId);
      writeLocalThemeStorage(nextThemeId, m, null);
      applyMealMateThemeToDom(nextThemeId, {
        animate: true,
        legacyDatasetTheme: m === "system" ? systemPref() : m,
      });

      if (user) {
        void persistToAccount(nextThemeId, null);
      }
    },
    [activeThemeId, previewThemeId, mode, user, persistToAccount],
  );

  const setFont = useCallback((nextFont: AppFontId) => {
    setFontState(nextFont);
    ensureAppFontLoaded(nextFont);
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
      colorScheme,
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
      setMode,
      font,
      setFont,
    }),
    [
      activeThemeId,
      activeTheme,
      previewThemeId,
      displayThemeId,
      displayTheme,
      colorScheme,
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
      setMode,
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
