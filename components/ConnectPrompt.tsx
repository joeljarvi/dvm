"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REVEAL_CLASS } from "@/lib/motion";
import { setHash } from "@/lib/hash";

// How often it comes up while the visitor is scrolling, and for how long.
const EVERY_MS = 10_000;
const SHOWN_MS = 6_000;

/**
 * Home, a section open: while the visitor scrolls through the work, a
 * "Connect" link fades in at the top of column 2 every ten seconds, then out
 * again; it opens the About overlay. Held up while it's hovered or focused, so it never fades out from
 * under the pointer.
 */
export default function ConnectPrompt({ active }: { active: boolean }) {
  const [shown, setShown] = useState(false);
  const held = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hideSoon = (after: number) => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!held.current) setShown(false);
    }, after);
  };

  useEffect(() => {
    if (!active) return;
    // When the visitor last scrolled — wheel, touch or the keys.
    let lastScroll = 0;
    const scrolled = () => (lastScroll = Date.now());
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", " ", "PageUp", "PageDown"].includes(e.key))
        scrolled();
    };
    window.addEventListener("wheel", scrolled, { passive: true });
    window.addEventListener("touchmove", scrolled, { passive: true });
    window.addEventListener("keydown", onKey);

    const tick = setInterval(() => {
      if (Date.now() - lastScroll > EVERY_MS) return;
      setShown(true);
      hideSoon(SHOWN_MS);
    }, EVERY_MS);

    return () => {
      window.removeEventListener("wheel", scrolled);
      window.removeEventListener("touchmove", scrolled);
      window.removeEventListener("keydown", onKey);
      clearInterval(tick);
      clearTimeout(hideTimer.current);
      setShown(false);
    };
  }, [active]);

  const hold = () => {
    held.current = true;
  };
  const release = () => {
    held.current = false;
    hideSoon(SHOWN_MS / 2);
  };

  return (
    <div
      inert={!shown}
      className={`fixed top-0 left-1/4 z-80 h-14 flex items-center transition-opacity ${REVEAL_CLASS} ${
        shown ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocus={hold}
      onBlur={release}
    >
      <Button
        variant="link"
        size="sm"
        asChild
        className="text-blue-700 hover:text-blue-700 dark:text-blue-700 dark:hover:text-blue-700"
      >
        {/* Opens the About overlay, where the Connect links are. The href
            stays /connect, the page of its own — for crawlers, and for a
            new tab or a copied link. */}
        <Link
          href="/connect"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            setHash("about");
          }}
        >
          Connect
        </Link>
      </Button>
    </div>
  );
}
