"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cx } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 首屏大图传 true，关闭懒加载并提升优先级 */
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  /** 走 next/image 按需出图。大图网格必须开，否则 380px 的卡也在下原图 */
  optimized?: boolean;
}

/**
 * 懒加载图片
 * - 使用原生 loading="lazy"（第二张起）+ decoding="async"
 * - 外层按比例占位，避免图片加载造成布局抖动（CLS）
 * - 加载完成后渐显，未加载时显示骨架微光
 */
export default function LazyImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  imgClassName,
  sizes,
  optimized = false,
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 命中浏览器缓存时 onLoad 可能不触发，这里补一次判断
  useEffect(() => {
    const el = imgRef.current;
    if (el?.complete && el.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const frameClass = cx("img-frame", loaded && "is-loaded", className);
  const imgClass = cx("lazy-img", loaded && "is-loaded", imgClassName);
  const markLoaded = () => setLoaded(true);

  if (optimized) {
    return (
      <div className={frameClass} style={{ aspectRatio: `${width} / ${height}` }}>
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          onLoad={markLoaded}
          draggable={false}
          className={imgClass}
        />
      </div>
    );
  }

  return (
    <div
      className={cx("img-frame", loaded && "is-loaded", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={cx("lazy-img", loaded && "is-loaded", imgClassName)}
      />
    </div>
  );
}
