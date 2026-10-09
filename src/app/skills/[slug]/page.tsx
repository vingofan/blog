import type { Metadata } from "next";
import WorkDetail from "@/components/work/WorkDetail";
import { getWork, getWorks, workUrl } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getWorks("skill").map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWork("skill", slug);
  if (!project) return buildMetadata({ title: "内容不存在", noIndex: true });

  return buildMetadata({
    title: project.name,
    description: project.tagline,
    path: workUrl(project),
    image: project.cover,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <WorkDetail kind="skill" slug={slug} />;
}
