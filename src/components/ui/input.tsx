import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[50px] w-full rounded-[12px] border border-[#303030] bg-[#141414] px-4 py-1 text-[15px] text-white transition-[border-color,box-shadow] duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#71717A] focus-visible:outline-none focus-visible:border-[#52525B] focus-visible:ring-[3px] focus-visible:ring-white/[0.07] disabled:cursor-not-allowed disabled:bg-[#222222] disabled:text-[#737373]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
