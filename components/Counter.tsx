// Where you are in a project's images, read as `1 (3)`. Built from the two
// numbers rather than handed a string so the halves can be styled apart.

import { Button } from "./ui/button";

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
    <Button
      variant="link"
      size="sm"
      className="font-selecta font-normal tracking-wide h-14 tabular-nums text-neutral-400"
    >
      {frame} <span className="text-neutral-400">({total})</span>
    </Button>
  );
}
