import Link from "next/link";
import { cx } from "@/lib/utils";
import type { Project } from "@/lib/types";

const STATUS_STYLE: Record<string, string> = {
  进行中: "border-(--color-accent-dim) text-(--color-accent)",
  已完成: "border-(--color-tech-dim) text-(--color-tech)",
  搁置: "border-(--color-line) text-(--color-fg-subtle)",
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="tech-card group flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cx(
            "rounded-full border px-2.5 py-0.5 font-mono text-[0.62rem] tracking-wider",
            STATUS_STYLE[project.status] ?? STATUS_STYLE["搁置"]
          )}
        >
          {project.status}
        </span>
        <span className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
          {project.year}
        </span>
      </div>

      <h3 className="mt-5 text-[1rem] font-semibold leading-snug tracking-tight text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
        <Link href={`/projects/${project.id}`}>{project.name}</Link>
      </h3>

      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-(--color-fg-muted)">
        {project.tagline}
      </p>

      {!!project.tags.length && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <li key={tag} className="mono-tag">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/projects/${project.id}`}
        className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle) transition-colors group-hover:text-(--color-tech)"
      >
        看看细节
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </Link>
    </article>
  );
}
