"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useRegisterModal } from "@/lib/modalStack";

const ease = [0.4, 0, 0.2, 1] as const;

// Three depths, inset further each time so every layer reveals the one beneath
// it around its edges: 1 browses a category, 2 is a project, 3 is an overlay.
const INSET: Record<number, string> = {
  1: "w-full h-dvh ",
  2: "w-full h-dvh ",
  3: "w-full h-dvh ",
};

const Z: Record<number, string> = {
  1: "z-50",
  2: "z-60",
  3: "z-70",
};

// A modal layer: a full-screen click-catcher (keeps the layer behind visible,
// closes on click) plus an inset card. Closing calls router.back(); the shared
// close button in the nav closes the topmost layer via the modal stack.
export default function Layer({
  level = 1,
  closeLabel = "Back",
  children,
}: {
  level?: 1 | 2 | 3;
  // What the nav's shared button calls itself while this layer is on top.
  closeLabel?: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useRegisterModal(true, () => router.back(), closeLabel);

  return (
    <div className={`fixed inset-0 ${Z[level]}`}>
      {/* transparent catcher — the layer below stays visible, click to close */}
      <div
        className="absolute inset-0 bg-black/10"
        onClick={() => router.back()}
      />

      {/* inset card */}
      <motion.div
        className={`absolute ${INSET[level]} overflow-hidden`}
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.5, ease }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </div>
  );
}
