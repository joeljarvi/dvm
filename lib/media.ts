import { useSyncExternalStore } from "react";

// Tailwind's `lg`. Kept in JS because Lenis needs its orientation as an
// option, not a class — a media query alone cannot switch a scroll axis.
const LG = "(min-width: 64rem)";

const query = () =>
  typeof window === "undefined" ? null : window.matchMedia(LG);

function subscribe(l: () => void) {
  const mq = query();
  mq?.addEventListener("change", l);
  return () => mq?.removeEventListener("change", l);
}

/** True from the `lg` breakpoint up. False on the server and first paint. */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => query()?.matches ?? false,
    () => false,
  );
}
