import { AnimatePresence, motion } from "motion/react";
import Counter from "@/components/Counter";

// The metadata line under a cover: what the work is on the left, who it was
// for on the right — now the image counter, swapped in for the caption
// (which moved to sit on the image itself, bottom-center — see Cover).
export default function InfoLayout({
  title,
  model,
  client,
  agency,
  frame,
  total,
  highlight = false,
}: {
  title?: string;
  /** Personal work credits a model where commissioned work credits a client. */
  model?: string;
  client?: string;
  agency?: string;
  /** Which of the project's images is up, 1-based, and how many it has. */
  frame?: number;
  total?: number;
  /** The cover is the one in view, so its title is lit without a pointer. */
  highlight?: boolean;
}) {
  // Only up while gallery mode is on — see HomeClient — so each comes and
  // goes with it rather than sitting there permanently.
  const credited =
    model && model !== title
      ? { key: "model" as const, text: model }
      : client && client !== title
        ? { key: "client" as const, text: client }
        : null;
  const lines = [
    credited,
    agency ? { key: "agency" as const, text: agency } : null,
  ].filter((line): line is { key: "model" | "client" | "agency"; text: string } => line !== null);

  if (!title && !lines.length && frame === undefined) return null;

  return (
    <div className="flex  justify-between items-baseline gap-x-4 w-full font-selecta  font-normal px-0 tracking-wide text-[0.8rem] text-neutral-400">
      {/* The one line that answers the panel's hover. `group` is on the
          column this block sits inside. */}

      <div className="justify-self-end flex flex-col items-start text-left">
        <h3
          className={`transition-colors duration-300  ease-out group-hover:text-blue-700 ${
            highlight ? "text-blue-700" : ""
          }`}
        >
          {title}
        </h3>
        {/* Staggered in as gallery mode opens, staggered back out as it
            closes — each line's own delay, shared by its entrance and its
            exit, is what gives both directions the same rhythm. */}
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.h3
              key={line.key}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.08,
              }}
              className={
                line.key === "agency"
                  ? "text-neutral-400"
                  : `transition-colors duration-300 ease-out group-hover:text-blue-700 ${
                      highlight ? "text-blue-700" : ""
                    }`
              }
            >
              {line.key === "agency" ? ` ${line.text} ` : line.text}
            </motion.h3>
          ))}
        </AnimatePresence>
      </div>
      <Counter frame={frame} total={total} />
    </div>
  );
}
