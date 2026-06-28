import Image from "next/image";

const LOGO_SRC = "/b2bb2g-logo.jpg";
const LOGO_ALT = "B2BB2G Global Strategic Network";

type BrandLogoVariant = "wordmark" | "full";

const frameClassByVariant: Record<BrandLogoVariant, string> = {
  full: "h-[92px] w-[138px] rounded-[12px] bg-surface-void p-1.5",
  wordmark: "h-8 w-[132px] rounded-[9px] bg-surface-void",
};

const imageClassByVariant: Record<BrandLogoVariant, string> = {
  full: "object-contain",
  wordmark: "object-cover object-[center_54%]",
};

export function BrandLogo({
  className = "",
  priority = false,
  variant = "wordmark",
}: Readonly<{
  className?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
}>) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden ${frameClassByVariant[variant]} ${className}`}
    >
      <Image
        alt={LOGO_ALT}
        className={`h-full w-full ${imageClassByVariant[variant]}`}
        height={922}
        priority={priority}
        sizes={variant === "wordmark" ? "132px" : "138px"}
        src={LOGO_SRC}
        width={1382}
      />
    </span>
  );
}
