import chef from "@/assets/mealmate-chef.png";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ChefMascot({
  className,
  animate = true,
  interactive = false,
  onClick,
}: {
  className?: string;
  animate?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const [bouncing, setBouncing] = useState(false);

  return (
    <img
      src={chef}
      alt="Mia AI Chef Mascot"
      width={1024}
      height={1024}
      onClick={() => {
        if (interactive) {
          setBouncing(true);
          setTimeout(() => setBouncing(false), 800);
        }
        onClick?.();
      }}
      className={cn(
        "object-contain select-none transition-transform duration-300",
        animate && "mascot-float",
        bouncing && "scale-110 rotate-6",
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        className,
      )}
    />
  );
}
