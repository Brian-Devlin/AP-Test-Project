import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Knowledge" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Knowledge"
      description="The documents your bot answers from."
      emptyTitle="No knowledge yet"
      emptyDescription="Add text or upload a PDF, Markdown or TXT file once you have a project."
    />
  );
}
