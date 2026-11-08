import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Billing" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Billing"
      description="Your plan and subscription."
      emptyTitle="Billing is coming soon"
      emptyDescription="Plans and upgrades will appear here."
    />
  );
}
