"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { REVEAL_CLASS } from "@/lib/motion";
import { useSanityLoggedIn } from "@/lib/sanityUser";
import NameMark, { NAME_REVEAL_MS } from "@/components/NameMark";

export default function UnderConstruction({ active }: { active: boolean }) {
  const [dismissed, setDismissed] = useState(!active);

  useEffect(() => {
    setDismissed(!active);
  }, [active]);

  const [messageShown, setMessageShown] = useState(false);
  useEffect(() => {
    if (dismissed) return;
    const message = setTimeout(() => setMessageShown(true), NAME_REVEAL_MS);
    return () => clearTimeout(message);
  }, [dismissed]);

  const loggedIn = useSanityLoggedIn();

  return (
    <div
      aria-hidden={dismissed}
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
