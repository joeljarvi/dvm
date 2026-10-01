import { CustomCursorTarget } from "@/components/ui/custom-cursor";
import { REVEAL_CLASS } from "@/lib/motion";

export default function SectionOverlay({
  section,
  dismissed,
  onClick,
}: {
  section: string;

  dismissed: boolean;
  onClick: () => void;
}) {
  return (
    // Just the click target now — the veil itself is drawn over each cover
    // (see Cover in HomeClient), so the section label underneath the images
    // stays sharp where they don't cover it.
    <CustomCursorTarget asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Show ${section}`}
        className={`absolute z-900 inset-0 cursor-pointer ${
          dismissed ? "pointer-events-none" : ""
        }`}
      />
    </CustomCursorTarget>
  );
}

// The section's name. Rendered beneath the column's images rather than on the
// overlay, so the covers land on top of it — the name reads as printed on the
// panel underneath them.
export function SectionLabel({
  section,
  dismissed,
  shown,
}: {
  section: string;
  dismissed: boolean;
  shown: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 flex items-start justify-center transition-opacity ${REVEAL_CLASS} ${
        dismissed || !shown ? "opacity-0" : "opacity-100"
      }`}
    >
      <h2
        className={`capitalize font-diatype text-[0.8rem] px-5.5 mt-[50vh] tracking-wide font-normal text-neutral-400 transition-colors duration-200 ease-out group-hover:text-blue-700 `}
      >
        {section}
      </h2>
    </div>
  );
}
