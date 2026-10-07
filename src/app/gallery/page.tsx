import type { Metadata } from "next";
import Link from "next/link";
import GalleryStage from "@/components/GalleryStage";
import { categories, getCategoryCounts, photos } from "@/lib/photos";
import { getPostsBySection } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { getSection } from "@/config/sections";

const section = getSection("photography")!;

export const metadata: Metadata = buildMetadata({
  title: "摄影",
  description: section.description,
  path: "/gallery",
});

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const valid = categories.some((c) => c.id === category);
  const initialCategory = valid ? category! : "all";
  const notes = getPostsBySection("photography");

  // 页头渲染进右列顶部，这样左列面板能从视口顶端就占满整屏
  const header = (
    <header key="gallery-header" className="mb-10 lg:mb-12">
      {/* 板块名不再单占一行大字——右列顶部要留给画框，眉标本身兼任 h1 */}
      <h1 className="eyebrow">
        {section.code} · 共 {photos.length} 张
      </h1>
      {/* sm:text-[1rem] 而非 sm:text-base —— --color-base 撞名会把文字染成底色 */}
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--color-fg-subtle) sm:text-[1rem]">
        {section.description}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-(--color-line-soft) pb-6 font-mono text-[0.66rem] tracking-wider text-(--color-fg-subtle)">
        <span>点图卡放上左栏舞台</span>
        <span className="text-(--color-line)">/</span>
        <span>没人操作时舞台自行巡览</span>
        <span className="text-(--color-line) lg:hidden">/</span>
        <span className="lg:hidden">手机上点图直接看原图</span>
      </div>
    </header>
  );

  return (
    <div>
      {/* 舞台：左侧固定整屏面板 + 右侧页头与卡片列 */}
      <GalleryStage
        photos={photos}
        categories={categories}
        counts={getCategoryCounts()}
        initialCategory={initialCategory}
        header={header}
      />

      {/* 摄影笔记：写在 content/posts 里、section 为 photography 的文章 */}
      {notes.length > 0 && (
        <section className="mx-auto mt-24 max-w-3xl border-t border-(--color-line-soft) px-5 pt-12 lg:mt-32">
          <p className="eyebrow">拍摄笔记</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            照片背后的话
          </h2>
          <ul className="mt-8 flex flex-col">
            {notes.map((post) => (
              <li
                key={post.slug}
                className="border-b border-(--color-line-soft) last:border-0"
              >
                <Link
                  href={post.url}
                  className="group flex flex-wrap items-baseline justify-between gap-3 py-5"
                >
                  <span className="text-[0.95rem] font-medium text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
                    {post.title}
                  </span>
                  <span className="font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                    {post.date} · 约 {post.readingMinutes} 分钟
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
