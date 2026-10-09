import type { Metadata } from "next";
import WorkList from "@/components/work/WorkList";
import { getSection } from "@/config/sections";
import { buildMetadata } from "@/lib/seo";

const section = getSection("skill")!;

export const metadata: Metadata = buildMetadata({
  title: section.label,
  description: section.description,
  path: section.href,
});

export default function Page() {
  return <WorkList kind="skill" />;
}
