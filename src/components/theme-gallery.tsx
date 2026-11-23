import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, Crown, Info, Loader2, Lock, RotateCcw, Sparkles } from "lucide-react";
import { FREE_THEMES, PREMIUM_THEMES, type MealMateTheme } from "@/lib/themes";
import { useTheme } from "@/components/theme-provider";
import { usePremium } from "@/hooks/use-premium";
import { useUpgradeModal } from "@/components/upgrade-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ThemeMiniPreview({
  theme,
  active,
  previewing,
  locked,
}: {
  theme: MealMateTheme;
  active: boolean;
  previewing: boolean;
  locked: boolean;
}) {
  const t = theme.tokens;
  return (
    <div
      className="relative aspect-[16/11] w-full overflow-hidden rounded-xl border transition-transform duration-200"
      style={{
        backgroundColor: t.background,
        borderColor: previewing || active ? t.periwinkle : t.border,
      }}
      aria-hidden="true"
    >
      {/* Mini status / header bar */}
      <div
        className="flex items-center justify-between border-b px-2 py-1"
        style={{
          backgroundColor: t.headerBackground,
          borderColor: t.border,
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.periwinkle }} />
          <span
            className="h-1 w-7 rounded-full opacity-85"
            style={{ backgroundColor: t.foreground }}
          />
        </div>
        <span
          className="h-1.5 w-3 rounded-full"
          style={{ backgroundColor: t.mutedForeground, opacity: 0.45 }}
        />
      </div>

      {/* Mini MealMate content body with prominent mascot image preview */}
      <div className="p-2 pb-5">
        <div
          className="flex items-center gap-2 rounded-lg border p-1.5"
          style={{
            backgroundColor: t.card,
            borderColor: t.border,
          }}
        >
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border"
            style={{ borderColor: t.border, backgroundColor: t.secondary }}
          >
            <img
              src={theme.mascotImage}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span
                className="h-1.5 w-10 rounded-full"
                style={{ backgroundColor: t.foreground, opacity: 0.88 }}
              />
              <span className="h-2 w-4 rounded" style={{ backgroundColor: t.periwinkleSoft }} />
            </div>
            <div
              className="mt-1 h-1 w-12 rounded-full"
              style={{ backgroundColor: t.mutedForeground, opacity: 0.55 }}
            />
            <div className="mt-2 flex items-center gap-1">
              <span className="h-2.5 w-7 rounded" style={{ backgroundColor: t.primary }} />
              <span
                className="h-2.5 w-5 rounded border"
                style={{ backgroundColor: t.secondary, borderColor: t.border }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mini bottom nav */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t px-2 py-1"
        style={{
          backgroundColor: t.navBackground,
          borderColor: t.border,
        }}
      >
        <span
          className="h-1 w-3 rounded-full"
          style={{ backgroundColor: t.mutedForeground, opacity: 0.5 }}
        />
        <span
          className="h-1 w-3 rounded-full"
          style={{ backgroundColor: t.mutedForeground, opacity: 0.5 }}
        />
        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: t.periwinkle }} />
        <span
          className="h-1 w-3 rounded-full"
          style={{ backgroundColor: t.mutedForeground, opacity: 0.5 }}
        />
        <span
          className="h-1 w-3 rounded-full"
          style={{ backgroundColor: t.mutedForeground, opacity: 0.5 }}
        />
      </div>

      {/* Top-right status marker */}
      {active && (
        <span
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md shadow-sm"
          style={{
            backgroundColor: t.periwinkle,
            color: theme.colorScheme === "dark" ? t.background : "#ffffff",
          }}
        >
          <Check className="h-3 w-3 stroke-[2.5]" />
        </span>
      )}
      {!active && previewing && (
        <span
          className="absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: t.periwinkle,
            color: theme.colorScheme === "dark" ? t.background : "#ffffff",
          }}
        >
          Preview
        </span>
      )}
      {!active && !previewing && locked && (
        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-md bg-black/75 text-white">
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}
    </div>
  );
}

function ThemeCard({
  theme,
  active,
  previewing,
  locked,
  onSelect,
}: {
  theme: MealMateTheme;
  active: boolean;
  previewing: boolean;
  locked: boolean;
  onSelect: (theme: MealMateTheme) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active || previewing}
      aria-label={`${theme.name} theme${active ? " (active)" : ""}${previewing ? " (previewing)" : ""}${locked ? " (Premium)" : ""}`}
      onClick={() => onSelect(theme)}
      className={cn(
        "group flex min-w-0 flex-col rounded-2xl border bg-card p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
        previewing
          ? "border-[var(--periwinkle)] ring-2 ring-[var(--periwinkle-soft)]"
          : active
            ? "border-[var(--periwinkle)] bg-[var(--periwinkle-soft)]/40"
            : "border-border hover:border-foreground/30",
      )}
    >
      <ThemeMiniPreview theme={theme} active={active} previewing={previewing} locked={locked} />

      <div className="mt-2 flex min-w-0 items-center justify-between gap-2 px-0.5">
        <img
          src={theme.mascotImage}
          alt={`${theme.name} logo`}
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          className="h-6 w-6 shrink-0 rounded-lg border border-border/70 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: theme.tokens.periwinkle }}
              aria-hidden="true"
            />
            <span className="truncate text-xs font-semibold text-foreground">{theme.name}</span>
          </div>
          <p className="mt-0.5 truncate text-[10px] leading-tight text-muted-foreground">
            {theme.subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}

export function ThemeGallery({ compact = false }: { compact?: boolean }) {
  const {
    activeTheme,
    activeThemeId,
    previewThemeId,
    displayTheme,
    isPreviewing,
    loadingAccount,
    saveStatus,
    saveError,
    isAuthenticated,
    previewTheme,
    cancelPreview,
    applyTheme,
    retrySave,
  } = useTheme();

  const { isPremium } = usePremium();
  const { open: openUpgrade } = useUpgradeModal();

  const displayLocked = displayTheme.premium && !isPremium;
  const isSaving = saveStatus === "saving";

  function handleSelectTheme(theme: MealMateTheme) {
    if (theme.id === activeThemeId && previewThemeId === null) {
      return;
    }
    previewTheme(theme.id);
  }

  return (
    <div className="space-y-4">
      {/* Account Sync Status Banner */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={activeTheme.mascotImage}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl border border-border object-cover"
            />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground sm:text-sm">
                Active theme: {activeTheme.name}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {loadingAccount
                  ? "Checking your account theme…"
                  : isAuthenticated
                    ? "Synced to your MealMate account across devices"
                    : "Device preview only · Sign in to save to your account"}
              </div>
            </div>
          </div>

          {saveStatus === "saving" && (
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[var(--periwinkle)]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </span>
          )}
          {saveStatus === "saved" && !isPreviewing && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--positive)]">
              <Check className="h-3.5 w-3.5" />
              Saved
            </span>
          )}
        </div>

        {/* Unauthenticated Warning */}
        {(!isAuthenticated || saveStatus === "unauthenticated") && (
          <div
            role="status"
            className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-secondary px-3 py-2.5 text-xs text-foreground sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--periwinkle)]" />
              <span className="text-muted-foreground">
                {saveError ||
                  "Sign in to permanently save your theme and sync it across Android & web."}
              </span>
            </div>
            <Link
              to="/auth"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-foreground px-3 text-xs font-medium text-background hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Save Error State with Explicit Retry */}
        {saveStatus === "error" && saveError && (
          <div
            role="alert"
            className="mt-3 flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{saveError}</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSaving}
              onClick={() => void retrySave()}
              className="h-8 shrink-0 rounded-lg border-destructive/40 bg-card text-xs text-foreground hover:bg-secondary"
            >
              Retry save
            </Button>
          </div>
        )}
      </div>

      {/* Live Preview Action Bar (Immediate Preview + Apply Theme) */}
      {isPreviewing && (
        <div
          role="region"
          aria-label="Live theme preview controls"
          className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--periwinkle)] bg-card p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={displayTheme.mascotImage}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-xl border border-border object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[var(--periwinkle)]" />
                <span className="truncate">Previewing {displayTheme.name}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {displayLocked
                  ? "This is a Premium theme preview. Upgrade to apply & save it."
                  : "Applied live across every screen. Tap Apply Theme to save."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={cancelPreview}
              disabled={isSaving}
              className="h-10 min-h-[44px] flex-1 rounded-xl border-border bg-secondary px-3.5 text-xs font-medium text-foreground hover:bg-muted sm:flex-none"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Cancel
            </Button>

            {displayLocked ? (
              <Button
                type="button"
                onClick={() =>
                  openUpgrade(
                    `Unlock ${displayTheme.name} and all ${PREMIUM_THEMES.length} logo themes with MealMate Premium.`,
                  )
                }
                className="h-10 min-h-[44px] flex-1 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 sm:flex-none"
              >
                <Crown className="mr-1.5 h-3.5 w-3.5" />
                Unlock Premium
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSaving}
                onClick={() => void applyTheme(displayTheme.id)}
                className="h-10 min-h-[44px] flex-1 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 sm:flex-none"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Applying…
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Apply Theme
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Default Black & White Themes */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Default (Black &amp; White)
          </h3>
          <span className="text-[11px] text-muted-foreground">{FREE_THEMES.length} included</span>
        </div>
        <div
          role="radiogroup"
          aria-label="Default themes"
          className={cn(
            "grid grid-cols-2 gap-2.5",
            compact ? "sm:grid-cols-2" : "sm:grid-cols-2 sm:gap-3",
          )}
        >
          {FREE_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              active={activeThemeId === theme.id}
              previewing={previewThemeId === theme.id && previewThemeId !== activeThemeId}
              locked={false}
              onSelect={handleSelectTheme}
            />
          ))}
        </div>
      </div>

      {/* 6 Logo Themes */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <Crown className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Logo Themes
            </h3>
          </div>
          {isPremium ? (
            <span className="text-[11px] font-medium text-[var(--positive)]">
              All {PREMIUM_THEMES.length} unlocked
            </span>
          ) : (
            <Link
              to="/premium"
              className="text-[11px] font-medium text-[var(--periwinkle)] hover:underline"
            >
              Unlock all {PREMIUM_THEMES.length}
            </Link>
          )}
        </div>
        <div
          role="radiogroup"
          aria-label="Logo themes"
          className={cn(
            "grid grid-cols-2 gap-2.5",
            compact ? "sm:grid-cols-3" : "sm:grid-cols-3 sm:gap-3",
          )}
        >
          {PREMIUM_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              active={activeThemeId === theme.id}
              previewing={previewThemeId === theme.id && previewThemeId !== activeThemeId}
              locked={!isPremium}
              onSelect={handleSelectTheme}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
