"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { REVEAL_CLASS } from "@/lib/motion";

// The maintenance gate — driven by the "Under Construction" toggle in
// Sanity's Site Settings singleton (see sanity/schemas/settings.ts).
// Styled and animated identically to SectionOverlay: always mounted, a
// plain opacity/pointer-events toggle on the same transition, just a
// higher z-index so it sits above both SectionOverlays and the InfoOverlay
// drawers.
export default function UnderConstruction({ active }: { active: boolean }) {
  const [dismissed, setDismissed] = useState(!active);

  // The Sanity flag is the source of truth — if it flips on again (or a
  // different visit loads with it already on), re-show the gate rather
  // than keeping a stale dismissal from a previous render.
  useEffect(() => {
    setDismissed(!active);
  }, [active]);

  return (
    <div
      aria-hidden={dismissed}
      className={`fixed z-920 inset-0 bg-background/700 backdrop-blur-xs transition-opacity ${REVEAL_CLASS} flex flex-col gap-y-4 items-center justify-center ${
        dismissed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <Button
        variant="link"
        size="sm"
        className="absolute top-0 right-0 hover:text-blue-700"
        onClick={() => setDismissed(true)}
      >
        Close
      </Button>

      <p className="font-diatype text-[0.8rem] tracking-wide text-neutral-400 px-5.5 text-center max-w-md">
        This site is currently undergoing some maintanence...{" "}
      </p>
      <p className="font-diatype text-[0.8rem] tracking-wide text-neutral-400 px-5.5 text-center max-w-md">
        {" "}
        Meanwhile, say hi to Daniel at <br />
        <Link
          className="underline underline-offset-4 decoration-dotted hover:decoration-blue-700 hover:text-blue-700"
          href="mailto:daniel@danielvonmalmborg.com"
        >
          daniel@danielvonmalmborg.com
        </Link>{" "}
        or visit his{" "}
        <Link
          className=" underline underline-offset-4 decoration-dotted hover:decoration-blue-700 hover:text-blue-700"
          href="https://www.instagram.com/daniel.external/"
        >
          Instagram
        </Link>
      </p>
    </div>
  );
}
