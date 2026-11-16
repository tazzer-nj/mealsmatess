import { useCallback, useMemo } from "react";
import { useOptionalTheme, useTheme } from "@/components/theme-provider";
import { getTheme, type MascotTheme, type MascotThemeId } from "@/lib/mascot-theme";

/**
 * Compatibility bridge for components consuming mascot theme metadata.
 * Backed directly by the unified <ThemeProvider> so there is a single source of truth.
 */
export function MascotThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useMascotTheme() {
  const ctx = useTheme();
  const theme: MascotTheme = useMemo(() => getTheme(ctx.displayThemeId), [ctx.displayThemeId]);
  const setTheme = useCallback(
    async (id: MascotThemeId) => {
      await ctx.applyTheme(id);
    },
    [ctx],
  );
  return {
    theme,
    setTheme,
    saving: ctx.saveStatus === "saving",
    saveStatus: ctx.saveStatus,
    saveError: ctx.saveError,
  };
}

export function useOptionalMascotTheme() {
  const ctx = useOptionalTheme();
  const setTheme = useCallback(
    async (id: MascotThemeId) => {
      if (ctx) await ctx.applyTheme(id);
    },
    [ctx],
  );
  return useMemo(() => {
    if (!ctx) return null;
    return {
      theme: getTheme(ctx.displayThemeId),
      setTheme,
      saving: ctx.saveStatus === "saving",
      saveStatus: ctx.saveStatus,
      saveError: ctx.saveError,
    };
  }, [ctx, setTheme]);
}
