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
    // A span, not a button: it reads the same but isn't a tab stop, since
    // there's nothing to press.
    <Button
      asChild
      variant="link"
      size="sm"
      className={cn(
        "font-normal font-diatype tracking-wide h-auto tabular-nums  px-0 text-blue-700 dark:text-blue-700 lg:text-neutral-400 lg:dark:text-neutral-400",
        className,
      )}
    >
      <span>
        {frame} <span className="">({total})</span>
      </span>
    </Button>
  );
}
