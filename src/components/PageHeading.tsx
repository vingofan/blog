import { cx } from "@/lib/utils";

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** 右侧操作区 */
  aside?: React.ReactNode;
  className?: string;
}

/** 全站统一的页面标题区：留白充足、层级清晰 */
export default function PageHeading({
  eyebrow,
  title,
  description,
  aside,
  className,
}: PageHeadingProps) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6 border-b border-(--color-line-soft) pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        className
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2.5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-loose text-(--color-fg-muted) sm:text-[1rem]">
            {description}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
