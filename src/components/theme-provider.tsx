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
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as preferencesFns from "@/lib/preferences.functions";
import { auth, db } from "@/lib/firebase";
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
  accountSynced: boolean;
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

function isAdminUnconfiguredError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /Firebase Admin is not configured/i.test(msg);
}

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
    if (ap === "dark-premium") return "midnight";
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
        themeId === "midnight" &&
        getMealMateTheme(themeId).premium &&
        effectiveScheme === "dark" &&
        explicitScheme === undefined
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
  if (theme.id === "midnight" && theme.premium && effectiveScheme === "dark") return "dark-premium";
  return effectiveScheme === "dark" ? "dark" : "light";
}

function deriveModeFromTheme(
  themeId: MealMateThemeId,
  colorScheme?: ThemeColorScheme | null,
  preferLegacyDarkPremium = false,
): ThemeMode {
  const theme = getMealMateTheme(themeId);
  const effectiveScheme = theme.premium ? (colorScheme ?? theme.colorScheme) : theme.colorScheme;
  if (
    preferLegacyDarkPremium &&
    theme.id === "midnight" &&
    theme.premium &&
    effectiveScheme === "dark"
  ) {
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
  if (/NOT_FOUND/i.test(raw)) {
    return "Account database could not be reached right now (5 NOT_FOUND). Your previous theme was restored.";
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
  const [accountSynced, setAccountSynced] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [saveStatus, setSaveStatus] = useState<ThemeSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingThemeId, setPendingThemeId] = useState<MealMateThemeId | null>(null);

  const lastUserIdRef = useRef<string | null>(null);
  const userHasEditedRef = useRef(false);
  const pendingSchemeRef = useRef<ThemeColorScheme | null>(null);

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

  const readAccountTheme = useCallback(async (userId: string) => {
    try {
      return await preferencesFns.getMyTheme();
    } catch (err) {
      if (isAdminUnconfiguredError(err) && auth.currentUser?.uid === userId) {
        const snap = await getDoc(doc(db, "users", userId));
        const row = snap.exists() ? (snap.data() as Record<string, unknown>) : {};
        const raw = typeof row["theme"] === "string" ? row["theme"] : null;
        if (!raw) {
          return { themeId: null, scheme: null, updatedAt: null };
        }
        const [rawId, rawScheme] = raw.trim().toLowerCase().split(":");
        const normalized = isMealMateThemeId(rawId) ? rawId : normalizeThemeId(rawId);
        const scheme =
          rawScheme === "light" || rawScheme === "dark" ? (rawScheme as "light" | "dark") : null;
        return {
          themeId: normalized,
          scheme,
          updatedAt: typeof row["theme_updated_at"] === "string" ? row["theme_updated_at"] : null,
        };
      }
      throw err;
    }
  }, []);

  // Sync saved theme from authenticated account & keep synced across devices on window focus.
  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      lastUserIdRef.current = null;
      userHasEditedRef.current = false;
      pendingSchemeRef.current = null;
      setAccountLoaded(false);
      setAccountSynced(false);
      setLoadingAccount(false);
      return;
    }

    const userChanged = lastUserIdRef.current !== user.id;
    if (userChanged) {
      lastUserIdRef.current = user.id;
      userHasEditedRef.current = false;
      pendingSchemeRef.current = null;
      setSaveStatus("idle");
      setSaveError(null);
      setPendingThemeId(null);
      setAccountSynced(false);
    }

    let cancelled = false;

    const syncFromAccount = async () => {
      setLoadingAccount(true);
      try {
        const res = await readAccountTheme(user.id);
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
        if (typeof preferencesFns.getMyAppSettings === "function" && !userHasEditedRef.current) {
          try {
            const appSettings = await preferencesFns.getMyAppSettings();
            if (!cancelled && appSettings?.font && isAppFontId(appSettings.font)) {
              setFontState(appSettings.font);
              ensureAppFontLoaded(appSettings.font);
              document.documentElement.dataset["font"] = appSettings.font;
              try {
                window.localStorage.setItem(APP_FONT_STORAGE_KEY, appSettings.font);
              } catch {
                /* ignore */
              }
            }
          } catch {
            // Optional font sync failure shouldn't fail theme sync.
          }
        }
        setAccountLoaded(true);
        setAccountSynced(true);
      } catch (err) {
        if (cancelled) return;
        console.error("[theme] account load failed", err);
        setAccountLoaded(true);
        setAccountSynced(false);
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
  }, [user, sessionLoading, readAccountTheme]);

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

  const writeAccountTheme = useCallback(
    async (theme: MealMateTheme, nextScheme: ThemeColorScheme) => {
      const payload =
        theme.premium && nextScheme !== theme.colorScheme
          ? { themeId: theme.id, scheme: nextScheme }
          : { themeId: theme.id };
      try {
        return await preferencesFns.saveMyTheme({ data: payload });
      } catch (err) {
        if (user && isAdminUnconfiguredError(err) && auth.currentUser?.uid === user.id) {
          if (theme.premium) {
            const { verifyMyPremium } = await import("@/lib/billing.functions");
            const access = await verifyMyPremium().catch(() => null);
            if (!access?.isPremium) {
              throw new Error(
                `PREMIUM_REQUIRED: Upgrade to MealMate Premium to save the ${theme.name} theme to your account.`,
              );
            }
          }
          const storedTheme =
            theme.premium && nextScheme !== theme.colorScheme
              ? `${theme.id}:${nextScheme}`
              : theme.id;
          const updatedAt = new Date().toISOString();
          await setDoc(
            doc(db, "users", user.id),
            {
              id: user.id,
              theme: storedTheme,
              theme_updated_at: updatedAt,
              updatedAt,
            },
            { merge: true },
          );
          return { ok: true, themeId: theme.id, scheme: nextScheme, updatedAt };
        }
        throw err;
      }
    },
    [user],
  );

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
        setAccountSynced(false);
        setSaveError(msg);
        setPendingThemeId(targetId);
        pendingSchemeRef.current = nextScheme;
        return { ok: false, error: msg };
      }

      const previousTheme = getMealMateTheme(activeThemeId);
      const previousScheme = readStoredThemeScheme(activeThemeId) ?? previousTheme.colorScheme;

      setSaveStatus("saving");
      setSaveError(null);
      try {
        await writeAccountTheme(theme, nextScheme);
        userHasEditedRef.current = true;
        pendingSchemeRef.current = null;
        setActiveThemeId(theme.id);
        setPreviewThemeId(null);
        setSchemeOverride(theme.premium ? nextScheme : null);
        setModeState(deriveModeFromTheme(theme.id, nextScheme));
        writeLocalThemeStorage(theme.id, undefined, nextScheme);
        applyMealMateThemeToDom(theme.id, { animate: true, colorScheme: nextScheme });
        setSaveStatus("saved");
        setAccountSynced(true);
        setSaveError(null);
        setPendingThemeId(null);
        return { ok: true };
      } catch (err) {
        const friendly = formatThemeSaveError(err);
        // Restore previous saved theme immediately so failed saves never leave an unsaved theme stuck.
        setPreviewThemeId(null);
        setSchemeOverride(previousTheme.premium ? previousScheme : null);
        setModeState(deriveModeFromTheme(previousTheme.id, previousScheme));
        applyMealMateThemeToDom(previousTheme.id, {
          animate: true,
          colorScheme: previousScheme,
        });
        setSaveStatus("error");
        setAccountSynced(false);
        setSaveError(friendly);
        setPendingThemeId(theme.id);
        pendingSchemeRef.current = nextScheme;
        return { ok: false, error: friendly };
      }
    },
    [user, activeThemeId, writeAccountTheme],
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
          setAccountSynced(false);
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
        setAccountSynced(false);
        setSaveError(msg);
        toast.info("Applied locally", {
          description: "Sign in to save your theme to your account across devices.",
        });
        return { ok: false, error: msg };
      }

      // Preview immediately while persisting; persistToAccount restores previous saved theme if save fails.
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
    const targetScheme = theme.premium
      ? (pendingSchemeRef.current ?? schemeOverride ?? theme.colorScheme)
      : theme.colorScheme;
    setPreviewThemeId(target);
    setSchemeOverride(theme.premium ? targetScheme : null);
    applyMealMateThemeToDom(target, { animate: true, colorScheme: targetScheme });
    const result = await persistToAccount(target, targetScheme);
    if (result.ok) {
      toast.success(`${theme.name} saved to your account`);
    } else {
      toast.error("Save still failed", { description: result.error });
    }
    return result;
  }, [pendingThemeId, previewThemeId, activeThemeId, schemeOverride, persistToAccount]);

  const clearSaveStatus = useCallback(() => {
    pendingSchemeRef.current = null;
    setSaveStatus("idle");
    setSaveError(null);
    setPendingThemeId(null);
  }, []);

  const setMode = useCallback(
    (m: ThemeMode) => {
      userHasEditedRef.current = true;

      if (m === "dark-premium") {
        setPreviewThemeId(null);
        setSchemeOverride("dark");
        if (!user) {
          setModeState("dark-premium");
          setActiveThemeId("midnight");
          writeLocalThemeStorage("midnight", "dark-premium", "dark");
          applyMealMateThemeToDom("midnight", {
            animate: true,
            colorScheme: "dark",
            legacyDatasetTheme: "dark-premium",
          });
          return;
        }
        setPreviewThemeId("midnight");
        applyMealMateThemeToDom("midnight", {
          animate: true,
          colorScheme: "dark",
          legacyDatasetTheme: "dark-premium",
        });
        void persistToAccount("midnight", "dark");
        return;
      }

      const targetScheme: ThemeColorScheme =
        m === "dark" ? "dark" : m === "light" ? "light" : systemPref();
      const targetTheme = getMealMateTheme(previewThemeId ?? activeThemeId);
      const keepPremiumTheme = targetTheme.premium && mode !== "dark-premium";

      if (keepPremiumTheme) {
        if (previewThemeId) {
          setModeState(m);
          setSchemeOverride(targetScheme);
          applyMealMateThemeToDom(targetTheme.id, {
            animate: true,
            colorScheme: targetScheme,
            legacyDatasetTheme: targetScheme,
          });
          return;
        }
        if (!user) {
          setModeState(m);
          setSchemeOverride(targetScheme);
          writeLocalThemeStorage(targetTheme.id, m, targetScheme);
          applyMealMateThemeToDom(targetTheme.id, {
            animate: true,
            colorScheme: targetScheme,
            legacyDatasetTheme: targetScheme,
          });
          return;
        }
        setPreviewThemeId(targetTheme.id);
        setSchemeOverride(targetScheme);
        applyMealMateThemeToDom(targetTheme.id, {
          animate: true,
          colorScheme: targetScheme,
          legacyDatasetTheme: targetScheme,
        });
        void persistToAccount(targetTheme.id, targetScheme);
        return;
      }

      const nextThemeId: MealMateThemeId =
        targetScheme === "dark" ? "midnight-black" : "classic-light";
      if (!user) {
        setModeState(m);
        setPreviewThemeId(null);
        setSchemeOverride(null);
        setActiveThemeId(nextThemeId);
        writeLocalThemeStorage(nextThemeId, m, null);
        applyMealMateThemeToDom(nextThemeId, {
          animate: true,
          legacyDatasetTheme: m === "system" ? systemPref() : m,
        });
        return;
      }

      setPreviewThemeId(nextThemeId);
      setSchemeOverride(null);
      applyMealMateThemeToDom(nextThemeId, {
        animate: true,
        legacyDatasetTheme: m === "system" ? systemPref() : m,
      });
      void persistToAccount(nextThemeId, null);
    },
    [activeThemeId, previewThemeId, mode, user, persistToAccount],
  );

  const setFont = useCallback(
    (nextFont: AppFontId) => {
      userHasEditedRef.current = true;
      setFontState(nextFont);
      ensureAppFontLoaded(nextFont);
      try {
        window.localStorage.setItem(APP_FONT_STORAGE_KEY, nextFont);
      } catch {
        /* ignore */
      }
      document.documentElement.dataset["font"] = nextFont;

      if (user && typeof preferencesFns.saveMyAppSettings === "function") {
        void preferencesFns.saveMyAppSettings({ data: { font: nextFont } }).catch((err) => {
          if (isAdminUnconfiguredError(err) && auth.currentUser?.uid === user.id) {
            void setDoc(
              doc(db, "users", user.id),
              { id: user.id, font: nextFont, updatedAt: new Date().toISOString() },
              { merge: true },
            ).catch(() => undefined);
          }
        });
      }
    },
    [user],
  );

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
      accountSynced,
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
      accountSynced,
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
