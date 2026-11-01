import { useSyncExternalStore } from "react";

// Whether the pointer can hover — false on touch screens (phones, tablets).
// Hover-only behaviour has to fall back there; smooth scrolling (Lenis) is
// left off there too, for the device's own scrolling. Assumes hover before
// hydration (the server can't know).
const HOVER_QUERY = "(hover: hover)";

export function useCanHover() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(HOVER_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    () => true,
  );
}
