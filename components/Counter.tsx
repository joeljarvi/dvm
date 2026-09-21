// Where you are in a project's images, read as `1 (3)`. Built from the two
// numbers rather than handed a string so the halves can be styled apart.

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function Counter({
  frame,
  total,
  className,
}: {
  /** Which of the project's images is up, 1-based. */
  frame?: number;
  /** How many it has. */
  total?: number;
  /** Overrides the counter's own visibility, e.g. `hidden lg:inline-flex`. */
  className?: string;
}) {
  // Not truthiness: a legitimate zero would read as nothing to count.
  if (frame === undefined || total === undefined) return null;

  return (
    // tabular-nums so the row doesn't shift as the count ticks over.
    <Button
      variant="link"
      size="sm"
      className={cn(
        "font-normal tracking-wide h-auto tabular-nums  px-0 text-neutral-400 dark:text-neutral-600",
        className,
      )}
    >
      {frame} <span className="">({total})</span>
    </Button>
  );
}
