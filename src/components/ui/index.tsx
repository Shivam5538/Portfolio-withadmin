"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Badge ──────────────────────────────────────────────────────── */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "subtle" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[#111111] text-white",
      accent: "bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 text-white",
      subtle: "bg-[rgba(0,0,0,0.06)] text-[#111111]",
      outline: "border border-[rgba(0,0,0,0.12)] text-[#6b7280]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

/* ─── Input ──────────────────────────────────────────────────────── */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#9ca3af]",
      "transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-0 focus:border-transparent",
      "hover:border-[rgba(0,0,0,0.2)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

/* ─── Textarea ───────────────────────────────────────────────────── */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-[rgba(0,0,0,0.1)] bg-white px-4 py-3 text-sm text-[#111111] placeholder:text-[#9ca3af]",
      "resize-none transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-0 focus:border-transparent",
      "hover:border-[rgba(0,0,0,0.2)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/* ─── Label ──────────────────────────────────────────────────────── */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-[#374151] mb-1.5",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

/* ─── Card ───────────────────────────────────────────────────────── */
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-[rgba(0,0,0,0.07)] bg-white",
        "shadow-[0_2px_12px_rgba(0,0,0,0.05)]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ─── FormError ──────────────────────────────────────────────────── */
const FormError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
};

export { Badge, Input, Textarea, Label, Card, FormError };
