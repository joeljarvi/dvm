"use client";

import { motion } from "motion/react";

const container = {
  hidden: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 },
  },
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function PanelClient({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-dvh">
      <motion.div
        className="flex gap-2 h-[25vh]"
        variants={container}
        initial="hidden"
        animate={isOpen ? "show" : "hidden"}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            className="aspect-3/4 h-full bg-neutral-200"
            variants={item}
          />
        ))}
      </motion.div>
    </div>
  );
}
