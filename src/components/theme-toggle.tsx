import { Sun, Moon, Monitor, Check, Palette, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/components/theme-provider";
import { usePremium } from "@/hooks/use-premium";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { mode, colorScheme, activeTheme, setMode } = useTheme();
  const { isPremium } = usePremium();
  const Icon = colorScheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full bg-secondary hover:bg-secondary/80"
          aria-label="Choose theme"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10.5rem]">
        {OPTIONS.map((o) => {
          const O = o.icon;
          const active =
            mode === o.value ||
            (o.value === "dark" && mode === "dark-premium" && activeTheme.premium);
          return (
            <DropdownMenuItem
              key={o.value}
              onClick={() => setMode(o.value)}
              className="flex items-center gap-2"
            >
              <O className="h-4 w-4" />
              <span className="flex-1">{o.label}</span>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            {isPremium ? (
              <Palette className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Browse all themes</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
