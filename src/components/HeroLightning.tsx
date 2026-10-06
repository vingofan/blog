/**
 * 首页 Hero 的闪电层：站名上那道闪电（LightningTitle）劈完之后，
 * 再接几道落在黑豹所在的右半边，配两次大范围闪光——像闪电降临。
 * 覆盖整个 Hero、不拦截点击；样式与时间轴见 globals.css 的 .lt-* / .hl-*。
 *
 * left / height 是相对 Hero 的百分比：豹子在右侧约 55%~95%、脚下落地线约在 80% 高度，
 * 主闪（B）正好劈到那条线上。delay 是各道闪电的开始时刻，文字的延迟接在最后一道之后（见 page.tsx）。
 */
const BOLTS = [
  {
    left: "73%",
    height: "81%",
    width: "90px",
    delay: "0.45s",
    stroke: 2.4,
    d: "M55 0 L38 48 L64 88 L34 140 L62 178 L40 228 L58 262 L50 300",
    fork: "M64 88 L88 124 L72 160",
  },
  {
    left: "62%",
    height: "58%",
    width: "80px",
    delay: "0.6s",
    stroke: 2,
    d: "M46 0 L62 52 L40 96 L66 150 L44 204 L58 252 L52 300",
    fork: "M40 96 L16 132 L26 170",
  },
  {
    left: "87%",
    height: "50%",
    width: "70px",
    delay: "0.72s",
    stroke: 1.8,
    d: "M60 0 L44 70 L68 118 L48 176 L62 230 L54 300",
    fork: "M68 118 L90 150",
  },
  {
    left: "51%",
    height: "38%",
    width: "60px",
    delay: "0.54s",
    stroke: 1.6,
    d: "M50 0 L64 60 L42 120 L56 190 L48 300",
    fork: "M42 120 L20 150",
  },
] as const;

export default function HeroLightning() {
  return (
    <div className="hl-layer" aria-hidden>
      <span className="hl-flash hl-flash-a" />
      <span className="hl-flash hl-flash-b" />
      {BOLTS.map((b) => (
        <svg
          key={b.left}
          className="lt-bolt hl-bolt"
          viewBox="0 0 100 300"
          preserveAspectRatio="none"
          fill="none"
          style={
            {
              "--bl": b.left,
              "--bh": b.height,
              "--bw": b.width,
              "--bd": b.delay,
              strokeWidth: `${b.stroke}px`,
            } as React.CSSProperties
          }
        >
          <path d={b.d} />
          <path className="lt-fork" d={b.fork} />
        </svg>
      ))}
    </div>
  );
}
