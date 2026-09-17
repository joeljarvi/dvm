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
  counterClassName,
  revealed = true,
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
  /** Lets the caller (e.g. HomeClient, keeping the counter desktop-only
   * while resting on a cover) override the counter's own visibility. */
  counterClassName?: string;
  /** Gallery mode. Resting, only the client/model line shows (with the
   * counter, on desktop); revealed, the title fades in above it and the
   * agency line fades in below. */
  revealed?: boolean;
  /** The cover is the one in view, so its title is lit without a pointer. */
  highlight?: boolean;
}) {
  const credited = model
    ? { key: "model" as const, text: model }
    : client
      ? { key: "client" as const, text: client }
      : null;
  // When the client/model repeats the title verbatim, showing both is just
  // noise — keep the client line (it's the one always up) and drop the
  // title rather than the other way around.
  const showTitle = Boolean(title) && title !== credited?.text;

  if (!title && !credited && frame === undefined) return null;

  const titleClass = `transition-colors duration-300 ease-out group-hover:text-blue-700 ${
    highlight ? "text-blue-700" : ""
  }`;

  return (
    <div className="flex  justify-between items-baseline gap-x-4 w-full font-selecta  font-normal px-0 tracking-wide text-[0.8rem] text-neutral-400">
      {/* The one line that answers the panel's hover. `group` is on the
          column this block sits inside. */}

      <div className="justify-self-end flex flex-col items-start text-left">
        {/* Title and agency come and go with gallery mode — the client/model
            line underneath stays up throughout, resting or not. */}
        <AnimatePresence initial={false}>
          {revealed && showTitle && (
            <motion.h3
              key="title"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={titleClass}
            >
              {title}
            </motion.h3>
          )}
        </AnimatePresence>
        {credited && <h3 className={titleClass}>{credited.text}</h3>}
        <AnimatePresence initial={false}>
          {revealed && agency && (
            <motion.h3
              key="agency"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.08,
              }}
              className="text-neutral-400"
            >
              {agency}
            </motion.h3>
          )}
        </AnimatePresence>
      </div>
      <Counter frame={frame} total={total} className={counterClassName} />
    </div>
  );
}
