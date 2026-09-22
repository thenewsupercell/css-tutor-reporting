import type { Metadata } from "next";

import { Students } from "@/components/students";

export const metadata: Metadata = {
  title: "Students",
};

export default function StudentsPage() {
  return <Students />;
}
