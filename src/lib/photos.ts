/**
 * 摄影作品数据源
 * ------------------------------------------------------------------
 * 唯一数据源：content/photos.json + content/categories.json
 * 新增作品 = 往 photos.json 里加一条 + 把图片放进 public/images/photos/
 */
import photosJson from "../../content/photos.json";
import categoriesJson from "../../content/categories.json";

import type { Category, Photo, PhotoWithMeta } from "./types";

export const categories = categoriesJson as Category[];

const categoryMap = new Map(categories.map((c) => [c.id, c]));

/** 导入脚手架留下的占位标题形如 `2026-01-17 · P1021669`，人工命名后不再是这个形状 */
const PLACEHOLDER_TITLE = /^\d{4}-\d{2}-\d{2}\s*·/;

/** 全部作品，按拍摄日期倒序 */
export const photos: PhotoWithMeta[] = (photosJson as Photo[])
  .map((photo) => ({
    ...photo,
    slug: photo.id,
    categoryId: photo.category,
    categoryLabel: categoryMap.get(photo.category)?.label ?? photo.category,
    year: photo.date.slice(0, 4),
    curated: !PLACEHOLDER_TITLE.test(photo.title),
  }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getCategory(id: string): Category | undefined {
  return categoryMap.get(id);
}

export function getCategoryLabel(id: string): string {
  return categoryMap.get(id)?.label ?? id;
}

/** 首页精选大图 */
export function getFeaturedPhotos(limit = 6): PhotoWithMeta[] {
  return photos.filter((p) => p.featured).slice(0, limit);
}

/** 按分类筛选；category 为 "all" 或空值时返回全部 */
export function filterPhotos(category?: string): PhotoWithMeta[] {
  if (!category || category === "all") return photos;
  return photos.filter((p) => p.category === category);
}

/** 每个分类下的作品数量（含全部） */
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = { all: photos.length };
  for (const c of categories) {
    counts[c.id] = photos.filter((p) => p.category === c.id).length;
  }
  return counts;
}

export function getPhoto(id: string): PhotoWithMeta | undefined {
  return photos.find((p) => p.id === id);
}

/** 作品用到的全部标签（去重） */
export function getAllPhotoTags(): string[] {
  return Array.from(new Set(photos.flatMap((p) => p.tags)));
}
