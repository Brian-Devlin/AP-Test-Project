import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <GlassPanel role="alert" className="flex flex-col items-center px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="mb-4 flex size-12 items-center justify-center rounded-full border-2 border-ink text-xl font-bold"
      >
        !
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </GlassPanel>
  );
}
