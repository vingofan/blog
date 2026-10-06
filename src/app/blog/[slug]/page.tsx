import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import LazyImage from "@/components/LazyImage";
import PostCard from "@/components/PostCard";
import { siteConfig } from "@/config/site";
import {
  getAdjacentPosts,
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { formatDateCN } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "文章不存在", noIndex: true });

  return buildMetadata({
    title: post.title,
    description: post.description || post.excerpt,
    path: post.url,
    image: post.cover,
    type: "article",
    publishedTime: post.date,
    tags: post.tags,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    image: post.cover ? `${siteConfig.url}${post.cover}` : undefined,
    keywords: post.tags.join(", "),
    author: { "@type": "Person", name: post.author || siteConfig.author },
    publisher: { "@type": "Organization", name: siteConfig.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}${post.url}` },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* 文章头部 */}
      <header className="container-page pt-14 sm:pt-20">
        <nav aria-label="面包屑" className="font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
          <Link href="/" className="transition-colors hover:text-(--color-fg)">
            首页
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={
              post.sectionId === "dream"
                ? "/dreams"
                : post.sectionId === "photography"
                  ? "/gallery"
                  : "/writing"
            }
            className="transition-colors hover:text-(--color-fg)"
          >
            {post.sectionId === "dream"
              ? "白日梦"
              : post.sectionId === "photography"
                ? "摄影"
                : "写字的地方"}
          </Link>
        </nav>

        <h1 className="mt-6 max-w-4xl text-3xl font-semibold leading-[1.25] tracking-tight sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
          <time dateTime={post.date}>{formatDateCN(post.date)}</time>
          {post.updated && <span>最后更新 {post.updated}</span>}
          <span>约 {post.readingMinutes} 分钟</span>
          <span>{post.author || siteConfig.author}</span>
        </div>

        <p className="mt-6 max-w-3xl text-base leading-loose text-(--color-fg-muted) sm:text-lg">
          {post.excerpt}
        </p>

        {!!post.tags.length && (
          <ul className="mt-7 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="rounded-full border border-(--color-line) px-3 py-1 font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-accent)"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* 封面大图 */}
      {post.cover && (
        <figure className="container-wide mt-12 sm:mt-16">
          <LazyImage
            src={post.cover}
            alt={post.coverAlt || post.title}
            width={1600}
            height={900}
            priority
            className="w-full rounded-xl"
          />
        </figure>
      )}

      {/* 正文 + 目录 */}
      <div className="container-page mt-14 grid gap-14 sm:mt-20 lg:grid-cols-[1fr_200px] lg:gap-16">
        <div
          className="prose-photo min-w-0"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {post.toc.length > 1 && (
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
            <nav aria-label="目录">
              <h2 className="eyebrow">本页目录</h2>
              <ul className="mt-4 flex flex-col gap-2.5 border-l border-(--color-line-soft)">
                {post.toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`-ml-px block border-l border-transparent text-[0.8rem] leading-snug text-(--color-fg-muted) transition-colors hover:border-(--color-accent) hover:text-(--color-fg) ${
                        item.depth === 2 ? "pl-4" : "pl-8 text-[0.75rem]"
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>

      {/* 上一篇 / 下一篇 */}
      <nav
        aria-label="文章导航"
        className="container-page mt-20 grid gap-4 border-t border-(--color-line-soft) pt-10 sm:mt-24 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={prev.url}
            className="card-dark group p-6 transition-colors hover:border-(--color-accent-dim)"
          >
            <span className="eyebrow">更新的一篇</span>
            <span className="mt-2.5 block text-sm font-medium leading-snug text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={next.url}
            className="card-dark group p-6 text-right transition-colors hover:border-(--color-accent-dim) sm:col-start-2"
          >
            <span className="eyebrow">更早的一篇</span>
            <span className="mt-2.5 block text-sm font-medium leading-snug text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
              {next.title}
            </span>
          </Link>
        )}
      </nav>

      {/* 相关阅读 */}
      {related.length > 0 && (
        <section className="container-page mt-20 sm:mt-24">
          <h2 className="eyebrow">相关阅读</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
