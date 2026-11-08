import type { Metadata } from "next";
import type { ReactNode } from "react";
import { APP_NAME } from "@askwell/shared";
import { DashboardNav } from "@/components/DashboardNav";

export const metadata: Metadata = {
  title: { default: `Dashboard · ${APP_NAME}`, template: `%s · ${APP_NAME}` },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-backdrop min-h-dvh md:flex md:gap-6 md:p-4">
      <DashboardNav />
      <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 md:px-2 md:py-4">{children}</main>
    </div>
  );
}
