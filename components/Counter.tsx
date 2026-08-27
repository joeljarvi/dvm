// Where you are in a project's images, read as `1 (3)`. Built from the two
// numbers rather than handed a string so the halves can be styled apart.
export default function Counter({
  frame,
  total,
}: {
  /** Which of the project's images is up, 1-based. */
  frame?: number;
  /** How many it has. */
  total?: number;
}) {
  // Not truthiness: a legitimate zero would read as nothing to count.
  if (frame === undefined || total === undefined) return null;

  return (
    // tabular-nums so the row doesn't shift as the count ticks over.
    <span className="font-selecta font-normal tracking-wide text-[0.8rem] tabular-nums text-neutral-300">
      {frame} <span className="text-neutral-300">({total})</span>
    </span>
  );
}
