"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Counter from "@/components/Counter";
import {
  REVEAL_TRANSITION,
  QUICK_CLASS,
  FOLLOW_DELAY,
  DURATION,
} from "@/lib/motion";

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
                <ProjectLink href={titleHref}>{title}</ProjectLink>
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
              <ProjectLink href={titleHref}>{credited.text}</ProjectLink>
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

// The link to a project's page: hovering it brings in a single dot before
// the text, the size of the home cursor's (8px), opening its own room so the
// text slides right, and the text itself turns to "Show Fullscreen" — where
// the link goes. `bg-current` keeps the dot the text's colour, blend
// included.
const DOT_TRANSITION = {
  duration: DURATION.hover / 1000,
  ease: "easeOut",
} as const;

function ProjectLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={href} className="pointer-events-auto">
      <motion.span
        initial="rest"
        animate="rest"
        whileHover="hover"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="inline-flex items-center"
      >
        <motion.span
          aria-hidden
          variants={{
            rest: { width: 0, marginRight: 0, opacity: 0 },
            hover: { width: 8, marginRight: 6, opacity: 1 },
          }}
          transition={DOT_TRANSITION}
          className="h-2 shrink-0 rounded-full bg-current"
        />
        {hovered ? "Show Fullscreen" : children}
      </motion.span>
    </Link>
  );
}
