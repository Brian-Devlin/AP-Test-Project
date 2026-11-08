import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Install" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Install"
      description="Add the widget to your website."
      emptyTitle="Nothing to install yet"
      emptyDescription="Create a project to get its install snippet."
    />
  );
}
