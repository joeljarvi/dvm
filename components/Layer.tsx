"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useRegisterModal } from "@/lib/modalStack";

const ease = [0.4, 0, 0.2, 1] as const;

// Inset per depth so each layer reveals the one beneath it around its edges.
const INSET: Record<number, string> = {
  1: "top-2 lg:top-8 inset-x-2 lg:inset-x-2 bottom-10  lg:bottom-8 ",
  2: " top-4 lg:top-12 inset-x-4 lg:inset-x-6 bottom-12 lg:bottom-12 ",
  3: "top-6 lg:top-16 inset-x-6 lg:inset-x-10 bottom-14 lg:bottom-16 ",
  4: "top-8 lg:top-20 inset-x-8 lg:inset-x-14 bottom-16 lg:bottom-20 ",
};

const Z: Record<number, string> = {
  1: "z-30",
  2: "z-40",
  3: "z-45",
  4: "z-50",
};

// A modal layer: a full-screen click-catcher (keeps the layer behind visible,
// closes on click) plus an inset card. Closing calls router.back(); the shared
// close button (CloseButton) closes the topmost layer via the modal stack.
export default function Layer({
  level = 1,
  children,
}: {
  level?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useRegisterModal(true, () => router.back());

  return (
    <div className={`fixed inset-0 ${Z[level]}`}>
      {/* transparent catcher — the layer below stays visible, click to close */}
      <div
        className="absolute inset-0 bg-black/10"
        onClick={() => router.back()}
      />

      {/* inset card */}
      <motion.div
        className={`absolute ${INSET[level]} overflow-hidden shadow-2xl`}
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
