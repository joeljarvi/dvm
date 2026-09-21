import type { Transition, Variants } from "motion/react";

// The one duration + easing curve every reveal/entrance animation on the
// site shares — panel and overlay fades, the drawer's stagger, InfoLayout's
// title swap. Quick hover/color micro-interactions are their own thing and
// keep their own (faster) timing.
export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
export const REVEAL_DURATION = 0.7;
export const REVEAL_TRANSITION: Transition = {
  duration: REVEAL_DURATION,
  ease: REVEAL_EASE,
};

// Same curve, as Tailwind classes, for reveals styled with CSS transitions
// rather than driven by motion.
export const REVEAL_CLASS = "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";

// A drawer's content staggering in: each item 60ms behind the last, all
// using the shared reveal transition — replaces the old .reveal-stagger CSS
// (nth-child delays) in globals.css. Apply `staggerContainer` to the
// animating ancestor (`initial="hidden"`, `animate={open ? "visible" :
// "hidden"}`) and `staggerItem` to whichever descendants should reveal —
// variants propagate through plain elements in between, so nothing between
// the two needs to be a motion component itself.
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, transition: REVEAL_TRANSITION },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};
