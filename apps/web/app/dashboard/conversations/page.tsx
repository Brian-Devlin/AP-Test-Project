import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/PlaceholderPage";

export const metadata: Metadata = { title: "Conversations" };

export default function Page() {
  return (
    <PlaceholderPage
      title="Conversations"
      description="Chats from your website visitors."
      emptyTitle="No conversations yet"
      emptyDescription="Chats appear here after visitors use your widget."
    />
  );
}
