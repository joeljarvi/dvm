"use client";

import { motion } from "motion/react";
import { useRegisterModal } from "@/lib/modalStack";
import { staggerContainer, REVEAL_CLASS } from "@/lib/motion";

export default function InfoOverlay({
  open,
  onDismiss,
  children,
  panelClassName = "inset-x-0 h-dvh",
  shadow = true,
}: {
  open: boolean;
  onDismiss: () => void;
  children: React.ReactNode;

  panelClassName?: string;

  shadow?: boolean;
}) {
  useRegisterModal(open, onDismiss);

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close"
        onClick={onDismiss}
        className={`absolute inset-0 bg-background/30 transition-opacity ${REVEAL_CLASS} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute ${panelClassName} bg-background/60 backdrop-blur-xs ${shadow ? "shadow-2xl" : ""} transition-opacity ${REVEAL_CLASS} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          aria-hidden
          className="noise-bg pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        />

        <motion.div
          data-lenis-prevent
          variants={staggerContainer}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          className="relative h-full w-full overflow-y-auto overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
