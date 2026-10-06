/** 通用小工具 */

/** 2026-09-18 → 2026 年 9 月 18 日 */
export function formatDateCN(date: string): string {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

/** 2026-09-18 → 2026-09-18（用于 <time dateTime>） */
export function toIsoDate(date: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : date;
}

/** 数组去重 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** className 拼接 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/** 计算瀑布流用的宽高比，避免布局抖动 */
export function aspectRatio(width: number, height: number): number {
  return height / width;
}
