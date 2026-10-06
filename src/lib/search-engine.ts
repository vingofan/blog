/**
 * 纯客户端搜索（不含任何 Node/fs 依赖，可被 "use client" 组件安全引用）
 * ------------------------------------------------------------------
 * 匹配规则：
 *  - 空格分词，全部关键词都要命中（AND）
 *  - 标题命中权重最高，其次标签、摘要、正文
 */
import type { SearchDoc } from "./types";

export interface SearchResult {
  doc: SearchDoc;
  score: number;
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,，]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** 把长文本截断成摘要，并保留关键词上下文 */
function makeSnippet(text: string, tokens: string[], max = 90): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const lower = clean.toLowerCase();
  const hitAt = tokens
    .map((t) => lower.indexOf(t))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];

  if (hitAt === undefined || hitAt < 40) {
    return clean.length > max ? `${clean.slice(0, max)}…` : clean;
  }
  const start = Math.max(0, hitAt - 30);
  const slice = clean.slice(start, start + max);
  return `${start > 0 ? "…" : ""}${slice}${start + max < clean.length ? "…" : ""}`;
}

export function searchDocs(docs: SearchDoc[], query: string): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const doc of docs) {
    const title = doc.title.toLowerCase();
    const excerpt = doc.excerpt.toLowerCase();
    const tagStr = doc.tags.join(" ").toLowerCase();
    const haystack = doc.haystack.toLowerCase();

    let score = 0;
    let matchedAll = true;

    for (const token of tokens) {
      let hit = 0;
      if (title.includes(token)) hit += 10;
      if (tagStr.includes(token)) hit += 6;
      if (excerpt.includes(token)) hit += 4;
      if (haystack.includes(token)) hit += 2;
      if (hit === 0) {
        matchedAll = false;
        break;
      }
      score += hit;
    }

    if (!matchedAll) continue;
    results.push({ doc, score });
  }

  return results
    .sort((a, b) => b.score - a.score || (a.doc.date < b.doc.date ? 1 : -1))
    .slice(0, 30);
}

export { makeSnippet };
