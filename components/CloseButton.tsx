"use client";

// The shared close mark: a box crossed corner to corner — 36 × 36 on mobile,
// 70 × 70 from lg up. The X carries the meaning on screen, so the label from
// the modal stack — "Close" over a project or one of its items, "Back" out of
// a browser — is left to the accessible name.
//
// Non-scaling strokes hold the hairline at a true 1px at either size, rather
// than letting it shrink with the box.
export default function CloseButton({
  label = "Close",
  onClick,
  className = "",
}: {
  label?: string;
  // Takes the event so callers nested in click-to-close surfaces can stop the
  // bubble before it reaches them.
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`shrink-0 size-9 lg:size-17.5 cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${className}`}
    >
      <svg
        viewBox="0 0 70 70"
        fill="none"
        aria-hidden="true"
        className="w-full h-full"
      >
        {/* Inset by half a stroke so neither line clips against the edge. */}
        <line
          x1="0.5"
          y1="0.5"
          x2="69.5"
          y2="69.5"
          className="stroke-foreground"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1="69.5"
          y1="0.5"
          x2="0.5"
          y2="69.5"
          className="stroke-foreground"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </button>
  );
}
