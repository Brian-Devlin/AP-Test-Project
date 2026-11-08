type LoadingStateProps = { label?: string };

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="glass rounded-panel flex flex-col items-center px-6 py-16">
      <div aria-hidden="true" className="size-8 animate-spin rounded-full border-2 border-line border-t-ink" />
      <p className="mt-4 text-sm text-ink-muted">{label}</p>
    </div>
  );
}
