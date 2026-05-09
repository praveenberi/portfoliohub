export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { MockInterview } from "@/components/mock-interview/mock-interview";

export const metadata: Metadata = { title: "Mock Interview — myskillspage" };

export default function MockInterviewPage() {
  return <MockInterview />;
}
