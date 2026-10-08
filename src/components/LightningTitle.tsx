/**
 * 首页站名：一道闪电劈在站名所在的位置；等所有闪电都过去之后，字才从中间往两边依次淡入，
 * 只亮起一次、不闪。全部是 CSS（见 globals.css 的 .lt-*），没有 JS，服务端渲染直接可用。
 *
 * 读屏与搜索引擎读到的是 sr-only 里的完整站名；视觉层 aria-hidden。
 */
import ParticleTitle from "@/components/ParticleTitle";

export default function LightningTitle({ name }: { name: string }) {
  const chars = [...name];
  const mid = (chars.length - 1) / 2;

  return (
    <>
      <span className="sr-only">{name}</span>
      <span className="lt-stage pt-host" aria-hidden>
        {chars.map((c, i) => (
          <span
            key={i}
            className="lt-char"
            style={{ "--d": Math.abs(i - mid) } as React.CSSProperties}
          >
            {c}
          </span>
        ))}
        {/* 粒子版站名：接管后上面这几个字隐藏，由圆点拼出来；每隔几秒散开一次，再聚回站名 */}
        <ParticleTitle startMs={1500} from=".lt-stage > .lt-bolt" />
        {/* 闪电：viewBox 纵向被拉伸（preserveAspectRatio none），线宽用 non-scaling-stroke 保持不变。
            闪电靠 clip-path 自上而下揭开（见 .lt-bolt 的 lt-draw）。 */}
        <svg
          className="lt-bolt"
          viewBox="0 0 100 300"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
           
            d="M58 0 L40 62 L63 96 L36 156 L60 190 L44 240 L54 300"
          />
          <path className="lt-fork" d="M63 96 L86 132 L76 168" />
        </svg>
      </span>
    </>
  );
}
