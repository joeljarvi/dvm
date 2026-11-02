import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export default function Counter({
  frame,
  total,
  className,
}: {
  frame?: number;

  total?: number;

  className?: string;
}) {
  if (frame === undefined || total === undefined) return null;

  return (
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
