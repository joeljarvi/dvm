"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useIntro } from "@/lib/intro";

const ease = [0.4, 0, 0.2, 1] as const;

// The wordmark once it lives in the nav: the full name at all times on
// desktop, and on mobile a breadcrumb for wherever you are. It only comes in
// after the loader has cleared, so it never plays the reveal itself.
export default function Breadcrumb({ crumb }: { crumb: string | null }) {
  const { settled } = useIntro();

  return (
    <Button
      asChild
      aria-label="Daniel von Malmborg — home"
      className={`pointer-events-auto gap-0 text-background transition-opacity duration-700 ease-out ${
        settled ? "" : "opacity-0 pointer-events-none"
      }`}
    >
      <Link href="/">
        {/* Desktop keeps the name permanently. */}

        {/* Mobile trades it for the breadcrumb wherever there is one. */}
        <span className="flex items-center lg:hidden">
          <AnimatePresence mode="wait" initial={false}>
            {crumb ? (
              <motion.span
                key={crumb}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease }}
              >
                {crumb}
              </motion.span>
            ) : (
              <motion.span
                key="name"
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease }}
              >
                <Name />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </Link>
    </Button>
  );
}
