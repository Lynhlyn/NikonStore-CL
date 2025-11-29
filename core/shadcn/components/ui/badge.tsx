"use client"

import type * as React from "react"
import { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm",
  {
    variants: {
      variant: {
        ordered: "bg-[#FFF8D6] border-[#FFCC33] text-black",
        delivering: "bg-[#D1F5D3] border-[#4ADE80] text-black",
        cancelled: "bg-[#FFDDDD] border-[#FF6B6B] text-black",
        preparing: "bg-[#D6F5FF] border-[#38BDF8] text-black",
        returned: "bg-[#F3D9FF] border-[#C084FC] text-black",
        delivered: "bg-[#E5E5E5] border-[#A3A3A3] text-black",
      },
    },
    defaultVariants: {
      variant: "ordered",
    },
  },
)

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const dotColors = {
    ordered: "bg-[#FFCC33]",
    delivering: "bg-[#4ADE80]",
    cancelled: "bg-[#FF6B6B]",
    preparing: "bg-[#38BDF8]",
    returned: "bg-[#C084FC]",
    delivered: "bg-[#A3A3A3]",
  }

  const dotColor = variant ? dotColors[variant] : dotColors.ordered

  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props}>
      <span className={cn("h-3 w-3 rounded-full", dotColor)} />
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }

