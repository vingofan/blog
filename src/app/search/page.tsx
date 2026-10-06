import type { Metadata } from "next";
import SearchPanel from "@/components/SearchPanel";
import PageHeading from "@/components/PageHeading";
import { buildSearchIndex } from "@/lib/search";
import { getAllTags } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "搜索",
  description: "按关键词搜索全站文章与摄影作品，支持标题、标签、正文与拍摄地点匹配。",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const docs = buildSearchIndex();
  const suggestions = getAllTags()
    .slice(0, 8)
    .map((t) => t.tag);

  return (
    <div className="container-page pt-14 sm:pt-20">
      <PageHeading
        eyebrow={`索引 ${docs.length} 条内容`}
        title="搜索"
        description="输入关键词即时筛选。多个关键词用空格分隔，会按「同时命中」来匹配。"
      />

      <div className="mt-12 max-w-3xl" data-reveal>
        <SearchPanel docs={docs} initialQuery={q ?? ""} suggestions={suggestions} />
      </div>
    </div>
  );
}
