import { useState, type ReactNode } from "react";
import { User as UserIcon } from "lucide-react";
import { isValidImageUrl } from "@/lib/recipe-image";

type ResilientImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string | null | undefined;
  fallbackSrc?: string | null;
  fallback?: ReactNode;
};

/** Renders an image with automatic fallback URL and clean non-broken visual fallback. */
export function ResilientImage({
  src,
  fallbackSrc,
  fallback = null,
  alt = "",
  onError,
  referrerPolicy = "no-referrer",
  ...rest
}: ResilientImageProps) {
  const primary = isValidImageUrl(src) ? src : null;
  const secondary = isValidImageUrl(fallbackSrc) && fallbackSrc !== primary ? fallbackSrc : null;

  return (
    <ResilientImgInner
      key={`${primary ?? ""}|${secondary ?? ""}`}
      primary={primary}
      secondary={secondary}
      fallback={fallback}
      alt={alt}
      onError={onError}
      referrerPolicy={referrerPolicy}
      {...rest}
    />
  );
}

function ResilientImgInner({
  primary,
  secondary,
  fallback,
  alt,
  onError,
  referrerPolicy,
  ...rest
}: Omit<ResilientImageProps, "src" | "fallbackSrc"> & {
  primary: string | null;
  secondary: string | null;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(primary ? 0 : secondary ? 1 : 2);
  const activeSrc = step === 0 ? primary : step === 1 ? secondary : null;

  if (!activeSrc || step >= 2) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...rest}
      src={activeSrc}
      alt={alt}
      referrerPolicy={referrerPolicy}
      onError={(event) => {
        onError?.(event);
        if (step === 0 && secondary) {
          setStep(1);
        } else {
          setStep(2);
        }
      }}
    />
  );
}

export function UserAvatar({
  src,
  alt,
  className = "h-full w-full object-cover",
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <ResilientImage
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      fallback={fallback ?? <UserIcon className="h-4 w-4" aria-hidden="true" />}
    />
  );
}
