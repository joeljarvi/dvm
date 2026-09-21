"use client";

import Wordmark from "./Wordmark";
import { useIntro } from "@/lib/intro";
import { REVEAL_CLASS } from "@/lib/motion";

// The plate the name sits on.
//   text      — the name as lettering (default)
//   blank     — the plates behind D, v and M alone, no visible text
//   animation — plays the opening sequence from lib/intro
export default function DvmCard({
  variant = "text",
  color = "bg-blue-900",
  children,
}: {
  variant?: "text" | "blank" | "animation";
  color?: string;
  children?: React.ReactNode;
}) {
  const { words, plated, faded } = useIntro();
  const animated = variant === "animation";

  return (
    <div className="relative h-[33.3dvh] lg:h-[45dvh] flex flex-col items-start lg:items-start justify-between p-8 group aspect-video gap-y-4">
      <div
        className={`absolute inset-0 z-0 ${color} shadow-md transition-opacity ${REVEAL_CLASS} ${
          !animated || plated ? "" : "opacity-0"
        }`}
      />

      <div className="relative z-10 w-full">
        <Wordmark
          words={animated ? words : undefined}
          plated={animated ? plated : true}
          faded={animated ? faded : variant === "blank"}
        />
      </div>

      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
}
