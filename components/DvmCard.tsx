"use client";

import Wordmark from "./Wordmark";
import { useIntro } from "@/lib/intro";

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
      {/* The plate is its own layer so it can fade up underneath the name
          rather than taking the name with it — the words are written before
          there is anything behind them. */}
      <div
        className={`absolute inset-0 z-0 ${color} shadow-md transition-opacity duration-700 ease-out ${
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
