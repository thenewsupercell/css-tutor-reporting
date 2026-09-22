import type { Metadata } from "next";

import { MonthlyReports } from "@/components/monthly-reports";

export const metadata: Metadata = {
  title: "Monthly reports",
};

export default function ReportsPage() {
  return <MonthlyReports />;
}
