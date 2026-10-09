import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import ProjectCard from "@/components/ProjectCard";
import { getSection, type WorkKind } from "@/config/sections";
import { getWorkCounts, getWorks } from "@/lib/projects";

const EMPTY: Record<WorkKind, { text: string; cmd: string }> = {
  skill: {
    text: "还没有放上来的 Skill。",
    cmd: 'npm run new-project -- "Skill 名" my-slug --kind skill --tagline 一句话简介',
  },
  product: {
    text: "还没有挂上来的产品。",
    cmd: 'npm run new-project -- "产品名" my-slug --kind product --tagline 一句话简介',
  },
};

/** Skills / 产品 两个板块共用的列表页，路由文件只负责把 kind 传进来 */
export default function WorkList({ kind }: { kind: WorkKind }) {
  const section = getSection(kind)!;
  const items = getWorks(kind);
  const counts = getWorkCounts(kind);

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`${section.code} · 共 ${items.length} ${section.unit}`}
        title={section.label}
        description={section.description}
      />

      {items.length === 0 ? (
        <EmptyHint text={EMPTY[kind].text} cmd={EMPTY[kind].cmd} />
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
            {items.map((project, i) => (
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
