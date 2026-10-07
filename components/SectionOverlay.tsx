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
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${section}`}
      className={`absolute z-900 inset-0 cursor-pointer ${
        dismissed ? "pointer-events-none" : ""
      }`}
    />
  );
}

// The landing prompt — Site Settings' Landing Text in Sanity — spread across
// the screen above both panels' images: a row on desktop, a column on
// mobile. Its words come in one at a time on the landing beats, in grey —
// "Personal" and "Commissioned", wherever they fall in it, turning blue while
// their panel's images are hovered.
export const DEFAULT_LANDING_TEXT = "Please Select Personal Or Commissioned";

export function landingWords(text: string | null | undefined) {
  return (text?.trim() || DEFAULT_LANDING_TEXT).split(/\s+/).map((word) => {
    const bare = word.toLowerCase().replace(/[^a-z]/g, "");
    return {
      text: word,
      section:
        bare === "personal" || bare === "commissioned" ? bare : undefined,
    };
  });
}

// Where each word sits: centred, stacked top to bottom on mobile; on
// desktop, in its column of three — left, centre, right.
const WORD_ALIGN = [
  "self-center justify-self-center text-center lg:justify-self-start lg:text-left",
  "self-center justify-self-center text-center",
  "self-center justify-self-center text-center lg:justify-self-end lg:text-right",
];

export function LandingPrompt({
  prompt,
  dismissed,
  words,
  hovered,
}: {
  prompt: ReturnType<typeof landingWords>;
  dismissed: boolean;
  hovered: "personal" | "commissioned" | null;
  /** How many of the prompt's words are in. */
  words: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 top-0 lg:top-[62.5%] z-20 flex flex-col justify-between lg:grid lg:grid-cols-3 h-dvh lg:h-min items-center py-5.5 lg:py-5.5 px-5.5 whitespace-nowrap font-diatype text-[0.8rem] tracking-wide font-normal text-neutral-400 dark:text-neutral-500 transition-opacity ${REVEAL_CLASS} ${
        dismissed ? "opacity-0" : "opacity-100"
      }`}
    >
      {prompt.map(({ text, section }, i) => (
        <span
          key={i}
          className={`${WORD_ALIGN[i % 3]} transition-[color,opacity] ${
            section && hovered === section
              ? `${HOVER_CLASS} text-blue-700`
              : REVEAL_CLASS
          } ${words > i ? "opacity-100" : "opacity-0"}`}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
