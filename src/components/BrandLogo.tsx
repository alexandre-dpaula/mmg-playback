import React from "react";
import { cn } from "@/lib/utils";

type BrandDisplaySize = "sm" | "md" | "lg" | "xl";
type BrandInlineSize = "sm" | "md" | "lg";

const DISPLAY_SIZES: Record<BrandDisplaySize, string> = {
  sm: "text-[14px]",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

const DISPLAY_TM_SIZES: Record<BrandDisplaySize, string> = {
  sm: "text-[7px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

const INLINE_SIZES: Record<BrandInlineSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

const INLINE_TM_SIZES: Record<BrandInlineSize, string> = {
  sm: "text-[0.65em]",
  md: "text-[0.65em]",
  lg: "text-[0.6em]",
};

type BrandLogoVariant = "display" | "inline";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  size?: BrandDisplaySize;
  inlineSize?: BrandInlineSize;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "display",
  size = "sm",
  inlineSize = "md",
  className,
}) => {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "inline-flex items-baseline tracking-normal text-white leading-none font-light",
          INLINE_SIZES[inlineSize],
          className
        )}
      >
        Setlist
        <span className="font-semibold leading-none">GO</span>
        <span
          className={cn(
            "leading-none ml-[0.15em] align-text-top text-white/80",
            INLINE_TM_SIZES[inlineSize]
          )}
        >
          ™
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline tracking-normal text-white leading-none font-light mt-[10px] mb-[20px]",
        DISPLAY_SIZES[size],
        className
      )}
    >
      Setlist
      <span className="font-semibold text-white leading-none">GO</span>
      <span
        className={cn(
          "text-white/80 leading-none self-start",
          DISPLAY_TM_SIZES[size]
        )}
      >
        ™
      </span>
    </span>
  );
};
