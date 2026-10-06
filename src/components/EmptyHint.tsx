/**
 * 空状态提示：内容被清空时用到，避免页面只剩一片空白。
 * 只显示一句话说明，命令行提示用等宽字体弱化呈现。
 */
export default function EmptyHint({
  text,
  cmd,
}: {
  text: string;
  cmd?: string;
}) {
  return (
    <div className="card-dark mt-14 flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-sm text-(--color-fg-muted)">{text}</p>
      {cmd && (
        <p className="font-mono text-[0.72rem] tracking-wider text-(--color-fg-subtle)">
          {cmd}
        </p>
      )}
    </div>
  );
}
