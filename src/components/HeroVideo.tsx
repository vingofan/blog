"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 首页 Hero 的背景视频：先演一遍「从暗处显形 → 走来 → 趴下」，
 * 演完后接到一段循环的待机画面（趴着，摆尾、眨眼）。
 *
 * 用两个 <video> 叠放而不是在一个文件里来回 seek：seek 会卡一下，循环处能看出顿挫。
 * 两个文件在拼装时对齐过：开场的最后一帧就是循环的第一帧，循环本身是正放再倒放，首尾也是同一帧。
 */
export default function HeroVideo() {
  const idleRef = useRef<HTMLVideoElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [idleReady, setIdleReady] = useState(false);

  // 开场播完才启动待机循环；在此之前它停在第一帧待命
  useEffect(() => {
    if (!introDone) return;
    idleRef.current?.play().catch(() => {
      // 浏览器拒绝自动播放时 idleReady 不会变成 true，开场的末帧继续显示，画面不会空
    });
  }, [introDone]);

  return (
    <>
      <video
        className="hero-video"
        src="/images/hero/leopard-emerge.mp4"
        autoPlay
        muted
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        // 循环片段接管后把开场藏起来：两段都用 lighten 混合（见 globals.css），
        // 开场停住的那一帧如果还留在下面，会和上面正在动的画面取亮叠在一起，尾巴就成了两条
        style={{ opacity: introDone && idleReady ? 0 : 1 }}
        onEnded={() => setIntroDone(true)}
      />
      <video
        ref={idleRef}
        className="hero-video"
        // 直接切换、不做淡入：开场文件的最后一帧和这段循环的第一帧是同一帧（见 assemble_hero.py），
        // 任何叠化都会让已经开始动的尾巴和下面静止的画面叠成残影
        style={{ opacity: introDone && idleReady ? 1 : 0 }}
        src="/images/hero/leopard-idle.mp4"
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
        onPlaying={() => setIdleReady(true)}
      />
    </>
  );
}
