import chef from "@/assets/mealmate-chef.png";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export function ChefMascot({
  className,
  animate = false,
  interactive = false,
  onClick,
}: {
  className?: string;
  animate?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const [bouncing, setBouncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <img
      src={chef}
      alt="Mia AI Chef Mascot"
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
        animate && !bouncing && "mascot-float",
        bouncing && "mia-hop",
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        className,
      )}
    />
  );
}
