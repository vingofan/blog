import type { Metadata } from "next";
import Link from "next/link";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import PostCard from "@/components/PostCard";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "全部文字",
  description:
    "写字的地方、白日梦与摄影笔记的汇总列表，按时间倒序排列。",
  path: "/blog",
});

export default function BlogListPage() {
  const posts = getAllPosts();
  const tags = getAllTags().slice(0, 12);

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`共 ${posts.length} 篇`}
        title="全部文字"
        description="所有写下来的东西都在这里，不分板块。想分开看可以去各自的栏目。"
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { label: "写字的地方", href: "/writing" },
          { label: "白日梦", href: "/dreams" },
          { label: "摄影", href: "/gallery" },
        ].map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="mono-tag transition-colors hover:border-(--color-tech-dim) hover:text-(--color-fg)"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <EmptyHint
          text="还没有文章。"
          cmd="npm run new-post -- &quot;文章标题&quot; my-slug"
        />
      ) : (
      <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_240px] lg:gap-16">
        {/* 文章列表 */}
        <div data-reveal>
          {posts.map((post, i) => (
            <PostCard key={post.slug} post={post} variant="horizontal" priority={i === 0} />
          ))}
        </div>

        {/* 侧栏标签 */}
        <aside className="lg:sticky lg:top-28 lg:self-start" data-reveal>
          <h2 className="eyebrow">按标签浏览</h2>
          <ul className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:gap-3">
            {tags.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="inline-flex w-full items-center justify-between gap-3 rounded-full border border-(--color-line) px-3.5 py-1.5 text-[0.78rem] text-(--color-fg-muted) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-fg) lg:rounded-none lg:border-0 lg:border-b lg:border-(--color-line-soft) lg:px-0 lg:pb-3 lg:text-sm"
                >
                  <span>{tag}</span>
                  <span className="font-mono text-[0.65rem] text-(--color-fg-subtle)">
                    {count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/tags"
            className="link-underline mt-6 inline-block text-[0.8rem] text-(--color-fg-muted) hover:text-(--color-fg)"
          >
            全部标签 →
          </Link>
        </aside>
      </div>
      )}
    </div>
  );
}
