import { cn } from "@/lib/utils";
import { useOptionalMascotTheme } from "@/hooks/use-mascot-theme";
import { getTheme } from "@/lib/mascot-theme";

/** The MealMate mascot artwork for the selected theme. */
export function MascotMark({
  className,
  alt = "MealMate",
}: {
  className?: string | undefined;
  alt?: string;
}) {
  const ctx = useOptionalMascotTheme();
  const theme = ctx?.theme ?? getTheme("classic");
  return (
    <img
      key={theme.id}
      src={theme.image}
      alt={alt}
      width={80}
      height={80}
      decoding="async"
      className={cn(
        "size-10 shrink-0 overflow-hidden rounded-2xl object-cover animate-in fade-in zoom-in-95 duration-300",
        className,
      )}
    />
  );
}

export function MealMateLogo({
  className,
  imageClassName,
  showName = true,
}: {
  className?: string;
  imageClassName?: string;
  showName?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MascotMark className={imageClassName} />
      {showName && <span className="font-display text-2xl leading-none">MealMate</span>}
    </span>
  );
}
