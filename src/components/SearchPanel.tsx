"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { makeSnippet, searchDocs } from "@/lib/search-engine";
import type { SearchDoc } from "@/lib/types";

interface SearchPanelProps {
  docs: SearchDoc[];
  initialQuery?: string;
  /** 常见关键词，空查询时作为快捷入口 */
  suggestions?: string[];
  autoFocus?: boolean;
}

/**
 * 关键词搜索：纯客户端即时匹配
 * 查询结果同步到 URL（?q=），方便分享搜索结果链接
 */
export default function SearchPanel({
  docs,
  initialQuery = "",
  suggestions = [],
  autoFocus = true,
}: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // 输入停顿 400ms 后同步到地址栏
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search";
      router.replace(url, { scroll: false });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query, router]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchDocs(docs, query);
  }, [docs, query]);

  const tokens = query.toLowerCase().split(/[\s,，]+/).filter(Boolean);

  return (
    <div>
      {/* 搜索框 */}
      <div className="relative">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="absolute top-1/2 left-4 -translate-y-1/2 text-(--color-fg-subtle)"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        <label htmlFor="site-search" className="sr-only">
          搜索文章与作品
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标题、标签、正文关键词…"
          autoComplete="off"
          className="h-14 w-full rounded-xl border border-(--color-line) bg-(--color-surface) pr-12 pl-11 text-sm text-(--color-fg) placeholder:text-(--color-fg-subtle) focus:border-(--color-accent-dim) focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="清空搜索"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-(--color-fg-subtle) transition-colors hover:text-(--color-fg)"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        )}
      </div>

      {/* 快捷关键词 */}
      {!query.trim() && suggestions.length > 0 && (
        <div className="mt-6">
          <p className="eyebrow">试试这些</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-(--color-line) px-3.5 py-1.5 text-[0.8rem] text-(--color-fg-muted) transition-colors hover:border-(--color-accent-dim) hover:text-(--color-fg)"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 结果 */}
      {query.trim() && (
        <div className="mt-8">
          <p className="font-mono text-[0.7rem] tracking-widest text-(--color-fg-subtle)">
            {results.length > 0
              ? `找到 ${results.length} 条结果`
              : "没有匹配的内容"}
          </p>

          {results.length === 0 ? (
            <p className="mt-6 text-sm leading-relaxed text-(--color-fg-muted)">
              换个说法试试，或者
              <Link href="/blog" className="ml-1 text-(--color-accent) underline underline-offset-4">
                看看全部文章
              </Link>
              。
            </p>
          ) : (
            <ul className="mt-5 flex flex-col">
              {results.map(({ doc }) => {
                const snippet = makeSnippet(doc.excerpt || "", tokens);
                return (
                  <li key={doc.url + doc.title}>
                    <Link
                      href={doc.url}
                      className="group flex flex-col gap-2 border-b border-(--color-line-soft) py-5 first:pt-0 last:border-0 sm:flex-row sm:items-start sm:gap-6"
                    >
                      <span className="shrink-0 rounded border border-(--color-line) px-2 py-0.5 font-mono text-[0.6rem] tracking-widest text-(--color-fg-subtle) sm:mt-1">
                        {doc.type === "post"
                          ? "文章"
                          : doc.type === "project"
                            ? "项目"
                            : "作品"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[1rem] font-medium text-(--color-fg) transition-colors group-hover:text-(--color-accent)">
                          {doc.title}
                        </span>
                        {snippet && (
                          <span className="mt-1.5 block line-clamp-2 text-sm leading-relaxed text-(--color-fg-muted)">
                            {snippet}
                          </span>
                        )}
                        <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                          <span>{doc.date}</span>
                          {doc.tags.slice(0, 4).map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
