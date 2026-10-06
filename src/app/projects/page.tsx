import type { Metadata } from "next";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import ProjectCard from "@/components/ProjectCard";
import { getProjectCounts, projects } from "@/lib/projects";
import { buildMetadata } from "@/lib/seo";
import { getSection } from "@/config/sections";

const section = getSection("project")!;

export const metadata: Metadata = buildMetadata({
  title: "好玩的项目",
  description: section.description,
  path: "/projects",
});

export default function ProjectsPage() {
  const counts = getProjectCounts();

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`${section.code} · 共 ${projects.length} 个`}
        title="好玩的项目"
        description={section.description}
      />

      {projects.length === 0 ? (
        <EmptyHint
          text="还没有挂上来的项目。"
          cmd="npm run new-project -- &quot;项目名&quot; my-slug --tagline 一句话简介"
        />
      ) : (
        <>
          {/* 状态概览 */}
          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 font-mono text-[0.7rem] tracking-wider">
            {(
              [
                ["进行中", counts["进行中"] ?? 0],
                ["已完成", counts["已完成"] ?? 0],
                ["搁置", counts["搁置"] ?? 0],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="text-(--color-fg-subtle)">{label}</dt>
                <dd className="text-(--color-fg)">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div key={project.id} data-reveal data-reveal-delay={(i % 3) * 90}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
