import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, RefreshCw, Sparkles, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { ChefMascot } from "@/components/chef-mascot";
import { cn } from "@/lib/utils";

export type MiaWaitMoment =
  | {
      id: string;
      kind: "fact";
      badge: string;
      title: string;
      body: string;
    }
  | {
      id: string;
      kind: "discount";
      badge: string;
      title: string;
      body: string;
      code: string;
      ctaLabel: string;
      ctaTo: "/restaurants" | "/premium";
    };

export const MIA_WAIT_MOMENTS: MiaWaitMoment[] = [
  {
    id: "fact-bobotie",
    kind: "fact",
    badge: "Mia Fun Fact",
    title: "Cape Malay Bobotie's golden secret",
    body: "Soaking white bread in milk before folding it into spiced beef mince locks in juices while the bay leaf custard bakes to a silky finish.",
  },
  {
    id: "discount-dinner-for-2",
    kind: "discount",
    badge: "20% Off for 2",
    title: "Save 20% on meals for two",
    body: "Planning a dinner for two? Spot 20% off partner dining specials or share the kitchen perk with code MIA20FOR2.",
    code: "MIA20FOR2",
    ctaLabel: "See Dining deals",
    ctaTo: "/restaurants",
  },
  {
    id: "fact-rooibos",
    kind: "fact",
    badge: "Mia Fun Fact",
    title: "Why Rooibos stays naturally smooth",
    body: "Grown in the Cederberg mountains of South Africa, redbush tea contains zero caffeine and almost no tannins, so it never turns bitter when steeped.",
  },
  {
    id: "discount-pro-for-2",
    kind: "discount",
    badge: "20% Off for 2",
    title: "20% discount for two foodies",
    body: "Enjoy 20% off shared table treats and chef specials for 2 guests across local kitchens in MealMate Dining.",
    code: "MIA20FOR2",
    ctaLabel: "Browse 20% deals",
    ctaTo: "/restaurants",
  },
  {
    id: "fact-pasta-water",
    kind: "fact",
    badge: "Mia Fun Fact",
    title: "The starch splash chef trick",
    body: "Saving half a cup of salty pasta water helps butter and aged Parmesan bind into a glossy restaurant style Alfredo sauce without splitting.",
  },
  {
    id: "fact-malva",
    kind: "fact",
    badge: "Mia Fun Fact",
    title: "Inside Malva Pudding's spongy crumb",
    body: "A spoon of apricot jam and a splash of vinegar react with baking soda to lift a honeycomb sponge ready to drink up warm butter cream.",
  },
  {
    id: "discount-plan-for-2",
    kind: "discount",
    badge: "20% Off for 2",
    title: "20% off your next duo night",
    body: "Take 20% off eligible dining picks for two or save big on weekly meal prep perks with code MIA20FOR2.",
    code: "MIA20FOR2",
    ctaLabel: "View perks",
    ctaTo: "/premium",
  },
  {
    id: "fact-chakalaka",
    kind: "fact",
    badge: "Mia Fun Fact",
    title: "Born in Johannesburg kitchens",
    body: "Chakalaka started in township kitchens as a vibrant spiced vegetable and bean relish built to wake up fluffy maize meal pap.",
  },
];

let inlineMountCount = 0;
const inlineListeners = new Set<() => void>();

export function useHasInlineMiaLoadingCard() {
  const [hasInline, setHasInline] = useState(() => inlineMountCount > 0);
  useEffect(() => {
    const sync = () => setHasInline(inlineMountCount > 0);
    sync();
    inlineListeners.add(sync);
    return () => {
      inlineListeners.delete(sync);
    };
  }, []);
  return hasInline;
}

export function MiaLoadingCard({
  active = true,
  delayMs = 700,
  rotateMs = 4500,
  variant = "inline",
  label = "Taking a moment while Mia preps the kitchen...",
  className,
  onDismiss,
}: {
  active?: boolean;
  delayMs?: number;
  rotateMs?: number;
  variant?: "inline" | "floating";
  label?: string;
  className?: string;
  onDismiss?: () => void;
}) {
  const [visible, setVisible] = useState(() => active && delayMs <= 0);
  const [index, setIndex] = useState(() => Math.floor(Math.random() * MIA_WAIT_MOMENTS.length));
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    if (delayMs <= 0) {
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  useEffect(() => {
    if (!visible || rotateMs <= 0) return;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % MIA_WAIT_MOMENTS.length);
    }, rotateMs);
    return () => window.clearInterval(interval);
  }, [visible, rotateMs]);

  useEffect(() => {
    if (variant !== "inline" || !visible) return;
    inlineMountCount += 1;
    for (const listener of inlineListeners) listener();
    return () => {
      inlineMountCount = Math.max(0, inlineMountCount - 1);
      for (const listener of inlineListeners) listener();
    };
  }, [variant, visible]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  const moment = MIA_WAIT_MOMENTS[index % MIA_WAIT_MOMENTS.length]!;
  const isDiscount = moment.kind === "discount";

  function handleNext() {
    setCopied(false);
    setIndex((prev) => (prev + 1) % MIA_WAIT_MOMENTS.length);
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Discount code ${code} copied`);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.message(`Use code ${code} for 20% off for 2`);
    }
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-2xl border border-border bg-card/95 p-4 text-left text-foreground shadow-sm backdrop-blur-md transition-all",
        isDiscount && "border-[var(--periwinkle)]/40",
        variant === "floating" && "shadow-lg",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center">
          <ChefMascot
            animate
            interactive
            onClick={handleNext}
            className="h-14 w-14 sm:h-16 sm:w-16"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                isDiscount
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {isDiscount ? <Tag className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              {moment.badge}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNext}
                aria-label="Show next tip from Mia"
                className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Next
              </button>
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Hide Mia tip"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">{moment.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{moment.body}</p>

          {moment.kind === "discount" ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopy(moment.code)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : moment.code}
              </button>
              <Link
                to={moment.ctaTo}
                className="inline-flex items-center rounded-xl bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {moment.ctaLabel}
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
          )}
        </div>
      </div>
    </aside>
  );
}
