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
                <ProjectLink href={titleHref} onClick={onTitleClick}>
                  {title}
                </ProjectLink>
              ) : (
                title
              )}
            </motion.h3>
          )}
        </AnimatePresence>
        {/* With no title of its own showing (none, or the same as the
            credit), the credit is the link to the project's page instead. */}
        {credited && (
          <h3 className={titleClass}>
            {titleHref && !showTitle ? (
              <ProjectLink href={titleHref} onClick={onTitleClick}>
                {credited.text}
              </ProjectLink>
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
              className={
                highlight
                  ? "text-blue-700 mix-blend-normal font-normal"
                  : "mix-blend-difference text-neutral-400 dark:text-neutral-500 font-normal"
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

// The link to a project's page: while hovered, its text crossfades to
// "Show Fullscreen" — where the link goes. Both texts sit stacked in one
// grid cell, so the link keeps the width of the longer one either way and
// never shrinks out from under the pointer mid-swap.
function ProjectLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const fade = `col-start-1 row-start-1 transition-opacity ${QUICK_CLASS}`;
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group/link pointer-events-auto inline-grid"
    >
      <span className={`${fade} group-hover/link:opacity-0`}>{children}</span>
      <span
        aria-hidden
        className={`${fade} opacity-0 group-hover/link:opacity-100`}
      >
        Show Fullscreen
      </span>
    </Link>
  );
}
