import type { ReactNode } from "react";
import { GlassPanel } from "./GlassPanel";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <GlassPanel className="flex flex-col items-center px-6 py-16 text-center">
      <div aria-hidden="true" className="mb-4 size-12 rounded-full border border-dashed border-line-strong" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </GlassPanel>
  );
}
