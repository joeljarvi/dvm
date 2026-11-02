import type { CSSProperties } from "react";
import type { Transition, Variants } from "motion/react";

export const MOTION_SPEED = 1;

export const ms = (n: number) => Math.round(n * MOTION_SPEED);

export const DURATION = {
  micro: ms(150),

  hover: ms(200),

  quick: ms(300),

  fade: ms(500),

  reveal: ms(700),

  entrance: ms(1000),

  select: ms(850),

  selectDesktop: ms(620),

  switch: ms(550),

  coverStep: ms(290),

  homeSlide: ms(950),
} as const;

export const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export const SELECT_EASE = [0.45, 0, 0.15, 1] as const;

export const SELECT_EASE_DESKTOP = [0.39, 0, 0.15, 1] as const;

export const SWITCH_EASE = [0.33, 0, 0.15, 1] as const;
const cubic = (c: readonly number[]) => `cubic-bezier(${c.join(",")})`;

export const motionCssVars = {
  "--default-transition-duration": `${DURATION.micro}ms`,
  "--motion-micro": `${DURATION.micro}ms`,
  "--motion-hover": `${DURATION.hover}ms`,
  "--motion-quick": `${DURATION.quick}ms`,
  "--motion-fade": `${DURATION.fade}ms`,
  "--motion-reveal": `${DURATION.reveal}ms`,
  "--motion-entrance": `${DURATION.entrance}ms`,
  "--motion-select": `${DURATION.select}ms`,
  "--motion-select-desktop": `${DURATION.selectDesktop}ms`,
  "--motion-switch": `${DURATION.switch}ms`,
  "--motion-cover-step": `${DURATION.coverStep}ms`,
  "--motion-home-slide": `${DURATION.homeSlide}ms`,
  "--motion-ease-reveal": cubic(REVEAL_EASE),
  "--motion-ease-select": cubic(SELECT_EASE),
  "--motion-ease-select-desktop": cubic(SELECT_EASE_DESKTOP),
  "--motion-ease-switch": cubic(SWITCH_EASE),
} as CSSProperties;

export const REVEAL_CLASS =
  "duration-(--motion-reveal) ease-(--motion-ease-reveal)";

export const ENTRANCE_CLASS =
  "duration-(--motion-entrance) ease-(--motion-ease-reveal)";

export const SELECT_CLASS =
  "duration-(--motion-select) ease-(--motion-ease-select) lg:duration-(--motion-select-desktop) lg:ease-(--motion-ease-select-desktop)";
export const SWITCH_CLASS =
  "duration-(--motion-switch) ease-(--motion-ease-switch)";

export const AFTER_SELECT =
  "delay-(--motion-home-slide) lg:delay-[calc(var(--motion-cover-step)_+_var(--motion-select-desktop))]";

export const AFTER_SWITCH = "delay-(--motion-switch)";

export const HOVER_CLASS = "duration-(--motion-hover) ease-out";
export const QUICK_CLASS = "duration-(--motion-quick) ease-out";
export const FADE_CLASS = "duration-(--motion-fade) ease-out";

const s = (msValue: number) => msValue / 1000;

export const REVEAL_DURATION = s(DURATION.reveal);
export const REVEAL_TRANSITION: Transition = {
  duration: REVEAL_DURATION,
  ease: REVEAL_EASE,
};

export const STAGGER = s(ms(60));

export const FOLLOW_DELAY = s(ms(80));

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER },
  },
};

export const fadeItem: Variants = {
  hidden: { opacity: 0, transition: REVEAL_TRANSITION },
  visible: { opacity: 1, transition: REVEAL_TRANSITION },
};

export const slideReveal: Variants = {
  hidden: { opacity: 0, y: 24, transition: REVEAL_TRANSITION },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};
