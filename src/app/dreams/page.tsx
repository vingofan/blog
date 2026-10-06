import type { Metadata } from "next";
import Link from "next/link";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import { getPostBySlug, getPostsBySection } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { getSection } from "@/config/sections";
import { formatDateCN } from "@/lib/utils";

const section = getSection("dream")!;

/** 超过这个字数的算长文，列表里只给摘要 + 阅读全文 */
const LONG_DREAM_WORDS = 200;

export const metadata: Metadata = buildMetadata({
  title: "白日梦",
  description: section.description,
  path: "/dreams",
});

export default async function DreamsPage() {
  const list = getPostsBySection("dream");

  const entries = await Promise.all(
    list.map(async (meta) => {
      const full = await getPostBySlug(meta.slug);
      return {
        meta,
        html: full?.html ?? "",
        isLong: meta.wordCount > LONG_DREAM_WORDS,
      };
    })
  );

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`${section.code} · 共 ${list.length} 则`}
        title="白日梦"
        description={section.description}
      />

      {list.length === 0 ? (
        <EmptyHint
          text="还没有做过的梦。"
          cmd="npm run new-post -- &quot;一句话&quot; my-slug --section dream"
        />
      ) : (
        <ul className="mt-14 flex flex-col gap-5">
          {entries.map(({ meta, html, isLong }) => (
            <li key={meta.slug} data-reveal>
              <article className="tech-card p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <time
                    dateTime={meta.date}
                    className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)"
                  >
                    {formatDateCN(meta.date)}
                  </time>
                  {isLong ? (
                    <span className="mono-tag">长</span>
                  ) : (
                    <span className="mono-tag">片段</span>
                  )}
                </div>

                {isLong ? (
                  <>
                    <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-(--color-fg)">
                      <Link
                        href={meta.url}
                        className="transition-colors hover:text-(--color-accent)"
                      >
                        {meta.title}
                      </Link>
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-(--color-fg-muted)">
                      {meta.excerpt}
                    </p>
                    <Link
                      href={meta.url}
                      className="mt-5 inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wider text-(--color-tech) transition-opacity hover:opacity-75"
                    >
                      阅读全文 →
                    </Link>
                  </>
                ) : (
                  <>
                    <div
                      className="prose-dream mt-4"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={meta.url}
                        className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle) transition-colors hover:text-(--color-tech)"
                      >
                        固定链接
                      </Link>
                      {!!meta.tags.length && (
                        <ul className="flex flex-wrap gap-1.5">
                          {meta.tags.map((tag) => (
                            <li key={tag}>
                              <Link href={`/tags/${encodeURIComponent(tag)}`} className="mono-tag">
                                #{tag}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
