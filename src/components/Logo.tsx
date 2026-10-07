/**
 * 站点标志
 * ------------------------------------------------------------------
 * 图形：站立的黑豹正脸，抠成透明、不铺任何底色。
 *
 * 但抠图本身在深色页头上是不成立的：豹毛平均 RGB(33,31,29)，站点底色
 * --color-base 是 #1b1a18，实测对底色只有 1.08:1，缩到 28px 就只剩一团
 * 比背景略深的模糊。换掉之前那枚深色方章也正是这个原因。
 *
 * 解决办法是给轮廓加一圈**顶光描边**（上亮下弱，模拟棚拍打在背毛上的边光），
 * 而不是提亮豹子本身——提亮会让它变灰，"黑豹"这个身份就没了。
 * 描边由 alpha 外扩 30px + 高斯羽化得到，亮度按 y 从 1.0 衰减到 0.15。
 *
 * 母图在 vibe_images/leopard-mark-master.png（已按轮廓裁切并补成正方形），
 * 下面两档由它等比缩放而来，不裁切：
 *   - logo-mark.webp（192px）用于页头、页脚
 *   - logo-mark-small.webp（96px）用于极小场景
 * favicon 用 src/app/icon.png，同一母图的 192px PNG。
 */

const LOGO_SRC = "/images/brand/logo-mark.webp";
const LOGO_SMALL_SRC = "/images/brand/logo-mark-small.webp";

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
      style={{ objectFit: "contain" }}
    />
  );
}
