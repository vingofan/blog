"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LazyImage from "./LazyImage";
import Lightbox, { type LightboxItem } from "./Lightbox";
import type { PhotoWithMeta } from "@/lib/types";
import { cx } from "@/lib/utils";

interface GalleryGridProps {
  photos: PhotoWithMeta[];
  categories: { id: string; label: string; description: string }[];
  counts: Record<string, number>;
  initialCategory?: string;
  /** 首页等非作品集页可关掉分类筛选条 */
  showFilters?: boolean;
}

/**
 * 作品集网格
 * - CSS columns 瀑布流（1/2/3/4 列自适应）
 * - 顶部按分类筛选，选中态同步到 URL (?category=xxx)，便于分享与收藏
 * - 点击任意图片打开灯箱，支持键盘左右切换
 */
export default function GalleryGrid({
  photos,
  categories,
  counts,
  initialCategory = "all",
  showFilters = true,
}: GalleryGridProps) {
  const router = useRouter();
  const [active, setActive] = useState(initialCategory);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (active === "all" ? photos : photos.filter((p) => p.category === active)),
    [photos, active]
  );

  const lightboxItems: LightboxItem[] = useMemo(
    () =>
      visible.map((p) => ({
        src: p.src,
        alt: p.alt,
        width: p.width,
        height: p.height,
        title: p.title,
        caption: p.caption,
        date: p.date,
        meta: [
          ...(p.location ? [{ label: "地点", value: p.location }] : []),
          ...(p.camera ? [{ label: "机身", value: p.camera }] : []),
          ...(p.lens ? [{ label: "镜头", value: p.lens }] : []),
          ...(p.settings ? [{ label: "参数", value: p.settings }] : []),
          ...(p.date ? [{ label: "拍摄", value: p.date }] : []),
        ],
      })),
    [visible]
  );

  const selectCategory = useCallback(
    (id: string) => {
      setActive(id);
      setLightboxIndex(null);
      router.replace(id === "all" ? "/gallery" : `/gallery?category=${id}`, {
        scroll: false,
      });
    },
    [router]
  );

  const tabs = [
    { id: "all", label: "全部", description: "" },
    ...categories.map((c) => ({ id: c.id, label: c.label, description: c.description })),
  ];

  const activeDesc = tabs.find((t) => t.id === active)?.description;

  return (
    <div>
      {/* 分类筛选 */}
      {showFilters && (
        <div className="mb-10 flex flex-col gap-4">
          <div
          role="tablist"
          aria-label="作品分类筛选"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {tabs.map((tab) => {
            const selected = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectCategory(tab.id)}
                className={cx(
                  "shrink-0 rounded-full border px-4 py-1.5 text-[0.8rem] tracking-wide transition-colors",
                  selected
                    ? "border-(--color-accent) bg-(--color-accent) text-[#141414]"
                    : "border-(--color-line) text-(--color-fg-muted) hover:border-(--color-fg-subtle) hover:text-(--color-fg)"
                )}
              >
                {tab.label}
                <span className="ml-1.5 font-mono text-[0.65rem] opacity-60">
                  {counts[tab.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        {activeDesc && (
          <p className="text-sm leading-relaxed text-(--color-fg-subtle)">
            {activeDesc}
          </p>
        )}
      </div>
      )}

      {/* 瀑布流 */}
      {visible.length === 0 ? (
        <p className="py-20 text-center text-sm text-(--color-fg-subtle)">
          这个分类下还没有作品。
        </p>
      ) : (
        <div className="masonry">
          {visible.map((photo, i) => (
            <figure key={photo.id} className="group">
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                aria-label={`放大查看：${photo.title}`}
                className="block w-full cursor-zoom-in text-left"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <LazyImage
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    priority={i < 4}
                    imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-sm font-medium text-white">{photo.title}</p>
                    <p className="mt-1 font-mono text-[0.65rem] tracking-wider text-white/60">
                      {photo.categoryLabel}
                      {photo.location ? ` · ${photo.location}` : ""}
                    </p>
                  </div>
                  <span className="pointer-events-none absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path
                        d="M1 5V1h4M13 9v4H9M9 1h4v4M5 13H1V9"
                        stroke="currentColor"
                        strokeWidth="1.3"
                      />
                    </svg>
                  </span>
                </div>
              </button>
              <figcaption className="mt-2.5 flex items-baseline justify-between gap-3 px-0.5">
                <span className="truncate text-[0.8rem] text-(--color-fg-muted)">
                  {photo.title}
                </span>
                <time
                  dateTime={photo.date}
                  className="shrink-0 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)"
                >
                  {photo.date}
                </time>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
