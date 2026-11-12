import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { MealMateLogo } from "@/components/mealmate-logo";
import { useSession } from "@/hooks/use-session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutUnified } from "@/hooks/use-session";
import { ArrowLeft, Bell, UserRound } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyUnreadNotificationCount } from "@/lib/notifications.functions";
import { listenForForegroundPush } from "@/lib/push-client";
import { toast } from "sonner";

/**
 * Compact top bar used on every page except the home screen (which renders
 * its own greeting header).
 */
export function AppHeader() {
  const { user } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const unread = useQuery({
    queryKey: ["notification-count", user?.id],
    queryFn: () => getMyUnreadNotificationCount(),
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!userId) return;
    let active = true;
    let unsubscribe: () => void = () => undefined;
    void listenForForegroundPush(({ title, body }) => {
      toast(title, { description: body });
    })
      .then((stop) => {
        if (active) unsubscribe = stop;
        else stop();
      })
      .catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutUnified();
    navigate({ to: "/auth", replace: true });
  }

  const unreadCount = unread.data?.unreadCount ?? 0;

  return (
    <header id="app-header" className="fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto grid h-15 max-w-[720px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 px-4">
        <Link
          to="/"
          aria-label="Back home"
          className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#141414] hover:text-foreground"
        >
          <ArrowLeft className="size-[19px]" strokeWidth={1.7} />
        </Link>
        <Link
          to="/"
          className="flex min-w-0 items-center justify-center gap-2"
          aria-label="MealMate home"
        >
          {pathname.startsWith("/chat") ? (
            <span className="text-[17px] font-semibold tracking-[-0.03em]">MealMate</span>
          ) : (
            <MealMateLogo imageClassName="size-8 rounded-lg object-contain" />
          )}
        </Link>

        {user ? (
          <div className="flex items-center justify-end gap-0.5">
            <button
              type="button"
              className="relative grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#141414] hover:text-foreground"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              onClick={() => navigate({ to: "/notifications" })}
            >
              <Bell className="size-[19px]" strokeWidth={1.7} aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-semibold leading-4 text-black">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[#141414] hover:text-foreground"
                  aria-label="Account menu"
                >
                  <UserRound className="size-[19px]" strokeWidth={1.7} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border-[#262626] bg-[#171717] text-foreground"
              >
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/notifications" })}>
                  Notifications
                  {unreadCount > 0 ? ` (${unreadCount} unread)` : ""}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/planner" })}>
                  Meal planner
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/list" })}>
                  Grocery list
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#262626]" />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate({ to: "/auth" })}
            className="h-10 rounded-lg bg-white px-4 text-[13px] font-medium text-black"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
