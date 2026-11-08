import { EmptyState } from "./EmptyState";
import { PageHeader } from "./PageHeader";

type PlaceholderPageProps = { title: string; description: string; emptyTitle: string; emptyDescription: string };

/** A dashboard page whose feature isn't built yet. */
export function PlaceholderPage({ title, description, emptyTitle, emptyDescription }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </>
  );
}
