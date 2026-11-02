import { HOVER_CLASS, REVEAL_CLASS } from "@/lib/motion";

export default function SectionOverlay({
  section,
  dismissed,
  onClick,
  onFocusChange,
}: {
  section: string;

  dismissed: boolean;
  onClick: () => void;

  onFocusChange?: (focused: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      tabIndex={dismissed ? -1 : 0}
      data-section-trigger={section}
      aria-hidden={dismissed}
      aria-label={`Show ${section} work`}
      className={`absolute z-900 inset-0 cursor-pointer outline-none ${
        dismissed ? "pointer-events-none" : ""
      }`}
    />
  );
}

export const DEFAULT_LANDING_TEXT = "Personal Or Commissioned";

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

const WORD_ALIGN = [
  "text-center lg:justify-self-start lg:text-left",
  "text-center lg:justify-self-center",
  "text-center lg:justify-self-end lg:text-right",
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

  words: number;
}) {
  return (
    <div
      aria-hidden={dismissed}
      className={`pointer-events-none absolute inset-x-0 top-0 lg:top-[62.5%] z-20 flex flex-col justify-between lg:grid lg:grid-cols-3 h-dvh lg:h-auto items-center py-5.5 px-5.5 whitespace-nowrap font-diatype text-[0.8rem] tracking-wide font-normal text-neutral-400 dark:text-neutral-500 transition-opacity ${REVEAL_CLASS} ${
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
