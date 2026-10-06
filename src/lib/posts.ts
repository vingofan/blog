/**
 * 文章数据源
 * ------------------------------------------------------------------
 * 唯一数据源：content/posts/*.md（文件名格式 YYYY-MM-DD-slug.md）
 * 新增文章 = 在 content/posts/ 下新建一个 .md 文件即可，无需改动任何代码。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { estimateReadingMinutes, extractToc, renderMarkdown } from "./markdown";
import type { Post, PostFrontmatter, PostMeta } from "./types";
import type { PostSectionId } from "@/config/sections";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/** 中文字数 + 英文词数，用于判断长短文（白日梦板块混排） */
function countWords(markdown: string): number {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_|\-]/g, " ");
  const cjk = text.match(/[一-龥]/g)?.length ?? 0;
  const latin = text.match(/[A-Za-z0-9]+/g)?.length ?? 0;
  return cjk + latin;
}

/** frontmatter 里没写 section 时，按 writing 处理 */
function normalizeSection(value: unknown): PostSectionId {
  return value === "dream" || value === "photography" ? value : "writing";
}

/** 文件名 2026-09-18-westlake-blue-hour.md → slug = westlake-blue-hour */
function fileToSlug(fileName: string): string {
  return fileName.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function readPostFile(fileName: string): PostMeta | null {
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data } = matter(raw);
  const fm = data as Partial<PostFrontmatter>;

  if (fm.draft) return null;
  if (!fm.title || !fm.date) return null;

  const slug = fileToSlug(fileName);
  const date = fm.date;
  const content = raw.replace(/^---[\s\S]*?\n---\n?/, "");
  const sectionId = normalizeSection(fm.section);

  return {
    title: fm.title,
    date,
    updated: fm.updated,
    excerpt: fm.excerpt ?? "",
    description: fm.description ?? fm.excerpt ?? "",
    cover: fm.cover ?? "",
    coverAlt: fm.coverAlt ?? fm.title,
    category: fm.category ?? "uncategorized",
    section: fm.section as PostFrontmatter["section"],
    sectionId,
    tags: fm.tags ?? [],
    draft: false,
    author: fm.author,
    readingTime: fm.readingTime,
    slug,
    url: `/blog/${slug}`,
    year: date.slice(0, 4),
    wordCount: countWords(content),
    readingMinutes:
      fm.readingTime && fm.readingTime > 0
        ? fm.readingTime
        : estimateReadingMinutes(content),
  };
}

let cache: PostMeta[] | null = null;

/**
 * 只在生产构建时缓存。
 * 开发模式下必须每次重新读目录——content/posts 是通过 fs 读取的，
 * 不在 Next 的模块依赖图里，文件变化不会触发模块重新求值，
 * 一旦缓存住，新增/修改文章就必须重启 dev 才能看到。
 */
const useCache = process.env.NODE_ENV === "production";

/** 全部已发布文章，按日期倒序 */
export function getAllPosts(): PostMeta[] {
  if (useCache && cache) return cache;

  if (!fs.existsSync(POSTS_DIR)) {
    cache = [];
    return cache;
  }

  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPostFile)
    .filter((p): p is PostMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  cache = posts;
  return posts;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/** 首页用的最新文章 */
export function getLatestPosts(limit = 6): PostMeta[] {
  return getAllPosts().slice(0, limit);
}

/** 按板块取文章（写字的地方 / 白日梦 / 摄影笔记） */
export function getPostsBySection(section: PostSectionId): PostMeta[] {
  return getAllPosts().filter((p) => p.sectionId === section);
}

/** 某板块的文章数，用于首页角标 */
export function getSectionCounts(): Record<PostSectionId, number> {
  const all = getAllPosts();
  return {
    writing: all.filter((p) => p.sectionId === "writing").length,
    dream: all.filter((p) => p.sectionId === "dream").length,
    photography: all.filter((p) => p.sectionId === "photography").length,
  };
}

/** 依 slug 找到对应的文件名 */
function findFileName(slug: string): string | null {
  if (!fs.existsSync(POSTS_DIR)) return null;
  return (
    fs
      .readdirSync(POSTS_DIR)
      .find((f) => f.endsWith(".md") && fileToSlug(f) === slug) ?? null
  );
}

/** 文章详情（含渲染后的正文与目录） */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fileName = findFileName(slug);
  if (!fileName) return null;

  const meta = readPostFile(fileName);
  if (!meta) return null;

  const full = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { content } = matter(full);

  const html = await renderMarkdown(content);
  return { ...meta, html, toc: extractToc(content) };
}

/** 上一篇 / 下一篇 */
export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: posts[i - 1] ?? null, // 更新的一篇
    next: posts[i + 1] ?? null, // 更旧的一篇
  };
}

/** 标签 → 文章数 */
export function getAllTags(): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      map.set(tag, (map.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.includes(tag));
}

/** 归档：按年份分组 */
export function getArchive(): { year: string; posts: PostMeta[] }[] {
  const map = new Map<string, PostMeta[]>();
  for (const post of getAllPosts()) {
    const list = map.get(post.year) ?? [];
    list.push(post);
    map.set(post.year, list);
  }
  return Array.from(map.entries())
    .map(([year, posts]) => ({ year, posts }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}

/** 相关推荐：共享标签数量最多的几篇 */
export function getRelatedPosts(slug: string, limit = 3): PostMeta[] {
  const posts = getAllPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];

  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => {
      const shared = p.tags.filter((t) => current.tags.includes(t)).length;
      const sameCategory = p.category === current.category ? 1 : 0;
      return { post: p, score: shared * 2 + sameCategory };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.post);
}
