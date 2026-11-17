import { Sun, Moon, Monitor, Check, Contrast, Palette, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { FREE_THEMES } from "@/lib/themes";
import { usePremium } from "@/hooks/use-premium";

export function ThemeToggle() {
  const { activeThemeId, displayTheme, applyTheme, setMode, mode } = useTheme();
  const { isPremium } = usePremium();
  const Icon =
    displayTheme.id === "midnight-pro"
      ? Contrast
      : displayTheme.colorScheme === "dark"
        ? Moon
        : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl border border-border bg-card text-foreground hover:bg-secondary"
          aria-label="Choose theme"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-52 border-border bg-popover text-popover-foreground"
      >
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Quick Themes
        </DropdownMenuLabel>
        {FREE_THEMES.map((t) => {
          const active = activeThemeId === t.id;
          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => void applyTheme(t.id)}
              className="flex items-center gap-2.5"
            >
              <img
                src={t.mascotImage}
                alt=""
                width={18}
                height={18}
                className="h-4.5 w-4.5 shrink-0 rounded object-cover"
              />
              <span className="flex-1 truncate">{t.name}</span>
              {active && <Check className="h-3.5 w-3.5 text-[var(--periwinkle)]" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          onClick={() => (isPremium ? void applyTheme("midnight-pro") : setMode("system"))}
          className="flex items-center gap-2.5"
        >
          {isPremium ? (
            <>
              <Contrast className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
              <span className="flex-1">Midnight Pro</span>
              {activeThemeId === "midnight-pro" && (
                <Check className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
              )}
            </>
          ) : (
            <>
              <Monitor className="h-3.5 w-3.5" />
              <span className="flex-1">System default</span>
              {mode === "system" && <Check className="h-3.5 w-3.5 text-[var(--periwinkle)]" />}
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            {isPremium ? (
              <Palette className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-[var(--periwinkle)]" />
            )}
            <span>Browse all 12 themes</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
