type BrandLogoVariant = "wordmark" | "full";

const frameClassByVariant: Record<BrandLogoVariant, string> = {
  full: "min-h-[86px] min-w-[130px] rounded-[26px] border border-slate-200 bg-white px-5 py-4 shadow-[0_24px_70px_rgb(15_23_42/0.08)]",
  wordmark: "min-h-10 min-w-[132px] rounded-[16px] px-3 py-2",
};

export function BrandLogo({
  className = "",
  variant = "wordmark",
}: Readonly<{
  className?: string;
  priority?: boolean;
  variant?: BrandLogoVariant;
}>) {
  const isFull = variant === "full";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 bg-white text-slate-950 ${frameClassByVariant[variant]} ${className}`}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-xl bg-[#0b63ce] text-[11px] font-black tracking-[-0.04em] text-white"
      >
        B2
      </span>
      <span className="grid min-w-0 leading-none">
        <span className="whitespace-nowrap text-[20px] font-black tracking-[-0.08em] text-slate-950">
          B2B2G
        </span>
        {isFull ? (
          <span className="mt-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b63ce]">
            Trade OS
          </span>
        ) : (
          <span className="sr-only">Global Trade OS</span>
        )}
      </span>
    </span>
  );
}
