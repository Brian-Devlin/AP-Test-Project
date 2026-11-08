import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description="Each project is one support widget for one website." />
      <EmptyState
        title="No projects yet"
        description="Create a project to add knowledge and install the widget on your site."
      />
    </>
  );
}
