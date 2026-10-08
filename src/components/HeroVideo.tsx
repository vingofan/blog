"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 首页 Hero 的背景视频：先演一遍「站立 → 迎着镜头走来 → 咆哮 → 趴下」（12 秒），
 * 演完后接到一段循环的待机画面（趴着，尾尖和头有细微动作）。
 *
 * 用两个 <video> 叠放而不是在一个文件里来回 seek：seek 会卡一下，循环处能看出顿挫。
 * 两段出自同一次生成：循环是开场最后 4 秒先倒放再正放，所以它的第一帧就是开场的最后一帧，
 * 循环的首尾也是同一帧，切换和循环都不需要叠化。
 * 只取最后 4 秒而不是 5 秒：再往前一秒豹子还在趴下的余势里，在那儿折返等于把一个没做完的动作倒回去，很假；
 * 第 8 秒它已经基本静止，在静止的地方折返才看不出来。
 */
/** 豹子出场的时刻（毫秒，从页面加载起算）。要和 globals.css 里 --hero-reveal 保持一致。 */
const HERO_REVEAL_MS = 620;

/** 开场视频从第几秒开始播。素材前 1 秒豹子站着没动，量逐帧运动量是从 0.8–1 秒开始起步的；
    出场的闪光要 0.3 秒左右才亮透，所以从 1 秒处起播，看清它的时候它已经在走。 */
const INTRO_SKIP_S = 1;
/** 待机循环里中间那个折返点的时刻（秒）：前 4 秒是倒放，之后是正放。循环的首尾是另一个折返点。 */
const IDLE_TURN_S = 4;
/** 离折返点多少秒以内开始减速 */
const IDLE_EASE_S = 1.2;

export default function HeroVideo() {
  const introRef = useRef<HTMLVideoElement>(null);
  const idleRef = useRef<HTMLVideoElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const [idleReady, setIdleReady] = useState(false);

  // 等闪电劈完再开演：视频在这之前是透明的（globals.css 里 .hero-video 的出场动画也是从这个时刻开始），
  // 所以不用 autoPlay，否则豹子亮出来的时候已经走出去一截了。
  // 时刻按页面加载起算而不是按组件挂载起算，和 CSS 动画的时间轴对齐；加载慢、已经过点了就立刻播。
  useEffect(() => {
    const video = introRef.current;
    if (!video) return;
    // 跳过开头站着不动的那一秒：先把画面停在它刚要迈步的地方等着，亮出来的同时就已经在走了
    const skip = () => {
      video.currentTime = INTRO_SKIP_S;
    };
    if (video.readyState >= 1) skip();
    else video.addEventListener("loadedmetadata", skip, { once: true });

    const wait = Math.max(0, HERO_REVEAL_MS - performance.now());
    const timer = window.setTimeout(() => {
      video.play().catch(() => {
        // 浏览器拒绝播放时停在起步的那一帧（豹子站着），画面不会空
      });
    }, wait);
    return () => {
      window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", skip);
    };
  }, []);

  // 开场播完才启动待机循环；在此之前它停在第一帧待命
  useEffect(() => {
    if (!introDone) return;
    idleRef.current?.play().catch(() => {
      // 浏览器拒绝自动播放时 idleReady 不会变成 true，开场的末帧继续显示，画面不会空
    });
  }, [introDone]);

  // 待机循环的变速。循环是「倒放 → 正放」来回走的，匀速播的话每到折返点动作会原样弹回去，
  // 一眼就能看出是在来回抽帧。两个办法一起用：
  //   1. 靠近折返点时放慢到 0.5 倍，离开后再加速回去，折返那一下就不突兀了；
  //   2. 每过一次折返点，随机换一个巡航速度（0.7–1 倍），每一趟的节奏都不一样。
  // 播放速率始终在 0.5–1 倍之间。
  useEffect(() => {
    if (!idleReady) return;
    const video = idleRef.current;
    if (!video) return;
    let cruise = 1;
    let lastTurn = -1;
    const timer = window.setInterval(() => {
      const t = video.currentTime;
      const turns = [0, IDLE_TURN_S, video.duration || IDLE_TURN_S * 2];
      const dists = turns.map((x) => Math.abs(t - x));
      const nearest = dists.indexOf(Math.min(...dists)) % 2; // 0 = 循环首尾那个折返点，1 = 中间那个
      if (nearest !== lastTurn) {
        lastTurn = nearest;
        cruise = 0.7 + Math.random() * 0.3;
      }
      const x = Math.min(1, Math.min(...dists) / IDLE_EASE_S);
      const ease = x * x * (3 - 2 * x);
      const target = 0.5 + (cruise - 0.5) * ease;
      // 朝目标速度缓缓靠过去，而不是直接跳：巡航速度是在两个折返点的中途换的，直接跳会看出一下顿挫
      const rate = video.playbackRate + (target - video.playbackRate) * 0.2;
      if (Math.abs(video.playbackRate - rate) > 0.005) video.playbackRate = Math.min(1, Math.max(0.5, rate));
    }, 80);
    return () => window.clearInterval(timer);
  }, [idleReady]);

  return (
    <>
      <video
        ref={introRef}
        className="hero-video hero-video-intro"
        src="/images/hero/leopard-emerge.mp4"
        muted
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
        // 循环片段接管后把开场藏起来：两段都是不透明的，上面那层本来就会盖住下面，
        // 藏起来只是不让一个已经播完的视频继续占着合成层
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
