import Link from "next/link";
import { siteConfig } from "@/config/site";
import { sections } from "@/config/sections";
import { categories } from "@/lib/photos";
import Logo from "@/components/Logo";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-28 border-t border-(--color-line-soft) bg-(--color-base-soft)">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Logo size={32} className="shrink-0" />
            <div className="leading-none">
              <p className="text-sm font-semibold tracking-[0.14em] text-(--color-fg)">
                {siteConfig.name}
              </p>
              {/* 副标与页头保持一致，不要各写一套 */}
              <p className="mt-1.5 font-mono text-[0.6rem] tracking-[0.22em] text-(--color-fg-subtle)">
                LIN XI
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-(--color-fg-muted)">
            {siteConfig.description}
          </p>
          <p className="mt-5 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
            {siteConfig.author} · {siteConfig.location}
          </p>
        </div>

        <div>
          <h2 className="eyebrow">板块</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {sections.map((s) => (
              <li key={s.id}>
                <Link
                  href={s.href}
                  className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow">摄影分类</h2>
          <ul className="mt-4 flex flex-col gap-2.5">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/gallery?category=${c.id}`}
                  className="link-underline text-sm text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-(--color-line-soft)">
        <div className="container-page flex flex-col gap-3 py-6 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle) sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteConfig.author}. 保留所有权利。</p>
          <ul className="flex gap-5">
            {siteConfig.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-(--color-fg)"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
