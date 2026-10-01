import type { ReactNode } from "react";
import { CustomCursorTarget } from "@/components/ui/custom-cursor";
import { HOVER_CLASS, REVEAL_CLASS } from "@/lib/motion";

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

// The section's name. Sits above the column's images, which come in beneath
// it during the landing reveal, and steps aside — fading out — while the
// panel's images are hovered. Halfway down the screen on desktop. On mobile,
// where the covers sit off-centre in their stacked halves, `mobileFrame`
// places it — the panel lays out a stand-in for its visible cover there and
// centres the label on it.
export function SectionLabel({
  section,
  dismissed,
  shown,
  mobileFrame,
}: {
  section: string;
  dismissed: boolean;
  shown: boolean;
  mobileFrame?: (label: ReactNode) => ReactNode;
}) {
  const label = (
    <h2
      className={`capitalize whitespace-nowrap font-diatype text-[0.8rem] tracking-wide font-normal text-neutral-400 transition-[color,opacity] ${HOVER_CLASS} group-hover:text-blue-700 group-hover/strip:opacity-0`}
    >
      {section}
    </h2>
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-20 transition-opacity ${REVEAL_CLASS} ${
        dismissed || !shown ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="hidden lg:flex absolute inset-0 items-start justify-center px-5.5 pt-[50vh]">
        {label}
      </div>
      <div className="lg:hidden absolute inset-0 flex items-center justify-center">
        {mobileFrame ? mobileFrame(label) : label}
      </div>
    </div>
  );
}
