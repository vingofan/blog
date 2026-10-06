/**
 * 全站共享的类型定义
 * 修改数据源（content/photos.json、content/posts/*.md、content/projects.json）时以此为准。
 */
import type { PostSectionId } from "@/config/sections";

/** 作品分类：id 对应 content/categories.json */
export interface Category {
  id: string;
  label: string;
  description: string;
}

/** 一张摄影作品 */
export interface Photo {
  id: string;
  title: string;
  category: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  location?: string;
  camera?: string;
  lens?: string;
  settings?: string;
  date: string;
  tags: string[];
  featured?: boolean;
}

/** 附带分类信息的作品，便于页面直接渲染 */
export interface PhotoWithMeta extends Photo {
  categoryId: string;
  categoryLabel: string;
  slug: string;
  /** 拍摄年份，从 date 派生，用作网格卡的分组标签 */
  year: string;
  /** 标题是否人工写过。false 表示导入脚手架留下的 `日期 · 文件名` 占位标题 */
  curated: boolean;
}

/** 文章 frontmatter（content/posts/*.md 顶部 YAML） */
export interface PostFrontmatter {
  title: string;
  date: string;
  updated?: string;
  excerpt: string;
  description?: string;
  cover: string;
  coverAlt?: string;
  category: string;
  /** 归属板块：写字的地方 / 白日梦 / 摄影笔记。缺省按 writing 处理 */
  section?: PostSectionId;
  tags: string[];
  draft?: boolean;
  author?: string;
  readingTime?: number;
}

/** 文章列表页 / 卡片所需字段 */
export interface PostMeta extends PostFrontmatter {
  slug: string;
  url: string;
  year: string;
  readingMinutes: number;
  /** 归属板块（已兜底） */
  sectionId: PostSectionId;
  /** 正文纯文本字数，用于判断长短文（白日梦板块混排用） */
  wordCount: number;
}

/** 文章详情页：列表字段 + 渲染后的正文 HTML */
export interface Post extends PostMeta {
  html: string;
  toc: TocItem[];
}

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

/** 项目状态 */
export type ProjectStatus = "进行中" | "已完成" | "搁置";

/** 一个好玩的项目（content/projects.json） */
export interface Project {
  /** 同时作为 URL 的 slug，只能用小写字母/数字/连字符 */
  id: string;
  name: string;
  /** 一句话简介，卡片正面显示 */
  tagline: string;
  status: ProjectStatus;
  /** 年份或时间段，如 2026 / 2025-2026 */
  year: string;
  tags: string[];
  /** 用到的技术 / 工具，详情页展示 */
  stack?: string[];
  links?: { label: string; href: string }[];
  cover?: string;
  coverAlt?: string;
  /** 详情正文，Markdown 字符串（JSON 里用 \n 换行） */
  body?: string;
  featured?: boolean;
}

/** 搜索命中结果 */
export interface SearchDoc {
  type: "post" | "photo" | "project";
  title: string;
  url: string;
  excerpt: string;
  date: string;
  tags: string[];
  cover?: string;
  haystack: string;
}
