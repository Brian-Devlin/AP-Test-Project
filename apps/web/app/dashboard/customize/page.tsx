import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Customize" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Customize"
      description="Change how your widget looks."
      emptyTitle="Nothing to customize yet"
      emptyDescription="Create a project to customize its widget."
    />
  );
}
