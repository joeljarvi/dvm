// The frosted plate over a column while the layout is stacked. Tapping it
// hands the width to that section — see HomeClient. Once either section has
// been chosen both plates go for good: the nav's own buttons carry the
// switching from there. Desktop shows both columns outright, so it never
// appears there.
export default function SectionOverlay({
  section,
  dismissed,
  onClick,
}: {
  section: string;
  /** A section has been chosen — either one — so the plates step aside. */
  dismissed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${section}`}
      className={`group/overlay  absolute z-900 inset-0 bg-background/20 hover:bg-background/10 backdrop-blur-md transition-all duration-700 ease-out flex items-center justify-center ${
        dismissed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Named group: the column behind this is a `group` too, and an
          unnamed `group-*` answers to any matching ancestor. */}
      <h2
        className={` ${section === "personal" ? "-rotate-90 lg:rotate-0" : "rotate-90 lg:rotate-0"} font-selecta text-base tracking-wide font-medium text-neutral-400 transition-colors duration-200 ease-out group-hover/overlay:text-blue-700 group-active/overlay:text-blue-700`}
      >
        {section}
      </h2>
    </button>
  );
}
