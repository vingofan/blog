import type { Metadata } from "next";
import Link from "next/link";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import PostCard from "@/components/PostCard";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { getSection } from "@/config/sections";

const section = getSection("article")!;

export const metadata: Metadata = buildMetadata({
  title: section.label,
  description: section.description,
  path: "/blog",
});

export default function BlogListPage() {
  const posts = getAllPosts();
  const tags = getAllTags().slice(0, 12);

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`${section.code} · 共 ${posts.length} ${section.unit}`}
        title={section.label}
        description={section.description}
      />

      {posts.length === 0 ? (
        <EmptyHint
          text="还没有写下来的东西。"
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
