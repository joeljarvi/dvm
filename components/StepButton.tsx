"use client";

// Prev / next as a 39 × 39 chevron: two lines meeting at the midpoint of the
// leading edge. Same hairline language as CloseButton, so the three read as
// one set of marks.
const POINTS = {
  back: "38.5,0.5 0.5,19.5 38.5,38.5",
  next: "0.5,0.5 38.5,19.5 0.5,38.5",
} as const;

export default function StepButton({
  direction,
  label,
  onClick,
  className = "",
}: {
  direction: "back" | "next";
  label?: string;
  // Takes the event: these sit inside the click zones that step on their own,
  // so the handler has to stop the bubble or a press would step twice.
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label ?? (direction === "back" ? "Previous" : "Next")}
      onClick={onClick}
      className={`shrink-0 size-9.75 cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${className}`}
    >
      <svg
        viewBox="0 0 39 39"
        fill="none"
        aria-hidden="true"
        className="w-full h-full"
      >
        {/* Inset by half a stroke so the ends don't clip against the edge. */}
        <polyline
          points={POINTS[direction]}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </button>
  );
}
