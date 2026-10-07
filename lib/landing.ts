import { useEffect, useSyncExternalStore } from "react";
import { DURATION, ms } from "./motion";

// Home's landing reveal, before a section is picked: the landing prompt's
// words come in one at a time, then both panels' covers together. Shared
// here so anything outside the page can follow the same timeline.
//
// Beats are ms from the home page's first mount, each advancing the step by
// one — one per word of the landing prompt (see LandingPrompt), then the
// covers, then `done` once the covers' entrance has finished. Like the
// intro, it plays once per page load — coming back home finds it already
// spent.
const FIRST_WORD = 600;
const PER_WORD = 800;
const COVERS_AFTER = 1400;

let words = 0;
let step = 0;
let started = false;
const listeners = new Set<() => void>();

/** Starts the timeline for a prompt of `wordCount` words. Called by the home
 * page on mount; a no-op after the first time. */
export function startLanding(wordCount: number) {
  if (started) return;
  started = true;
  words = wordCount;
  const beats = Array.from(
    { length: wordCount },
    (_, i) => FIRST_WORD + PER_WORD * i,
  );
  beats.push((beats.at(-1) ?? FIRST_WORD - PER_WORD) + COVERS_AFTER);
  const scaled = beats.map(ms);
  scaled.push(scaled.at(-1)! + DURATION.entrance);
  scaled.forEach((at, i) =>
    setTimeout(() => {
      step = i + 1;
      listeners.forEach((l) => l());
    }, at),
  );
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useLanding() {
  const s = useSyncExternalStore(
    subscribe,
    () => step,
    () => 0,
  );
  return {
    words: Math.min(s, words),
    images: started && s > words,
    done: started && s > words + 1,
  };
}

/** Starts the landing timeline on mount and returns its state. */
export function useLandingReveal(wordCount: number) {
  useEffect(() => startLanding(wordCount), [wordCount]);
  return useLanding();
}
