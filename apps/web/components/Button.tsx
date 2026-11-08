import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-ink-inverse hover:bg-ink/85",
  secondary: "bg-paper text-ink border border-line hover:border-line-strong",
  ghost: "bg-transparent text-ink hover:bg-hover",
};

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium shadow-control transition-colors disabled:pointer-events-none disabled:opacity-50",
    variant === "ghost" && "shadow-none",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant };

export function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
