import chef from "@/assets/mealmate-chef.png";
import type { MiaMood } from "@/lib/mia-companion";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const MOOD_CLASS: Record<MiaMood, string> = {
  happy: "mia-mood-happy",
  excited: "mia-mood-excited",
  thinking: "mia-mood-thinking",
  listening: "mia-mood-listening",
  speaking: "mia-mood-speaking",
  confused: "mia-mood-confused",
  concerned: "mia-mood-concerned",
  celebrating: "mia-mood-celebrating",
  calm: "mia-mood-calm",
};

const MOOD_RING: Record<MiaMood, string> = {
  happy: "ring-amber-400/40",
  excited: "ring-orange-400/50",
  thinking: "ring-indigo-400/45",
  listening: "ring-sky-400/50",
  speaking: "ring-emerald-400/50",
  confused: "ring-amber-500/50",
  concerned: "ring-rose-400/45",
  celebrating: "ring-emerald-500/55",
  calm: "ring-border",
};

const MOOD_ACCESSIBILITY_LABEL: Record<MiaMood, string> = {
  happy: "Happy",
  excited: "Excited",
  thinking: "Thinking",
  listening: "Listening",
  speaking: "Speaking",
  confused: "Confused",
  concerned: "Concerned",
  celebrating: "Celebrating",
  calm: "Calm",
};

export function ChefMascot({
  className,
  animate = false,
  interactive = false,
  mood,
  showMoodRing = false,
  onClick,
}: {
  className?: string;
  animate?: boolean;
  interactive?: boolean;
  mood?: MiaMood;
  showMoodRing?: boolean;
  onClick?: () => void;
}) {
  const [bouncing, setBouncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const moodClass = mood ? MOOD_CLASS[mood] : animate ? "mascot-float" : "";

  return (
    <img
      src={chef}
      alt={mood ? `Mia AI Chef (${MOOD_ACCESSIBILITY_LABEL[mood]})` : "Mia AI Chef Mascot"}
      width={1024}
      height={1024}
      onClick={() => {
        if (interactive) {
          setBouncing(true);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setBouncing(false), 550);
        }
        onClick?.();
      }}
      className={cn(
        "object-contain select-none transition-transform duration-300",
        !bouncing && moodClass,
        bouncing && "mia-hop",
        showMoodRing && mood && `rounded-full ring-2 ${MOOD_RING[mood]}`,
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        className,
      )}
    />
  );
}
