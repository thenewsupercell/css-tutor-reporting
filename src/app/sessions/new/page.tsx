import type { Metadata } from "next";

import { SessionForm } from "@/components/session-form";

export const metadata: Metadata = {
  title: "Log session",
};

export default function NewSessionPage() {
  return <SessionForm />;
}
