import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "./cn";

type GlassPanelProps<T extends ElementType> = {
  as?: T;
  padded?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** A blurred, translucent panel. The base surface of the dashboard. */
export function GlassPanel<T extends ElementType = "div">({
  as,
  padded = true,
  className,
  ...props
}: GlassPanelProps<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={cn("glass rounded-panel", padded && "p-6", className)} {...props} />;
}
