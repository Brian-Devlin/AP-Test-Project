"use client";

import { ErrorState } from "@/components/ErrorState";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorState message="This page couldn't load. Please try again." onRetry={reset} />;
}
