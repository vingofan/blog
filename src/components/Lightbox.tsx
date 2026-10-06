/**
 * 灯箱（图片放大预览）
 * ------------------------------------------------------------------
 * - Esc 关闭，← → 切换，"i" 切换信息面板，点击背景关闭
 * - 触屏左右滑动切换
 * - 信息面板展示标题 / 图注 / 拍摄参数 / 关联文章
 */

import { useCallback, useEffect, useState } from "react";

export interface LightboxItem {
  src: string;
  alt: string;
  width: number;
  height: number;
  title?: string;
  caption?: string;
  /** 拍摄参数等元信息 */
  meta?: { label: string; value: string }[];
  date?: string;
  href?: string;
  hrefLabel?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export default function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: LightboxProps) {
  const total = items.length;
  const item = items[index];
  const [showInfo, setShowInfo] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, total, onIndexChange]
  );

  // 键盘操作 + 背景滚动锁定
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowRight":
          e.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          go(-1);
          break;
        case "i":
        case "I":
          setShowInfo((v) => !v);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", onKey);
    document.body.classList.add("lightbox-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("lightbox-open");
    };
  }, [go, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title || item.alt || "图片预览"}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-[fadeIn_.25s_ease]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(diff) > 45) go(diff < 0 ? 1 : -1);
        setTouchStartX(null);
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* 计数 */}
      <div className="absolute top-5 left-5 z-10 font-mono text-xs tracking-widest text-white/50">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>

      {/* 关闭 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭预览"
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      {/* 上一张 / 下一张 */}
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={() => go(-1)}
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white sm:left-4"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 1L3 7l6 6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={() => go(1)}
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white sm:right-4"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M5 1l6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </>
      )}

      {/* 主图 + 信息 */}
      <figure
        key={item.src}
        className="flex w-full max-w-[92vw] animate-[fadeIn_.3s_ease] flex-col items-center gap-4 lg:max-w-5xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          width={item.width}
          height={item.height}
          className="max-h-[74vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />

        {showInfo && (
          <figcaption className="w-full max-w-3xl text-center">
            {item.title && (
              <h2 className="text-base font-medium text-white">{item.title}</h2>
            )}
            {item.caption && (
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                {item.caption}
              </p>
            )}
            {!!item.meta?.length && (
              <dl className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[0.7rem] tracking-wide text-white/40">
                {item.meta.map((m) => (
                  <div key={m.label} className="flex gap-1.5">
                    <dt className="uppercase">{m.label}</dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {item.href && (
              <a
                href={item.href}
                className="mt-3 inline-block text-xs text-(--color-accent) underline underline-offset-4"
              >
                {item.hrefLabel || "查看相关文章"}
              </a>
            )}
          </figcaption>
        )}
      </figure>

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 font-mono text-[0.65rem] tracking-widest text-white/25 sm:block">
        ← → 切换 · I 显示/隐藏信息 · ESC 关闭
      </div>
    </div>
  );
}
