/**
 * 站点标志
 * ------------------------------------------------------------------
 * 图形：黑豹方章（leopard-badge-cold-dark），一张金属质感的圆角方形徽章，
 * 里面是一只冷脸黑豹 —— 耳朵压平、瞳孔收紧、正面盯着你。
 *
 * 选它是因为「林夕相心」这个名字里那股安静的野性 ——
 * 不是家宅的安稳，是夜色里独自坐着的那只。
 *
 * 这张图本身就是深色底（外圈 #010101），和站点底色 --color-base（#0a0a0b）
 * 几乎一致，所以方章边缘在深色页头上是「融进去」而不是「贴上去」，
 * 不用抠图，直接压到页头、页脚、favicon 三处。
 *
 * 两档尺寸：
 *   - logo-badge-cutout.webp（192px）用于页头、页脚
 *   - logo-badge-small.webp（96px）用于 favicon 等极小场景
 *
 * 写实的豹脸缩到 28px 仍能看清眼神（正脸比侧脸更适合小尺寸），
 * 再小就别用了。
 */

const LOGO_SRC = "/images/brand/logo-badge-cutout.webp";
const LOGO_SMALL_SRC = "/images/brand/logo-badge-small.webp";

export default function Logo({
  size = 28,
  className,
}: {
  /** 边长（px），小于等于 20 时自动切到小图 */
  size?: number;
  className?: string;
}) {
  const src = size <= 20 ? LOGO_SMALL_SRC : LOGO_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      draggable={false}
      className={className}
      style={{ objectFit: "contain", opacity: 0.96 }}
    />
  );
}