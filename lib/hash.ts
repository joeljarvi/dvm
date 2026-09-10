import { useSyncExternalStore } from "react";

// The URL hash, read as a plain word — `#about` reads as `about`. The nav
// renders in the layout and the home columns in the page, so the hash is what
// they share: a click on either sets it, and whoever cares reads it here.
// Next's router only syncs pathname and search, so the hash needs its own
// listener — `hashchange` for our own writes, `popstate` for the back button.
function read() {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#/, ""));
}

// pushState rather than assigning `location.hash`, so an empty value clears the
// `#` from the bar instead of leaving a bare one — then a manual `hashchange`,
// since pushState fires none.
export function setHash(next: string) {
  // Covers bubble their click up to the column, which lands here on every
  // image step — so a no-op write must stay a no-op rather than stack a
  // history entry each time.
  if (next === read()) return;
  const { pathname, search } = window.location;
  const url = next ? `${pathname}${search}#${next}` : `${pathname}${search}`;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new Event("hashchange"));
}

function subscribe(l: () => void) {
  window.addEventListener("hashchange", l);
  window.addEventListener("popstate", l);
  return () => {
    window.removeEventListener("hashchange", l);
    window.removeEventListener("popstate", l);
  };
}

export function useHash() {
  return useSyncExternalStore(subscribe, read, () => "");
}
