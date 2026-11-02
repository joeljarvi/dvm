import { useSyncExternalStore } from "react";

function read() {
  if (typeof window === "undefined") return "";
  return decodeURIComponent(window.location.hash.replace(/^#/, ""));
}

export const getHash = read;

export function setHash(next: string) {
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
