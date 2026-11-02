import { useEffect, useSyncExternalStore } from "react";
import { DURATION, ms } from "./motion";

const FIRST_WORD = 600;
const PER_WORD = 800;
const COVERS_AFTER = 1400;

let words = 0;
let step = 0;
let started = false;
const listeners = new Set<() => void>();

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

export function useLandingReveal(wordCount: number) {
  useEffect(() => startLanding(wordCount), [wordCount]);
  return useLanding();
}
