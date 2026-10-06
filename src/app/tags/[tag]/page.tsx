import type { Metadata } from "next";
import Link from "next/link";
import GalleryGrid from "@/components/GalleryGrid";
import PageHeading from "@/components/PageHeading";
import PostCard from "@/components/PostCard";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { categories, getCategoryCounts, photos } from "@/lib/photos";
import { buildMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return buildMetadata({
    title: `#${decoded}`,
    description: `标签「${decoded}」下的全部文章与摄影作品。`,
    path: `/tags/${encodeURIComponent(decoded)}`,
    tags: [decoded],
  });
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const posts = getPostsByTag(decoded);
  const photoList = photos.filter((p) => p.tags.includes(decoded));

  return (
    <div className="container-page pt-14 sm:pt-20">
      <nav aria-label="面包屑" className="font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
        <Link href="/" className="transition-colors hover:text-(--color-fg)">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="transition-colors hover:text-(--color-fg)">标签</Link>
      </nav>

      <div className="mt-6">
        <PageHeading
          eyebrow={`${posts.length} 篇文章 · ${photoList.length} 张作品`}
          title={`#${decoded}`}
        />
      </div>

      {posts.length > 0 && (
        <section className="mt-12" data-reveal>
          <h2 className="eyebrow">文章</h2>
          <div className="mt-6">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      {photoList.length > 0 && (
        <section className="mt-20" data-reveal>
          <h2 className="eyebrow">作品</h2>
          <div className="mt-6">
            <GalleryGrid
              photos={photoList}
              categories={categories}
              counts={getCategoryCounts()}
              showFilters={false}
            />
          </div>
        </section>
      )}

      {posts.length === 0 && photoList.length === 0 && (
        <p className="mt-16 text-center text-sm text-(--color-fg-subtle)">
          这个标签下暂时没有内容。
        </p>
      )}
    </div>
  );
}
