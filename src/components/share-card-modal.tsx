import { useEffect, useRef, useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dispatchAnalyticsEvent } from "@/lib/analytics-events";
import { useSession } from "@/hooks/use-session";

export type ShareCardPayload =
  | {
      kind: "recipe";
      title: string;
      subtitle?: string | null;
      meta: string[];
      highlight?: string | null;
      shareUrl?: string;
    }
  | {
      kind: "weekly_plan";
      title: string;
      weekLabel: string;
      plannedCount: number;
      completedCount: number;
      goalTarget: number;
      meals: string[];
      shareUrl?: string;
    }
  | {
      kind: "achievement";
      title: string;
      levelName: string;
      xp: number;
      streak: number;
      identityHabit?: string | null;
      unlockedBadges: string[];
      shareUrl?: string;
    };

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawShareCardCanvas(canvas: HTMLCanvasElement, payload: ShareCardPayload) {
  const width = 960;
  const height = 600;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, "#101626");
  grad.addColorStop(1, "#1c2540");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(129, 140, 248, 0.3)";
  ctx.lineWidth = 3;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.fillStyle = "#818cf8";
  ctx.font = "600 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("MEALMATE", 64, 82);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 18px system-ui, -apple-system, sans-serif";
  const kindLabel =
    payload.kind === "recipe"
      ? "Recipe Discovery"
      : payload.kind === "weekly_plan"
        ? `Weekly Plan · ${payload.weekLabel}`
        : `Cooking Progress · ${payload.levelName}`;
  ctx.fillText(kindLabel, 64, 114);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  const titleLines = wrapLines(ctx, payload.title, width - 128).slice(0, 2);
  let y = 188;
  for (const line of titleLines) {
    ctx.fillText(line, 64, y);
    y += 54;
  }

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "400 24px system-ui, -apple-system, sans-serif";
  y += 18;

  if (payload.kind === "recipe") {
    if (payload.subtitle) {
      for (const line of wrapLines(ctx, payload.subtitle, width - 128).slice(0, 2)) {
        ctx.fillText(line, 64, y);
        y += 34;
      }
      y += 16;
    }
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(payload.meta.filter(Boolean).join("  ·  "), 64, y + 16);
  } else if (payload.kind === "weekly_plan") {
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${payload.completedCount} of ${payload.goalTarget} weekly meals cooked · ${payload.plannedCount} planned`,
      64,
      y,
    );
    y += 46;
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "400 21px system-ui, -apple-system, sans-serif";
    for (const meal of payload.meals.slice(0, 5)) {
      ctx.fillText(`• ${meal}`, 64, y);
      y += 32;
    }
  } else {
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "600 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(`${payload.xp.toLocaleString()} XP  ·  ${payload.streak}-day rhythm`, 64, y);
    y += 44;
    if (payload.identityHabit) {
      ctx.fillStyle = "#a5b4fc";
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(`“${payload.identityHabit}”`, 64, y);
      y += 42;
    }
    if (payload.unlockedBadges.length > 0) {
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "400 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(`Milestones: ${payload.unlockedBadges.slice(0, 4).join(" · ")}`, 64, y);
    }
  }

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 18px system-ui, -apple-system, sans-serif";
  ctx.fillText("mealsmates.site · Cook calmer every week", 64, height - 56);
}

export function ShareCardModal({
  open,
  onOpenChange,
  payload,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  payload: ShareCardPayload | null;
}) {
  const { user } = useSession();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !payload || !canvasRef.current) return;
    drawShareCardCanvas(canvasRef.current, payload);
  }, [open, payload]);

  if (!payload) return null;

  const summaryText =
    payload.kind === "recipe"
      ? `${payload.title} (${payload.meta.filter(Boolean).join(" · ")}) on MealMate`
      : payload.kind === "weekly_plan"
        ? `My MealMate Week (${payload.weekLabel}): ${payload.completedCount}/${payload.goalTarget} home-cooked meals completed`
        : `${payload.title} on MealMate — ${payload.levelName} (${payload.xp.toLocaleString()} XP)`;

  function emitShared(channel: string) {
    if (!user?.id) return;
    void dispatchAnalyticsEvent({
      userId: user.id,
      eventName: "share_card_created",
      metadata: { kind: payload?.kind ?? "unknown", channel },
    });
  }

  async function handleCopy() {
    const shareLink =
      payload?.shareUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
    try {
      await navigator.clipboard.writeText(`${summaryText}\n${shareLink}`.trim());
      emitShared("clipboard");
      toast.success("Share summary copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  async function handleDownload() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealmate-${payload?.kind ?? "card"}.png`;
    a.click();
    emitShared("download_png");
    toast.success("Card image downloaded");
  }

  async function handleNativeShare() {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const shareLink =
        payload?.shareUrl ?? (typeof window !== "undefined" ? window.location.href : undefined);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current?.toBlob((b) => resolve(b), "image/png"),
      );
      if (blob && typeof navigator !== "undefined" && typeof navigator.share === "function") {
        const file = new File([blob], `mealmate-${payload?.kind ?? "card"}.png`, {
          type: "image/png",
        });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: payload?.title ?? "MealMate",
            text: summaryText,
            files: [file],
          });
          emitShared("web_share_file");
          return;
        }
        await navigator.share({
          title: payload?.title ?? "MealMate",
          text: summaryText,
          url: shareLink,
        });
        emitShared("web_share_link");
        return;
      }
      await handleCopy();
    } catch (error) {
      if ((error as { name?: string })?.name !== "AbortError") {
        await handleCopy();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share your MealMate card</DialogTitle>
          <DialogDescription>
            Save or share a branded MealMate summary card with friends or family.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          <canvas ref={canvasRef} className="block h-auto w-full" />
        </div>
        <DialogFooter className="flex flex-wrap gap-2 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleCopy()}
            className="min-h-11 rounded-xl"
          >
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Copy text
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleDownload()}
              className="min-h-11 rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Save image
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void handleNativeShare()}
              className="min-h-11 rounded-xl"
            >
              <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Share
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
