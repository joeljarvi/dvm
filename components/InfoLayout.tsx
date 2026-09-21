import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Counter from "@/components/Counter";
import { REVEAL_TRANSITION } from "@/lib/motion";

export default function InfoLayout({
  title,
  titleHref,
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
  /** Where the title links to — its own project page. Omit to render it as
   * plain text, e.g. on the project page itself. */
  titleHref?: string;

  model?: string;
  client?: string;
  agency?: string;

  frame?: number;
  total?: number;

  counterClassName?: string;

  revealed?: boolean;

  highlight?: boolean;
}) {
  const credited = model
    ? { key: "model" as const, text: model }
    : client
      ? { key: "client" as const, text: client }
      : null;

  const showTitle = Boolean(title) && title !== credited?.text;

  if (!title && !credited && frame === undefined) return null;

  const titleClass = `transition-colors  duration-300 ease-out font-diatype font-normal tracking-wide group-hover:text-blue-700 ${
    highlight
      ? "text-blue-700 mix-blend-normal"
      : "mix-blend-difference text-neutral-400 dark:text-neutral-500   "
  }`;

  return (
    <div className="flex  justify-between items-baseline gap-x-4 w-full font-diatype  font-normal px-0 tracking-wide text-[0.8rem] ">
      <div className="justify-self-end flex flex-col items-start text-left">
        <AnimatePresence initial={false}>
          {revealed && showTitle && (
            <motion.h3
              key="title"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={REVEAL_TRANSITION}
              className={`${titleClass} capitalize`}
            >
              {titleHref ? (
                <Link
                  href={titleHref}
                  className="pointer-events-auto flex gap-0.5  "
                >
                  {" "}
                  {title}
                </Link>
              ) : (
                title
              )}
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
              transition={{ ...REVEAL_TRANSITION, delay: 0.08 }}
              className={
                highlight
                  ? "text-blue-700 mix-blend-normal"
                  : "mix-blend-difference text-neutral-400 dark:text-neutral-500 "
              }
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
