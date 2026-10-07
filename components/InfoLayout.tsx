import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Counter from "@/components/Counter";
import { REVEAL_TRANSITION, QUICK_CLASS, FOLLOW_DELAY } from "@/lib/motion";

export default function InfoLayout({
  title,
  titleHref,
  onTitleClick,
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
  /** Called as the title link is followed. */
  onTitleClick?: () => void;

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

  const titleClass = `transition-colors ${QUICK_CLASS} font-diatype font-normal tracking-wide group-hover:text-blue-700 ${
    highlight
      ? "text-blue-700 mix-blend-normal"
      : // Always blue on mobile — only desktop greys it out of view.
        "mix-blend-difference text-neutral-400 dark:text-neutral-500 max-lg:mix-blend-normal max-lg:text-blue-700 max-lg:dark:text-blue-700"
  }`;

  // The whole left block — title, credit and agency — is the link to the
  // project's page, when there is one.
  const blockClass = "justify-self-end flex flex-col items-start text-left";
  const block = (
    <>
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
            {titleHref ? <SwapLabel>{title}</SwapLabel> : title}
          </motion.h3>
        )}
      </AnimatePresence>
      {/* With no title of its own showing (none, or the same as the
            credit), the credit carries the swap instead. */}
      {credited && (
        <h3 className={titleClass}>
          {titleHref && !showTitle ? (
            <SwapLabel>{credited.text}</SwapLabel>
          ) : (
            credited.text
          )}
        </h3>
      )}
      <AnimatePresence initial={false}>
        {revealed && agency && (
          <motion.h3
            key="agency"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ ...REVEAL_TRANSITION, delay: FOLLOW_DELAY }}
            className={titleClass}
          >
            {agency}
          </motion.h3>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="flex justify-between items-center gap-x-4 w-full font-diatype  font-normal px-0 tracking-wide text-[0.8rem] ">
      {titleHref ? (
        <Link
          href={titleHref}
          onClick={onTitleClick}
          className={`${blockClass} group/link pointer-events-auto cursor-zoom-in`}
        >
          {block}
        </Link>
      ) : (
        <div className={blockClass}>{block}</div>
      )}
      <Counter frame={frame} total={total} className={counterClassName} />
    </div>
  );
}

// The leading line of the link to a project's page: while the link is
// hovered, its text crossfades to "Show In Fullscreen" — where the link goes.
// Both texts sit stacked in one grid cell, so it keeps the width of the
// longer one either way and never shrinks out from under the pointer
// mid-swap.
function SwapLabel({ children }: { children: React.ReactNode }) {
  const fade = `col-start-1 row-start-1 transition-opacity ${QUICK_CLASS}`;
  return (
    <span className="inline-grid">
      <span className={`${fade} group-hover/link:opacity-0`}>{children}</span>
      <span
        aria-hidden
        className={`${fade} opacity-0 group-hover/link:opacity-100`}
      >
        Show In Fullscreen
      </span>
    </span>
  );
}
