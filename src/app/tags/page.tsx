import type { Metadata } from "next";
import Link from "next/link";
import EmptyHint from "@/components/EmptyHint";
import PageHeading from "@/components/PageHeading";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { getAllPhotoTags } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";
import { unique } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "标签",
  description: "按标签检索全部文章与摄影作品，快速跳转到同一主题下的所有内容。",
  path: "/tags",
});

export default function TagsPage() {
  const tags = getAllTags();
  const photoTags = getAllPhotoTags();
  const allTags = unique([...tags.map((t) => t.tag), ...photoTags]);
  const postCount = new Map(tags.map((t) => [t.tag, t.count]));

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`共 ${allTags.length} 个标签`}
        title="标签与主题"
        description="文章和作品用的是同一套标签树。点击任意标签可以看到该主题下的全部内容。"
      />

      {allTags.length === 0 ? (
        <EmptyHint text="还没有标签，发布文章或作品后会自动生成。" />
      ) : (
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-reveal>
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="card-dark group flex items-baseline justify-between gap-3 px-4 py-5 transition-colors hover:border-(--color-accent-dim)"
          >
            <span className="text-sm text-(--color-fg-muted) transition-colors group-hover:text-(--color-accent)">
              #{tag}
            </span>
            <span className="font-mono text-[0.68rem] text-(--color-fg-subtle)">
              {postCount.get(tag) ?? 0}
            </span>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}
