import Link from "next/link";
import { sections } from "@/config/sections";

/**
 * 四个板块的入口卡。
 * counts 用来显示每个板块当前有多少内容，没有就不显示数量。
 */
export default function SectionNav({
  counts,
  className,
}: {
  counts?: Record<string, number>;
  className?: string;
}) {
  return (
    <div className={className}>
      <ul className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const count = counts?.[s.id];
          return (
            <li key={s.id}>
              <Link href={s.href} className="tech-card group block h-full p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="tech-index">{s.index}</span>
                  <span className="font-mono text-[0.62rem] tracking-[0.2em] text-(--color-fg-subtle) transition-colors group-hover:text-(--color-tech)">
                    {s.code}
                  </span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
                    {s.label}
                  </h3>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden
                    className="mb-1 shrink-0 text-(--color-fg-subtle) transition-all duration-300 group-hover:translate-x-1 group-hover:text-(--color-tech)"
                  >
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                </div>

                <p className="mt-2.5 text-sm leading-relaxed text-(--color-fg-muted)">
                  {s.tagline}
                </p>

                {typeof count === "number" && (
                  <p className="mt-5 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                    {count} 条内容
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
