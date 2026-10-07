"use client";

import { motion } from "motion/react";
import { useRegisterModal } from "@/lib/modalStack";
import { REVEAL_CLASS, slideReveal } from "@/lib/motion";

// What a click inside the panel may land on without closing it: the
// controls, and the lists' rows (a row's padding included).
const KEEPS_OPEN = "a, button, input, textarea, select, label, li";

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

  // Anywhere else in the panel closes it, like the backdrop does — unless
  // the click finished selecting some text.
  const dismissOnEmptyClick = (e: React.MouseEvent) => {
    if ((e.target as Element).closest(KEEPS_OPEN)) return;
    if (window.getSelection()?.toString()) return;
    onDismiss();
  };

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      // A closed drawer stays mounted (it fades out), so it must not catch
      // anything: `pointer-events-none` alone is overridden by any
      // `pointer-events-auto` inside it — e.g. Index's Selected / Show All,
      // which sat right on top of About's Bio / Links. `inert` covers the
      // whole subtree, focus included.
      inert={!open}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close"
        onClick={onDismiss}
        className={`absolute inset-0 bg-background/30 dark:bg-background/70 transition-opacity ${REVEAL_CLASS} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        onClick={dismissOnEmptyClick}
        className={`absolute ${panelClassName} bg-background/60 dark:bg-background/70 backdrop-blur-xs ${shadow ? "shadow-2xl" : ""} transition-opacity ${REVEAL_CLASS} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <motion.div
          data-lenis-prevent
          variants={slideReveal}
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
