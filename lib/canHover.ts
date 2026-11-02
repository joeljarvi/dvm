import { useSyncExternalStore } from "react";

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
