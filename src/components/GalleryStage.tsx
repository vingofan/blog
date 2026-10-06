"use client";

/**
 * 摄影作品集 · 半屏画廊版
 * ------------------------------------------------------------------
 * 桌面（≥1024px）：
 *   - 左：一面墙。当前这张挂在墙上（带卡纸的画框 + 投影），等比缩放不裁切；
 *        下方是标签牌——编号 / 分类 / 巡览状态、标题、拍摄信息、一句说明、进度与 ‹ ›
 *     画框宽度跟着图片比例走：竖图收窄把空间还给右列，横图放宽
 *   - 右：瀑布流图卡，列数由容器实际宽度决定
 *   - 静止时每 6 秒巡览一张，点右侧任意一张即上墙并停下
 * 移动（<1024px）：墙隐藏，单列排布，点图直接看原图
 *
 * 墙上挂的是「已解码的那张」：新图先 decode，解好才换，旧片在此期间一直挂着；
 * 画框尺寸由 photos.json 的 width/height 直接算出，不依赖位图，所以任何时刻
 * 都不会塌成一圈空卡纸。相邻两张另用隐藏 img 预热，避免 24 张大图同时驻留内存。
 */

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LazyImage from "./LazyImage";
import type { PhotoWithMeta } from "@/lib/types";
import { cx } from "@/lib/utils";

interface GalleryStageProps {
  photos: PhotoWithMeta[];
  categories: { id: string; label: string; description: string }[];
  counts: Record<string, number>;
  initialCategory?: string;
  /** 渲染到右侧列顶部（页头 / 说明等） */
  header?: ReactNode;
}

/** 无人操作时的巡览间隔 */
const STAGE_INTERVAL = 6000;

/** 左侧墙面占视口的宽度。改这里要同步改下面 className 里的 lg:w-[60vw]，
    Tailwind 的类名必须是字面量，没法用变量拼 */
const PANEL_W = "60vw";

/**
 * 网格卡的实际宽度。右列固定占视口 44%，列数由 column-width 决定：
 * 1024 下一列约 38vw，宽屏两列约 20vw —— 按 38vw 出图正好够 2× DPR。
 */
const GRID_SIZES = "(min-width: 1024px) 38vw, (min-width: 640px) 50vw, 100vw";

export default function GalleryStage({
  photos,
  categories,
  counts,
  initialCategory = "all",
  header,
}: GalleryStageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeIndex, setActiveIndex] = useState(0);
  /** 用户手动选过之后就不再自动巡览，免得舞台和用户抢焦点 */
  const [auto, setAuto] = useState(true);

  const visible = useMemo(
    () =>
      activeCategory === "all"
        ? photos
        : photos.filter((p) => p.category === activeCategory),
    [photos, activeCategory]
  );

  // 换分类后索引要归零，并重新交给自动巡览
  useEffect(() => {
    setActiveIndex(0);
    setAuto(true);
  }, [activeCategory]);

  useEffect(() => {
    if (!auto || visible.length <= 1) return undefined;
    const timer = window.setInterval(
      () => setActiveIndex((i) => (i + 1) % visible.length),
      STAGE_INTERVAL
    );
    return () => window.clearInterval(timer);
  }, [auto, visible.length]);

  const current = visible[activeIndex];

  /**
   * 墙上真正挂着的那幅。
   * 不能直接跟着 current 走：<figure> 带 key，换片时 img 是新建的元素，
   * 新图没解码完之前 naturalWidth 是 0，画框会先塌成一圈卡纸、题字溢出到墙上，
   * 再"啪"地弹回正确尺寸（实测本地 2 帧，冷缓存是一整个下载耗时）。
   * 所以先解码，解好才上墙——旧片在此期间一直挂着。
   */
  const [shown, setShown] = useState<PhotoWithMeta | undefined>(undefined);

  useEffect(() => {
    setShown(undefined);
  }, [activeCategory]);

  useEffect(() => {
    if (!current || shown?.id === current.id) return undefined;
    let live = true;
    const probe = new Image();
    probe.src = current.src;
    const commit = () => {
      // 连点时旧的解码不能反过来把新的一张挤下墙
      if (live) setShown(current);
    };
    probe.decode().then(commit).catch(commit);
    return () => {
      live = false;
    };
  }, [current, shown]);

  /** 尚未解码完成时，旧的那幅继续挂在墙上 */
  const stage = shown ?? current;
  const stageIdx = stage ? Math.max(0, visible.indexOf(stage)) : 0;

  /** 点图卡：桌面设上舞台并停下巡览；移动端没有舞台，直接开原图 */
  const selectPhoto = useCallback((index: number, src: string) => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.open(src, "_blank", "noreferrer");
      return;
    }
    setActiveIndex(index);
    setAuto(false);
  }, []);

  const step = useCallback(
    (delta: number) => {
      setAuto(false);
      setActiveIndex((i) => (i + delta + visible.length) % visible.length);
    },
    [visible.length]
  );

  const selectCategory = useCallback(
    (id: string) => {
      setActiveCategory(id);
      router.replace(id === "all" ? "/gallery" : `/gallery?category=${id}`, {
        scroll: false,
      });
    },
    [router]
  );

  const tabs = [
    { id: "all", label: "全部", description: "" },
    ...categories.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description,
    })),
  ];
  const activeDesc = tabs.find((t) => t.id === activeCategory)?.description;

  /** 舞台只渲染 active ±1，避免 24 张大图同时驻留内存 */
  const stageIndices = useMemo(() => {
    const set = new Set<number>();
    for (let i = activeIndex - 1; i <= activeIndex + 1; i++) {
      if (i >= 0 && i < visible.length) set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [activeIndex, visible]);

  const isEmpty = visible.length === 0;

  return (
    <div className="lg:flex lg:items-start lg:gap-0">
      {/* ============ 左侧：整面墙（移动端隐藏） ============ */}
      {/* top 偏移让开 sticky 页头（h-16 / sm:h-20），高度补足差值，保持视觉整高 */}
      {/* 宽度固定，比右列宽一档；竖图就在墙上留白居中，不再牵动右列重排 */}
      <div className="sticky top-16 hidden shrink-0 sm:top-20 lg:block lg:h-[calc(100svh-5rem)] lg:w-[60vw]">
        <div className="relative flex h-full w-full flex-col overflow-hidden bg-linear-to-b from-(--color-base) via-(--color-base) to-(--color-base-soft) px-8 pt-8 pb-6">
          {isEmpty && (
            <div className="flex flex-1 items-center justify-center px-8 text-center">
              <p className="text-sm leading-relaxed text-(--color-fg-subtle)">
                这个分类下还没有作品。
                <br />
                换一类看看。
              </p>
            </div>
          )}
          {!isEmpty && stage && (
            <>
              {/* 挂在墙上的一幅画：等比缩放，绝不裁切 */}
              <div className="flex min-h-0 flex-1 items-center justify-center">
                {/* key 让换片时重放一次入场动画，替掉原来两幅叠化的错位 */}
                <figure key={stage.id} className="stage-frame-in frame-wood max-w-full">
                  <div className="frame-mat max-w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stage.src}
                      alt={stage.alt}
                      width={stage.width}
                      height={stage.height}
                      decoding="async"
                      draggable={false}
                      style={{
                        // 画框尺寸只由数据决定，不看位图解码状态：
                        // 高 = min(可用高, 可用宽 ÷ 宽高比)，宽再由 aspect-ratio 反推。
                        // 原来写 max-height + w-auto，img 一旦没解码完就塌成 0×0。
                        // 预留量 = 页头 80 + 墙面上内边距 32 + 标签牌上间距 24
                        //          + 标签牌定高 136 + 木框 36 + 卡纸上下 40+68 = 436px
                        // 下内边距 24 由 overflow-hidden 兜住，宁可留白也不许压到标签牌
                        height: `min(calc(100svh - 28rem), calc((${PANEL_W} - 180px) / ${stage.width / stage.height}))`,
                        width: "auto",
                        aspectRatio: `${stage.width} / ${stage.height}`,
                      }}
                      className="frame-rebate block object-contain"
                    />
                    {/* 题字印在衬板下缘：作品名 + 拍摄参数 */}
                    <div className="frame-inscription">
                      <span
                        className={cx(
                          "whitespace-nowrap leading-snug",
                          stage.curated
                            ? "text-[0.68rem] font-medium tracking-tight"
                            : "font-mono text-[0.6rem] tracking-wider"
                        )}
                      >
                        {stage.title}
                      </span>
                      <span className="font-mono text-[0.57rem] leading-snug tracking-wider text-[#8d847a]">
                        {stage.settings
                          ? `${stage.camera} · ${stage.settings}`
                          : stage.camera || stage.date}
                      </span>
                    </div>
                  </div>
                </figure>
              </div>

              {/* 相邻两张只负责预热，不参与绘制，切换时不用空等下载 */}
              {stageIndices
                .filter((i) => i !== activeIndex)
                .map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={visible[i].id} src={visible[i].src} alt="" aria-hidden className="hidden" />
                ))}

              {/* 标签牌：定高，好让照片的可用高度是个能算准的确定值 */}
              {/* 牌子写的是"墙上这幅"的信息，所以跟着 stage 而不是 activeIndex */}
              <div className="mt-6 h-[8.5rem] shrink-0">
                <div className="flex items-center gap-3 font-mono text-[0.62rem] tracking-wider text-(--color-fg-subtle)">
                  <span className="tracking-[0.18em]">
                    {String(stageIdx + 1).padStart(2, "0")} /{" "}
                    {String(visible.length).padStart(2, "0")}
                  </span>
                  <span>{stage.categoryLabel}</span>
                  <span className="text-(--color-accent-dim)" aria-hidden>
                    {auto ? "巡览中" : "已停"}
                  </span>
                </div>

                <p className="mt-2 font-mono text-[0.65rem] tracking-wider text-(--color-fg-subtle)">
                  {stage.location ? `${stage.location} · ${stage.date}` : stage.date}
                </p>

                {stage.caption ? (
                  <p className="mt-2.5 line-clamp-2 max-w-[54ch] text-[0.85rem] leading-relaxed text-(--color-fg-muted)">
                    {stage.caption}
                  </p>
                ) : null}

                <div className="mt-4 flex items-end justify-between gap-6">
                  <div className="h-px w-40 max-w-full bg-(--color-line)">
                    <div
                      className="h-px bg-(--color-fg) transition-[width] duration-500 ease-out"
                      style={{
                        width: `${((stageIdx + 1) / visible.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="上一张"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-(--color-line) text-(--color-fg-muted) transition-colors hover:border-(--color-fg-subtle) hover:text-(--color-fg)"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path
                          d="M9 2L4.5 7L9 12"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="下一张"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-(--color-line) text-(--color-fg-muted) transition-colors hover:border-(--color-fg-subtle) hover:text-(--color-fg)"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path
                          d="M5 2L9.5 7L5 12"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============ 右侧：页头 + 双列瀑布流 ============ */}
      <div className="min-w-0 flex-1 px-5 sm:px-8 lg:py-4">
        {header}

        {/* 筛选：从舞台移到这里，桌面和移动共用一份 */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const selected = tab.id === activeCategory;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectCategory(tab.id)}
                className={cx(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.78rem] tracking-wide transition-colors",
                  selected
                    ? "border-(--color-fg) bg-(--color-fg) text-(--color-base)"
                    : "border-(--color-line) text-(--color-fg-muted) hover:border-(--color-fg-subtle) hover:text-(--color-fg)"
                )}
              >
                {tab.label}
                <span className="ml-1.5 font-mono text-[0.62rem] opacity-60">
                  {counts[tab.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
        <p
          className={cx(
            "text-[0.78rem] leading-relaxed text-(--color-fg-subtle)",
            activeDesc ? "mb-8 mt-3" : "mb-8 mt-0"
          )}
        >
          {activeDesc}
        </p>

        {isEmpty ? (
          <p className="rounded-2xl border border-(--color-line-soft) bg-(--color-base-soft) px-6 py-20 text-center text-sm text-(--color-fg-subtle)">
            这个分类下还没有作品，换一类看看。
          </p>
        ) : (
          <ul className="stage-masonry">
            {visible.map((photo, i) => {
              const onStage = i === activeIndex;
              return (
                <li key={photo.id}>
                  <button
                    type="button"
                    onClick={() => selectPhoto(i, photo.src)}
                    aria-current={onStage}
                    aria-label={`放到左侧舞台：${photo.title}`}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div
                      className={cx(
                        "relative overflow-hidden rounded-2xl ring-inset transition-all duration-300",
                        onStage
                          ? "ring-2 ring-(--color-fg)"
                          : "ring-1 ring-(--color-line-soft) group-hover:ring-(--color-fg-subtle)"
                      )}
                    >
                      <LazyImage
                        optimized
                        src={photo.src}
                        alt={onStage ? photo.alt : ""}
                        width={photo.width}
                        height={photo.height}
                        priority={i < 2}
                        sizes={GRID_SIZES}
                        imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                      />
                      {/* 年份角标：贴在图内，不做反向缺口 —— 缺口会被卡片圆角切出自带的破角 */}
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[0.6rem] tracking-wider text-white/75">
                        {photo.year}
                      </span>
                    </div>

                    {/* 已命名的走作品条目，未命名的走档案条目，不假装有人名 */}
                    <div className="mt-3 flex items-baseline justify-between gap-3">
                      <span
                        className={cx(
                          "min-w-0 truncate",
                          photo.curated
                            ? "text-[0.95rem] font-medium text-(--color-fg)"
                            : "font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle)"
                        )}
                      >
                        {photo.title}
                      </span>
                      <span className="shrink-0 font-mono text-[0.62rem] tracking-wider text-(--color-fg-subtle)">
                        {photo.location || photo.camera || photo.date}
                      </span>
                    </div>
                    {photo.curated && photo.caption ? (
                      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-(--color-fg-muted)">
                        {photo.caption}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
