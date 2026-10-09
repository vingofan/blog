import Link from "next/link";
import { notFound } from "next/navigation";
import { getSection, type WorkKind } from "@/config/sections";
import { renderMarkdown } from "@/lib/markdown";
import { getWork, getWorks, workUrl } from "@/lib/projects";

/**
 * Skills / 产品 两个板块共用的详情页。两个路由（/skills/[slug]、/products/[slug]）各自只是一层薄壳，
 * 把 kind 传进来；页面长什么样只在这里维护一份。
 */
export default async function WorkDetail({ kind, slug }: { kind: WorkKind; slug: string }) {
  const section = getSection(kind)!;
  const project = getWork(kind, slug);
  if (!project) notFound();

  const html = project.body ? await renderMarkdown(project.body) : "";
  const others = getWorks(kind).filter((p) => p.id !== project.id).slice(0, 3);

  return (
    <article className="container-page pt-14 sm:pt-20">
      <nav
        aria-label="面包屑"
        className="font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)"
      >
        <Link href="/" className="transition-colors hover:text-(--color-fg)">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link href={section.href} className="transition-colors hover:text-(--color-fg)">
          {section.label}
        </Link>
      </nav>

      <header className="mt-8 border-b border-(--color-line-soft) pb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono-tag">{project.status}</span>
          <span className="font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle)">
            {project.year}
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {project.name}
        </h1>

        <p className="mt-5 max-w-2xl text-[1rem] leading-loose text-(--color-fg-muted)">
          {project.tagline}
        </p>

        {(!!project.tags.length || !!project.stack?.length) && (
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
            {!!project.tags.length && (
              <div>
                <h2 className="eyebrow">标签</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <li key={tag} className="mono-tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!project.stack?.length && (
              <div>
                <h2 className="eyebrow">用了什么</h2>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {project.stack.map((s) => (
                    <li key={s} className="mono-tag">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!!project.links?.length && (
          <ul className="mt-8 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 border border-(--color-line) px-4 py-2 text-[0.78rem] tracking-wide text-(--color-fg) transition-colors hover:border-(--color-tech-dim) hover:text-(--color-tech)"
                >
                  {link.label}
                  <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {project.cover && (
        <figure className="mt-12">
          <div className="overflow-hidden rounded-xl border border-(--color-line) bg-(--color-surface)">
            {/* 截图类图片用原生 img：来源是本地已压缩的静态文件，不需要 next/image 优化 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover}
              alt={project.coverAlt ?? `${project.name} 界面截图`}
              width={1800}
              height={1012}
              loading="lazy"
              className="block w-full"
            />
          </div>
          {project.coverAlt && (
            <figcaption className="mt-3 font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle)">
              {project.coverAlt}
            </figcaption>
          )}
        </figure>
      )}

      {html ? (
        <div
          className="prose-photo mt-14 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="mt-14 max-w-2xl text-sm leading-loose text-(--color-fg-subtle)">
          这一条还没写细节。在 <code>content/projects.json</code> 里给它的 body 字段补一段 Markdown 就行。
        </p>
      )}

      {others.length > 0 && (
        <section className="mt-24 border-t border-(--color-line-soft) pt-12">
          <h2 className="eyebrow">{section.label}里的其他内容</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {others.map((p) => (
              <li key={p.id}>
                <Link href={workUrl(p)} className="card-dark block p-5 transition-colors hover:border-(--color-tech-dim)">
                  <span className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                    {p.status} · {p.year}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-(--color-fg)">
                    {p.name}
                  </span>
                  <span className="mt-1.5 block line-clamp-2 text-[0.8rem] leading-relaxed text-(--color-fg-muted)">
                    {p.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
