/**
 * 首页 Hero 的闪电层：两道远处的闪电先亮（细、暗、落在豹子身后），
 * 紧接着主闪劈在站名的位置（那一道在 LightningTitle 里），整屏跟着亮一下。
 * 覆盖整个 Hero、不拦截点击；样式与时间轴见 globals.css 的 .lt-* / .hl-*。
 *
 * 早先是五道差不多的细线并排从顶上垂下来，像一排挂着的线，不像闪电；
 * 现在分主次：远处两道只是铺垫，真正劈下来的只有站名那一道。
 */
const BOLTS = [
  {
    left: "36%",
    height: "52%",
    width: "110px",
    delay: "0.15s",
    stroke: 1.3,
    d: "M52 0 L38 44 L60 82 L30 136 L58 176 L36 232 L50 300",
    fork: "M60 82 L88 120 L78 168",
  },
  {
    left: "57%",
    height: "34%",
    width: "80px",
    delay: "0.3s",
    stroke: 1.1,
    d: "M46 0 L62 58 L40 110 L60 178 L48 300",
    fork: "M40 110 L16 150 L24 196",
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
          className="lt-bolt hl-bolt hl-far"
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
