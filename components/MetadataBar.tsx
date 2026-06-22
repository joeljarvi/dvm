import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function MetadataBar({
  left,
  center,
  right,
  className,
  stackOnMobile = false,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
  stackOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative left-0 right-0 flex items-center justify-between px-2 h-6 font-selecta text-lg lg:text-xl font-medium uppercase tracking-wide pointer-events-none mix-blend-difference text-background",
        stackOnMobile &&
          "flex-col items-center justify-center lg:flex-row lg:justify-between h-auto lg:h-6 ",
        className,
      )}
    >
      <span className="flex items-center gap-1">{left}</span>
      {center != null && (
        <span
          className={cn(
            "flex items-center gap-1",
            stackOnMobile
              ? "lg:absolute lg:left-1/2 lg:-translate-x-1/2"
              : "absolute left-1/2 -translate-x-1/2",
          )}
        >
          {center}
        </span>
      )}
      <span className="flex items-center gap-1">{right}</span>
    </div>
  );
}
