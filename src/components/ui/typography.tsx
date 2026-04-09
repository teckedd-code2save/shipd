import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";
type HeadingSize = "display" | "hero" | "section" | "card";

const headingSizeMap: Record<HeadingSize, string> = {
  display: "m-0 text-balance font-heading text-[clamp(32px,5vw,56px)] leading-[1.08] tracking-[-0.05em]",
  hero: "m-0 text-balance font-heading text-[clamp(24px,4vw,38px)] leading-[1.12] tracking-[-0.045em]",
  section: "m-0 text-balance font-heading text-[clamp(22px,4vw,34px)] leading-[1.16] tracking-[-0.04em]",
  card: "m-0 font-heading text-xl leading-tight tracking-[-0.03em]"
};

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
}

export function Heading({
  as: Tag = "h2",
  size = "section",
  className,
  ...props
}: HeadingProps) {
  return <Tag className={cn(headingSizeMap[size], className)} {...props} />;
}

export function Kicker({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] font-medium tracking-[0.18em] text-primary uppercase",
        "m-0",
        className
      )}
      {...props}
    />
  );
}

export function Lead({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-balance text-[15px] leading-7 text-muted-foreground sm:text-base",
        "m-0",
        className
      )}
      {...props}
    />
  );
}

export function FinePrint({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("m-0 font-mono text-[11px] text-muted-foreground", className)} {...props} />;
}
