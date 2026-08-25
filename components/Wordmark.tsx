// Hovering the mark dissolves the lettering and leaves the coloured plates
// behind. Fades `color` rather than `opacity` — opacity on the span would take
// its background with it.
//
// `blank` hides the glyphs and nothing else, so the mark reduces to the three
// plates behind D, v and M. The rest of each word stays in the DOM at zero
// opacity rather than being dropped, so the initials hold their spacing. The
// opacity sits on an inner span, since putting it on the plate would fade the
// plate too.

const part =
  "inline-block  transition-colors duration-500 ease-out group-hover:text-transparent";

// Split at the initial: it lands first in the intro and carries the plate.
const NAME = [
  { initial: "D", rest: "aniel" },
  { initial: "v", rest: "on" },
  { initial: "M", rest: "almborg" },
];

export default function Wordmark({ blank = false }: { blank?: boolean }) {
  const glyphs = blank ? "opacity-0" : "opacity-100";

  return (
    <div className="flex justify-between w-full ">
      {NAME.map(({ initial, rest }) => (
        <span
          key={initial}
          className="flex items-center gap-x-3 font-selecta font-medium tracking-wider text-2xl leading-[0.6] "
        >
          <div className="text-foreground h-min  ">
            <span className={`bg-background font-bold ${part}`}>
              <span className={glyphs}>{initial}</span>
            </span>
            <span className={`text-foreground font-medium ${part}`}>
              <span className={glyphs}>{rest}</span>
            </span>
          </div>
        </span>
      ))}
    </div>
  );
}
