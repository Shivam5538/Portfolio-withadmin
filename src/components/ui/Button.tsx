"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#111111] text-white hover:bg-[#222222] hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus-visible:ring-[#111111]",
        secondary:
          "bg-transparent text-[#111111] border border-[rgba(0,0,0,0.12)] hover:border-[rgba(0,0,0,0.25)] hover:bg-[rgba(0,0,0,0.04)] active:scale-[0.98]",
        ghost:
          "bg-transparent text-[#111111] hover:bg-[rgba(0,0,0,0.05)] active:scale-[0.98]",
        gradient:
          "text-white bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 hover:opacity-90 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        danger:
          "bg-red-500 text-white hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-4 text-sm",
        md: "h-10 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
