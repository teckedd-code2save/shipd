import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const surfaceVariants = cva(
  "panel",
  {
    variants: {
      tone: {
        default: "",
        muted:
          "bg-[linear-gradient(180deg,rgba(255,255,255,0.014),transparent_28%),rgba(24,27,36,0.88)]",
        raised:
          "shadow-[0_24px_52px_rgba(5,9,24,0.24)]",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

type SurfaceElement = "section" | "div" | "aside" | "article" | "header"

interface SurfaceProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof surfaceVariants> {
  as?: SurfaceElement
}

function Surface({
  as: Comp = "section",
  className,
  tone,
  ...props
}: SurfaceProps) {
  return (
    <Comp
      data-slot="surface"
      data-tone={tone}
      className={cn(surfaceVariants({ tone }), className)}
      {...props}
    />
  )
}

function SurfaceHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="surface-header"
      className={cn(
        "flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5",
        className
      )}
      {...props}
    />
  )
}

function SurfaceTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="surface-title"
      className={cn("m-0 font-heading text-2xl leading-tight tracking-[-0.04em]", className)}
      {...props}
    />
  )
}

function SurfaceDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="surface-description"
      className={cn("m-0 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Surface, SurfaceHeader, SurfaceTitle, SurfaceDescription, surfaceVariants }
