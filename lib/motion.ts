import type { CSSProperties } from "react";
import type { Transition, Variants } from "motion/react";

// Every animation timing on the site lives here. Nothing elsewhere should
// hard-code a duration, delay or curve — CSS transitions read these through
// the custom properties the root layout writes onto <html> (`motionCssVars`
// below), and JS (motion, timers, the intro and landing timelines) reads the
// constants directly. So the two can't drift apart.

/**
 * Global tempo. Every duration, delay and timeline beat is multiplied by it:
 * 1.25 plays the whole site a quarter slower, 0.8 a fifth faster.
 */
export const MOTION_SPEED = 1;

/** Scales a millisecond value by MOTION_SPEED. For timelines and timers. */
export const ms = (n: number) => Math.round(n * MOTION_SPEED);

// Durations, in ms, from the briskest feedback up to the slow entrances.
export const DURATION = {
  /** Tailwind's default for a bare `transition-*` — cursor fills, buttons. */
  micro: ms(150),
  /** Hover colour changes. */
  hover: ms(200),
  /** Short fades: a label's initial, InfoLayout's title colour. */
  quick: ms(300),
  /** The wordmark's lettering and glyphs. */
  fade: ms(500),
  /** The site's main reveal — panels, overlays, drawers, nav. */
  reveal: ms(700),
  /** Larger entrances, e.g. the home covers landing. */
  entrance: ms(1000),
  /** Home: picking Personal or Commissioned out of landing mode. */
  select: ms(1000),
  /** Home: swapping straight from one open column to the other. */
  switch: ms(450),
} as const;

// Curves.
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
/** Eases in as well as out, so a column growing across the screen never
 * lurches off the mark — only a soft start, then the long settle. */
export const SELECT_EASE = [0.45, 0, 0.15, 1] as const;
/** The same shape, tighter, for the brief column swap. */
export const SWITCH_EASE = [0.33, 0, 0.15, 1] as const;
const cubic = (c: readonly number[]) => `cubic-bezier(${c.join(",")})`;

// Written onto <html> by app/layout.tsx. `--default-transition-duration` is
// Tailwind's own, so every bare `transition-*` follows the tempo too.
export const motionCssVars = {
  "--default-transition-duration": `${DURATION.micro}ms`,
  "--motion-micro": `${DURATION.micro}ms`,
  "--motion-hover": `${DURATION.hover}ms`,
  "--motion-quick": `${DURATION.quick}ms`,
  "--motion-fade": `${DURATION.fade}ms`,
  "--motion-reveal": `${DURATION.reveal}ms`,
  "--motion-entrance": `${DURATION.entrance}ms`,
  "--motion-select": `${DURATION.select}ms`,
  "--motion-switch": `${DURATION.switch}ms`,
  "--motion-ease-reveal": cubic(REVEAL_EASE),
  "--motion-ease-select": cubic(SELECT_EASE),
  "--motion-ease-switch": cubic(SWITCH_EASE),
} as CSSProperties;

// Tailwind class sets. Pair with a `transition-*` property class.
/** The main reveal: duration + curve. */
export const REVEAL_CLASS =
  "duration-(--motion-reveal) ease-(--motion-ease-reveal)";
/** A slower entrance on the reveal curve. */
export const ENTRANCE_CLASS =
  "duration-(--motion-entrance) ease-(--motion-ease-reveal)";
/** Home's columns: choosing one out of landing mode, and swapping between
 * the two once one's open (see HomeClient). */
export const SELECT_CLASS =
  "duration-(--motion-select) ease-(--motion-ease-select)";
export const SWITCH_CLASS =
  "duration-(--motion-switch) ease-(--motion-ease-switch)";
/** Hover colour changes and other quick feedback. */
export const HOVER_CLASS = "duration-(--motion-hover) ease-out";
export const QUICK_CLASS = "duration-(--motion-quick) ease-out";
export const FADE_CLASS = "duration-(--motion-fade) ease-out";

// motion (framer) takes seconds.
const s = (msValue: number) => msValue / 1000;

/** The main reveal, in seconds — for motion transitions and for timers that
 * wait on a CSS reveal to finish. */
export const REVEAL_DURATION = s(DURATION.reveal);
export const REVEAL_TRANSITION: Transition = {
  duration: REVEAL_DURATION,
  ease: REVEAL_EASE,
};

/** Gap between items that stagger in. */
export const STAGGER = s(ms(60));
/** Offset of a secondary line behind the first (InfoLayout's agency). */
export const FOLLOW_DELAY = s(ms(80));

/** How long the pointer rests before the watermark cursor fades out, in ms. */
export const CURSOR_IDLE = ms(3000);
/** About's image (desktop): how long each blurred and sharp spell lasts. */
export const ABOUT_BLUR_CYCLE = ms(3000);

// A drawer's content staggering in: each item STAGGER behind the last, all
// using the shared reveal transition. Apply `staggerContainer` to the
// animating ancestor (`initial="hidden"`, `animate={open ? "visible" :
// "hidden"}`) and `fadeItem` to whichever descendants should reveal —
// variants propagate through plain elements in between, so nothing between
// the two needs to be a motion component itself.
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER },
  },
};

// Opacity only — content swapping in place, where a slide would read as
// movement rather than a reveal.
export const fadeItem: Variants = {
  hidden: { opacity: 0, transition: REVEAL_TRANSITION },
  visible: { opacity: 1, transition: REVEAL_TRANSITION },
};

// A drawer's content as one block — slides up from below into place on
// reveal, and back down on exit (the same pair of states, just played in
// each direction). No per-item stagger, unlike fadeItem above.
export const slideReveal: Variants = {
  hidden: { opacity: 0, y: 24, transition: REVEAL_TRANSITION },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};
