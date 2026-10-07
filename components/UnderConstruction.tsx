"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { REVEAL_CLASS } from "@/lib/motion";
import { useSanityLoggedIn } from "@/lib/sanityUser";
import NameMark, { NAME_REVEAL_MS } from "@/components/NameMark";

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

  // The name comes in word by word (see NameMark); the message once it's in.
  const [messageShown, setMessageShown] = useState(false);
  useEffect(() => {
    if (dismissed) return;
    const message = setTimeout(() => setMessageShown(true), NAME_REVEAL_MS);
    return () => clearTimeout(message);
  }, [dismissed]);

  // Only editors logged in to the Studio get to see past the gate.
  const loggedIn = useSanityLoggedIn();


  return (
    <div
      aria-hidden={dismissed}
      // Faded out, but still there — and out of reach, links and all.
      inert={dismissed}
      className={`fixed z-920 h-screen inset-0 bg-background backdrop-blur-xs transition-opacity ${REVEAL_CLASS} flex flex-col gap-y-4 items-center justify-center ${
        dismissed ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {loggedIn && (
        <Button
          variant="link"
          size="sm"
          className="absolute top-0 right-0 hover:text-blue-700"
          onClick={() => setDismissed(true)}
        >
          Close
        </Button>
      )}
      <NameMark play={!dismissed} />

      <p
        className={`absolute top-[62.5%] font-diatype text-[0.8rem] tracking-wide text-blue-700 px-12 lg:px-5.5 text-center max-w-6xl transition-opacity ${REVEAL_CLASS} ${messageShown ? "opacity-100" : "opacity-0"}`}
      >
        This site is currently undergoing some maintanence... <br />
        Meanwhile, say hi to Daniel at{" "}
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
