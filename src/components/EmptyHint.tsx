/**
 * 空状态提示：板块还没有内容时用到，避免页面只剩一片空白。
 * 访客看到的是伏着的雪豹和一句话；新建内容的命令行提示只在本地开发时显示，
 * 那是写给站长自己看的。
 */
export default function EmptyHint({
  text,
  cmd,
}: {
  text: string;
  cmd?: string;
}) {
  const showCmd = cmd && process.env.NODE_ENV === "development";
  return (
    <div className="card-dark mt-14 flex flex-col items-center gap-3 px-6 py-14 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/brand/leopard-stalk-cutout.webp"
        width={740}
        height={320}
        alt=""
        aria-hidden
        className="mb-2 w-64 max-w-full select-none sm:w-72"
      />
      <p className="text-sm text-(--color-fg-muted)">{text}</p>
      <p className="text-[0.75rem] tracking-[0.08em] text-(--color-fg-subtle)">
        它先替这里占着位置。
      </p>
      {showCmd && (
        <p className="mt-2 font-mono text-[0.68rem] tracking-wider text-(--color-fg-subtle) opacity-70">
          {cmd}
        </p>
      )}
    </div>
  );
}
