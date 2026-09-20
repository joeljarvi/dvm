import { AnimatePresence, motion } from "motion/react";
import Counter from "@/components/Counter";

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

  const titleClass = `transition-colors duration-300 ease-out group-hover:text-blue-700 ${
    highlight ? "text-blue-700" : ""
  }`;

  return (
    <div className="flex  justify-between items-baseline gap-x-4 w-full font-selecta  font-normal px-0 tracking-wide text-[0.8rem] text-neutral-400">
      <div className="justify-self-end flex flex-col items-start text-left">
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
