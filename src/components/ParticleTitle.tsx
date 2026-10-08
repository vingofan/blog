"use client";

import { useEffect, useRef } from "react";

const SCATTER_S = 0.55;
const GATHER_S = 1.15;
const PAD = 230; // 画布比文字四周各大出这么多，给散开的粒子留地方
/** 闪电动画播到多少（0–1）时粒子出发。0.42 之前闪电全亮，1 是完全熄灭 */
const BOLT_AT = 0.64;
/** 主闪的折线（LightningTitle 里那道闪电的路径，按 100×300 的框归一化），粒子沿着它出生 */
const BOLT: [number, number][] = [[0.58, 0], [0.4, 0.207], [0.63, 0.32], [0.36, 0.52], [0.6, 0.633], [0.44, 0.8], [0.54, 1]];

type P = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; delay: number; seed: number };

interface Props {
  /** 开始聚拢的时刻（毫秒，从页面加载起算）。给了 from 时它只是兜底，实际以闪电熄灭为准 */
  startMs?: number;
  /** 给了 from 时：闪电熄灭之后再等多少毫秒开始（用来让几行字先后错开） */
  delayMs?: number;
  /** 聚好之后停多久再散开重聚（秒）。不给就只在出场时聚拢一次，之后不再动 */
  holdS?: number;
  /**
   * 小字用：聚拢完成后换回真正的文字显示，只在散开、聚拢的过程中用粒子。
   * 十几像素的字拆成圆点是认不出来的，停住的时候必须是清晰的字。
   * 不开（大标题）：全程由圆点拼成，停住时还有一道金色的斜光扫过。
   */
  crisp?: boolean;
  /**
   * 第一次出场时粒子从哪里来：一个元素的选择器（这里是那道主闪）。
   * 给了就沿着它的折线出生、带着向两侧迸开的初速度，再聚成字；不给就是从一团散开的云里聚拢。
   * 开始的时刻也跟着它走：这个元素的闪电动画（lt-bolt）亮过之后、暗到一半多的时候出发（BOLT_AT），
   * 不靠写死的毫秒数——页面加载快慢不同，写死的数对不上。
   */
  from?: string;
}

/**
 * 文字的粒子动效：字由小圆点组成，从散开的粒子聚拢成字。默认只在出场时聚拢一次；
 * 给了 holdS 才会每隔那么久散开、再聚回来。
 *
 * 用法：放进任何一个带 `pt-host` 类的文字元素里当子节点。它会量出宿主里每个字在页面上的真实位置，
 * 所以横排、竖排、各种字号和窗口大小都自动跟着走。粒子显示期间宿主的文字变透明（.pt-hide），只占位。
 * 系统开了「减少动态效果」时不启用，保留原来静态的字。
 */
export default function ParticleTitle({ startMs = 1700, delayMs = 0, holdS, crisp = false, from }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let alive = true;
    let visible = true;
    let parts: P[] = [];
    let dot = 1.5;
    let box = { w: 0, h: 0, cx: 0, cy: 0, diag: 0 };
    let phase: "wait" | "gather" | "hold" | "scatter" = "wait";
    let t0 = 0; // 当前阶段开始的时刻（秒）
    let last = 0;
    let readyAt = from ? Infinity : startMs; // 什么时候可以开始聚拢
    let boltAnim: Animation | null = null;
    let born = 0; // 第一次出场的时刻（秒），用来画刚劈出来时的那层白热
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // 颜色只在文字还没被藏起来的时候读一次
    const cs0 = getComputedStyle(host);
    const color = cs0.color;
    const accent = cs0.getPropertyValue("--color-accent").trim() || "#d9bb8c";

    /** 宿主里每个字和它在页面上的位置 */
    function glyphs() {
      const out: { ch: string; r: DOMRect }[] = [];
      const walker = document.createTreeWalker(host!, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent ?? "";
        let i = 0;
        for (const ch of text) {
          if (ch.trim()) {
            range.setStart(n, i);
            range.setEnd(n, i + ch.length);
            const r = range.getBoundingClientRect();
            if (r.width && r.height) out.push({ ch, r });
          }
          i += ch.length;
        }
      }
      return out;
    }

    function build() {
      const hr = host!.getBoundingClientRect();
      const cs = getComputedStyle(host!);
      const base = parseFloat(cs.fontSize);
      const w = hr.width + PAD * 2;
      const h = hr.height + PAD * 2;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 大字：点的间距约为字号的 1/24，看得出是点阵；小字：尽量密，只求聚拢时轮廓像字
      const step = crisp ? Math.max(1.5, base / 9) : Math.max(2.6, base / 24);
      dot = step * (crisp ? 0.46 : 0.4);
      box = { w, h, cx: w / 2, cy: h / 2, diag: Math.hypot(hr.width, hr.height) };

      // 照着每个字的真实位置把文字画到离屏画布上，再按网格取样
      const off = document.createElement("canvas");
      off.width = Math.ceil(w);
      off.height = Math.ceil(h);
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.font = `${cs.fontWeight} ${base}px ${cs.fontFamily}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      for (const g of glyphs()) o.fillText(g.ch, g.r.left - hr.left + PAD + g.r.width / 2, g.r.top - hr.top + PAD + g.r.height / 2);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const pts: [number, number][] = [];
      for (let y = step / 2; y < off.height; y += step)
        for (let x = step / 2; x < off.width; x += step)
          if (data[((y | 0) * off.width + (x | 0)) * 4 + 3] > 110) pts.push([x, y]);
      pts.sort(() => Math.random() - 0.5);

      const old = parts;
      parts = pts.map(([tx, ty], i) => {
        const a = Math.random() * Math.PI * 2;
        const r = (0.25 + Math.random() * 0.75) * Math.max(box.diag * 0.55, 70);
        const p = old[i];
        return {
          x: p ? p.x : box.cx + Math.cos(a) * r,
          y: p ? p.y : box.cy + Math.sin(a) * r * 0.8,
          vx: 0,
          vy: 0,
          tx,
          ty,
          delay: Math.random() * 0.3,
          seed: Math.random(),
        };
      });
    }

    /** 第一次出场：把粒子摆到闪电的折线上，给一个向两侧迸开的初速度 */
    function spawnFromBolt() {
      const el = from ? document.querySelector(from) : null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const hr = host!.getBoundingClientRect();
      const ox = r.left - hr.left + PAD, oy = r.top - hr.top + PAD;
      const y0 = Math.max(0, -oy / r.height), y1 = Math.min(1, (box.h - oy) / r.height); // 只用落在画布里的那一段
      for (const p of parts) {
        const f = y0 + Math.random() * Math.max(0.05, y1 - y0);
        let i = 1;
        while (i < BOLT.length - 1 && BOLT[i][1] < f) i++;
        const [ax, ay] = BOLT[i - 1], [bx, by] = BOLT[i];
        const k = (f - ay) / (by - ay || 1);
        p.x = ox + (ax + (bx - ax) * k) * r.width + (Math.random() - 0.5) * 6;
        p.y = oy + f * r.height;
        const s = (60 + Math.random() * 300) * (Math.random() < 0.5 ? -1 : 1);
        p.vx = s;
        p.vy = (Math.random() - 0.35) * 160;
      }
    }

    /** 谁在显示：粒子（文字透明）还是真正的文字（画布透明） */
    function show(what: "particles" | "text") {
      host!.classList.toggle("pt-hide", what === "particles");
      canvas!.style.opacity = what === "particles" ? "1" : "0";
    }

    function enter(next: typeof phase, now: number) {
      phase = next;
      t0 = now;
      if (next === "scatter") {
        show("particles");
        for (const p of parts) {
          const dx = p.x - box.cx, dy = p.y - box.cy;
          const d = Math.hypot(dx, dy) || 1;
          const s = (140 + Math.random() * 380) * Math.max(0.45, box.diag / 400);
          const a = Math.random() * Math.PI * 2;
          p.vx = (dx / d) * s * 0.55 + Math.cos(a) * s * 0.6;
          p.vy = (dy / d) * s * 0.55 + Math.sin(a) * s * 0.6;
        }
      }
      if (next === "gather") {
        show("particles");
        for (const p of parts) p.delay = Math.random() * 0.32;
      }
      if (next === "hold" && crisp) show("text");
    }

    function frame(ms: number) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const now = ms / 1000;
      const dt = Math.min(0.05, now - last || 0.016);
      last = now;
      if (!visible) return;
      if (phase === "wait") {
        if (boltAnim && readyAt === Infinity) {
          // 闪电亮过了头、正在暗下去的时候出发：这时它还看得见，粒子像是从它身上崩出来的。
          // 进度 0.42 之前闪电是全亮的（见 globals.css 的 lt-bolt），BOLT_AT 取在它暗到六成左右的位置
          const prog = boltAnim.effect?.getComputedTiming().progress;
          if (boltAnim.playState === "finished" || (typeof prog === "number" && prog >= BOLT_AT)) readyAt = performance.now() + delayMs;
        }
        if (performance.now() < readyAt) return;
        born = now;
        spawnFromBolt();
        enter("gather", now);
      }
      const t = now - t0;

      if (phase === "scatter") {
        for (const p of parts) {
          p.vx *= 1 - 2.6 * dt;
          p.vy *= 1 - 2.6 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        if (t > SCATTER_S) enter("gather", now);
      } else if (phase === "gather") {
        for (const p of parts) {
          if (t < p.delay) {
            p.vx *= 1 - 3 * dt; p.vy *= 1 - 3 * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            continue;
          }
          // 带阻尼的弹簧：冲过去、略微过头、收住
          const k = 46, c = 11.5;
          p.vx += ((p.tx - p.x) * k - p.vx * c) * dt;
          p.vy += ((p.ty - p.y) * k - p.vy * c) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        if (t > GATHER_S) {
          for (const p of parts) { p.x = p.tx; p.y = p.ty; p.vx = p.vy = 0; }
          enter("hold", now);
        }
      } else if (phase === "hold") {
        if (holdS !== undefined && t > holdS) enter("scatter", now);
        else if (crisp && t > 0.4) {
          // 小字停住时显示的是真文字，画布不用再画；不循环的话连这个循环也停掉
          if (holdS === undefined) { cancelAnimationFrame(raf); raf = 0; }
          return;
        } else if (holdS === undefined && t > 2.6) {
          // 大标题：那道斜光扫完之后画面不会再变，画完这一帧就停
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }

      // 画。大标题停住时有一道斜光扫过：离扫描线近的点换成金色
      ctx!.clearRect(0, 0, box.w, box.h);
      const sweep = phase === "hold" && !crisp ? (t - 0.9) / 1.3 : -1; // 0..1 之间才有光
      const band = box.diag * 0.07;
      const pos = -box.diag * 0.75 + sweep * box.diag * 1.5;
      ctx!.fillStyle = color;
      ctx!.beginPath();
      const lit: P[] = [];
      for (const p of parts) {
        if (sweep > 0 && sweep < 1) {
          const d = (p.x - box.cx) * 0.83 + (p.y - box.cy) * 0.56 - pos;
          if (Math.abs(d) < band * (0.5 + p.seed)) { lit.push(p); continue; }
        }
        ctx!.moveTo(p.x + dot, p.y);
        ctx!.arc(p.x, p.y, dot, 0, 6.2832);
      }
      ctx!.fill();
      // 刚劈出来的头半秒：粒子是白热的，随后冷却成文字的颜色
      const heat = from && born ? 1 - (now - born) / 0.55 : 0;
      if (heat > 0) {
        ctx!.globalAlpha = heat * heat;
        ctx!.fillStyle = "#fff8e6";
        ctx!.beginPath();
        for (const p of parts) { ctx!.moveTo(p.x + dot * 1.25, p.y); ctx!.arc(p.x, p.y, dot * 1.25, 0, 6.2832); }
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
      if (lit.length) {
        ctx!.fillStyle = accent;
        ctx!.beginPath();
        for (const p of lit) { ctx!.moveTo(p.x + dot, p.y); ctx!.arc(p.x, p.y, dot * 1.08, 0, 6.2832); }
        ctx!.fill();
      }
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        build();
        if (phase === "hold") {
          for (const p of parts) { p.x = p.tx; p.y = p.ty; }
          // 循环可能已经停了：把阶段时间拨到斜光扫完之后，补画一帧
          t0 = performance.now() / 1000 - 2.5;
          if (!raf) raf = requestAnimationFrame(frame);
        }
      }, 180);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; });
    const onVis = () => { visible = !document.hidden; };

    // 等字体就绪再取样，否则点阵是按后备字体排出来的
    document.fonts
      .load(`${cs0.fontWeight} ${cs0.fontSize} ${cs0.fontFamily}`, host.textContent ?? "")
      .catch(() => undefined)
      .then(() => {
        if (!alive) return;
        build();
        show("particles");
        // 跟着闪电走：它的动画播完（完全熄灭）才开始；找不到那道闪电就按 startMs
        const bolt = from ? document.querySelector(from) : null;
        boltAnim = bolt?.getAnimations().find((a) => (a as CSSAnimation).animationName === "lt-bolt") ?? null;
        if (!boltAnim) readyAt = startMs;
        io.observe(host);
        window.addEventListener("resize", onResize);
        document.addEventListener("visibilitychange", onVis);
        raf = requestAnimationFrame(frame);
      });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      host.classList.remove("pt-hide");
    };
  }, [startMs, delayMs, holdS, crisp, from]);

  return <canvas ref={ref} className="pt-canvas" aria-hidden />;
}
