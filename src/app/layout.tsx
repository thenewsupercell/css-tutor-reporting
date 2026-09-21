import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { DemoDataProvider } from "@/components/demo-data-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "LVAEP Tutor Reporting",
  description: "Tutoring activity and monthly reporting for LVAEP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <DemoDataProvider>
          <AppShell>{children}</AppShell>
        </DemoDataProvider>
      </body>
    </html>
  );
}
