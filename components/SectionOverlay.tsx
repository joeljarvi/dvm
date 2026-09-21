import { CustomCursorTarget } from "@/components/ui/custom-cursor";

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
    <CustomCursorTarget asChild>
      <button
        type="button"
        onClick={onClick}
        aria-label={`Show ${section}`}
        className={`group/overlay  absolute z-900 inset-0 bg-background/60 hover:bg-background/70 noise-bg backdrop-blur-xs [transition:background-color_200ms_ease-out,opacity_700ms_cubic-bezier(0.22,1,0.36,1)] flex items-start justify-center cursor-pointer ${
          dismissed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <h2
          className={`capitalize ${section === "personal" ? "text-left lg:rotate-0" : "text-right lg:rotate-0"} font-selecta text-[0.8rem] px-5.5 mt-[50vh] tracking-wide  font-normal text-neutral-400 transition-colors duration-200 ease-out group-hover/overlay:text-blue-700 group-active/overlay:text-blue-700`}
        >
          {section}
        </h2>
      </button>
    </CustomCursorTarget>
  );
}
