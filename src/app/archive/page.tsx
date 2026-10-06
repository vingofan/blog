import type { Metadata } from "next";
import Link from "next/link";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import { getAllPosts, getArchive } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "归档",
  description: "按年份整理的全部文章，从最新一篇一路翻到这里看过的所有拍摄笔记。",
  path: "/archive",
});

export default function ArchivePage() {
  const archive = getArchive();
  const total = getAllPosts().length;

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`共 ${total} 篇 · ${archive.length} 个年份`}
        title="归档"
        description="按时间倒序排列的全部文章。"
      />

      {archive.length === 0 ? (
        <EmptyHint
          text="还没有文章。"
          cmd="npm run new-post -- &quot;文章标题&quot; my-slug"
        />
      ) : (
      <div className="mt-14 flex flex-col gap-16" data-reveal>
        {archive.map(({ year, posts }) => (
          <section key={year}>
            <h2 className="flex items-baseline gap-4 border-b border-(--color-line-soft) pb-3 font-mono text-2xl font-normal tracking-wider text-(--color-fg-subtle)">
              {year}
              <span className="text-[0.7rem] tracking-widest">{posts.length} 篇</span>
            </h2>

            <ul className="mt-2">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={post.url}
                    className="group flex flex-col gap-1.5 border-b border-(--color-line-soft) py-5 sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <time
                      dateTime={post.date}
                      className="shrink-0 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)"
                    >
                      {post.date.slice(5)}
                    </time>
                    <span className="flex-1 text-[0.95rem] text-(--color-fg-muted) transition-colors group-hover:text-(--color-accent)">
                      {post.title}
                    </span>
                    <span className="shrink-0 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                      {post.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      )}
    </div>
  );
}
