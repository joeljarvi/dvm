"use client";

// Hovering the mark dissolves the lettering and leaves the coloured plates
// behind. Fades `color` rather than `opacity` — opacity on the span would take
// its background with it.
//
// The three props below drive the intro. They are independent on purpose: the
// name is written before its plates exist, and the plates outlive the name.
// Letters are never removed from the DOM, only held at zero opacity, so the
// mark keeps its full width from the first frame and nothing reflows.

const part =
  "inline-block transition-colors duration-500 ease-out group-hover:text-transparent";

const glyph = "inline-block transition-opacity duration-500 ease-out";

// Split at the initial: it carries the plate, the tail carries the rest.
const NAME = [
  { initial: "D", rest: "aniel" },
  { initial: "v", rest: "on" },
  { initial: "M", rest: "almborg" },
];

export default function Wordmark({
  words = NAME.length,
  plated = true,
  faded = false,
}: {
  /** How many words have been written, left to right. */
  words?: number;
  /** Whether the plates behind D, v and M are up. */
  plated?: boolean;
  /** Fade the lettering away, leaving the plates alone. */
  faded?: boolean;
}) {
  return (
    <div className="flex justify-between w-full ">
      {NAME.map(({ initial, rest }, i) => {
        const shown = !faded && i < words;
        return (
          <span
            key={initial}
            className="flex items-center gap-x-3 font-selecta font-medium tracking-wider text-2xl leading-[0.6] "
          >
            <div className="text-foreground h-min  ">
              <span
                className={`${plated ? "bg-background" : "bg-transparent"} font-bold ${part}`}
              >
                <span className={`${glyph} ${shown ? "" : "opacity-0"}`}>
                  {initial}
                </span>
              </span>
              <span className={`text-foreground font-medium ${part}`}>
                <span className={`${glyph} ${shown ? "" : "opacity-0"}`}>
                  {rest}
                </span>
              </span>
            </div>
          </span>
        );
      })}
    </div>
  );
}
