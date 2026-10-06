"use client";

import { useEffect, useState } from "react";
import Lightbox, { type LightboxItem } from "./Lightbox";
import type { PhotoWithMeta } from "@/lib/types";
import { cx } from "@/lib/utils";

/**
 * 首页精选大图：自动轮播 + 点击进灯箱
 * 图片铺满视口上方区域，文字压在底部，保持"大图优先"
 */
export default function HeroGallery({
  photos,
  siteName,
  tagline,
}: {
  photos: PhotoWithMeta[];
  siteName: string;
  tagline: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  // 自动轮播
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = window.setInterval(
      () => setActive((i) => (i + 1) % photos.length),
      6000
    );
    return () => window.clearInterval(timer);
  }, [photos.length]);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (photos.length === 0) return null;

  const current = photos[active];

  const items: LightboxItem[] = photos.map((p) => ({
    src: p.src,
    alt: p.alt,
    width: p.width,
    height: p.height,
    title: p.title,
    caption: p.caption,
    meta: [
      ...(p.location ? [{ label: "地点", value: p.location }] : []),
      ...(p.camera ? [{ label: "机身", value: p.camera }] : []),
      ...(p.settings ? [{ label: "参数", value: p.settings }] : []),
    ],
  }));

  return (
    <>
      <section className="relative">
        <div className="relative h-[68vh] min-h-[440px] w-full overflow-hidden sm:h-[78vh]">
          {/* 叠放的轮播图：只有当前这张 opacity=1 */}
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              aria-hidden={i !== active}
              className={cx(
                "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
                i === active ? "opacity-100" : "opacity-0"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={i === 0 ? "high" : "auto"}
                className="h-full w-full object-cover"
              />
            </div>
          ))}

          {/* 压暗 + 渐隐过渡，保证文字可读 */}
          <div className="absolute inset-0 bg-gradient-to-t from-(--color-base) via-(--color-base)/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-base)/70 via-transparent to-transparent" />

          {/* 文字 */}
          <div className="container-page absolute inset-x-0 bottom-0 pb-12 sm:pb-16">
            <p className="eyebrow mb-4">精选作品</p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {siteName}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-[1rem]">
              {tagline}
            </p>

            <button
              type="button"
              onClick={() => setZoom(active)}
              className="group mt-8 inline-flex items-center gap-2.5 border border-white/25 px-5 py-2.5 text-[0.8rem] tracking-wide text-white/85 transition-colors hover:border-white/60 hover:text-white"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M1 5V1h4M13 9v4H9M9 1h4v4M5 13H1V9"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              放大当前这张
            </button>
          </div>

          {/* 缩略指示条 */}
          <div className="absolute right-5 bottom-12 hidden flex-col gap-2.5 sm:flex">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`切换到：${photo.title}`}
                aria-current={i === active}
                className={cx(
                  "h-8 w-[2px] transition-all duration-300",
                  i === active ? "bg-(--color-accent) opacity-100" : "bg-white/35 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>

        {/* 当前这张的信息条 */}
        <div className="container-page flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-5 font-mono text-[0.7rem] tracking-wider text-(--color-fg-subtle)">
          <span className="text-(--color-fg-muted)">{current.title}</span>
          {current.location && <span>{current.location}</span>}
          {current.settings && <span>{current.settings}</span>}
        </div>
      </section>

      {zoom !== null && (
        <Lightbox
          items={items}
          index={zoom}
          onClose={() => setZoom(null)}
          onIndexChange={setZoom}
        />
      )}
    </>
  );
}
