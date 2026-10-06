/**
 * 构建全站搜索索引（服务端）
 * ------------------------------------------------------------------
 * 索引 = 文章（标题 / 摘要 / 标签 / 正文）+ 作品（标题 / 说明 / 地点 / 标签 / 器材）
 * 由各页面在构建时生成，序列化进 JSON 交给客户端组件做即时搜索。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { getAllPosts } from "./posts";
import { getCategoryLabel, photos } from "./photos";
import { projects } from "./projects";
import type { SearchDoc } from "./types";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const BODY_LIMIT = 1200;

function plainText(markdown: string): string {
  return markdown
    .replace(/^---[\s\S]*?\n---\n?/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`_|\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let cache: SearchDoc[] | null = null;

// 同 posts.ts：仅生产构建缓存，保证 dev 下改内容即时生效
const useCache = process.env.NODE_ENV === "production";

export function buildSearchIndex(): SearchDoc[] {
  if (useCache && cache) return cache;

  const docs: SearchDoc[] = [];

  // 1) 文章
  for (const post of getAllPosts()) {
    let body = "";
    const fileName = fs
      .readdirSync(POSTS_DIR)
      .find((f) => f.endsWith(".md") && f.includes(post.slug));
    if (fileName) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
      const { content } = matter(raw);
      body = plainText(content).slice(0, BODY_LIMIT);
    }

    docs.push({
      type: "post",
      title: post.title,
      url: post.url,
      excerpt: post.excerpt,
      date: post.date,
      tags: post.tags,
      cover: post.cover,
      haystack: [post.title, post.excerpt, post.category, post.tags.join(" "), body]
        .filter(Boolean)
        .join(" "),
    });
  }

  // 2) 作品
  for (const photo of photos) {
    docs.push({
      type: "photo",
      title: photo.title,
      url: `/gallery?category=${photo.category}`,
      excerpt: photo.caption || photo.categoryLabel,
      date: photo.date,
      tags: [...photo.tags, getCategoryLabel(photo.category)],
      cover: photo.src,
      haystack: [
        photo.title,
        photo.caption,
        photo.location,
        photo.categoryLabel,
        photo.camera,
        photo.lens,
        photo.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  // 3) 项目
  for (const project of projects) {
    docs.push({
      type: "project",
      title: project.name,
      url: `/projects/${project.id}`,
      excerpt: project.tagline,
      date: project.year,
      tags: [...project.tags, project.status, ...(project.stack ?? [])],
      cover: project.cover,
      haystack: [
        project.name,
        project.tagline,
        project.status,
        project.year,
        project.body,
        project.tags.join(" "),
        (project.stack ?? []).join(" "),
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  cache = docs;
  return docs;
}
