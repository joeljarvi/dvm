"use client";

// Every nav label arrives the way the wordmark does: the initial lands first
// and the rest fades in behind it. `shown` is the label's beat on the intro
// timeline; labels that mount later than the intro just default to on.
// `marked` lights the dot without a pointer — the view you are already in
// keeps it, and hovering a home panel marks the section it belongs to.
export default function RevealLabel({
  text,
  shown = true,
  marked = false,
}: {
  text: string;
  shown?: boolean;
  marked?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {/* Marker. It holds its 14px whether or not it is showing, so the label
          never shifts under the cursor. `bg-current` so it follows the button
          through the nav's difference blend. */}
      <span
        aria-hidden
        className={`size-3.5 shrink-0 rounded-full bg-current transition-opacity duration-200 ease-out group-hover/button:opacity-100 ${
          marked ? "opacity-100" : "opacity-0"
        }`}
      />

      <span className="whitespace-nowrap">
        <strong
          className="transition-opacity duration-300 ease-out"
          style={{ opacity: shown ? 1 : 0 }}
        >
          {text.slice(0, 1)}
        </strong>
        <span
          className="transition-opacity duration-700 delay-300 ease-out tracking-wide"
          style={{ opacity: shown ? 1 : 0 }}
        >
          {text.slice(1)}
        </span>
      </span>
    </span>
  );
}
