import { useSyncExternalStore } from "react";

// The opening sequence, in one place. The card writes the name a word at a
// time; the plates behind D, v and M fade up under it, and the card with them;
// the card's own lines then stagger in while the name fades away; and only
// then does the site behind it arrive.
//
// Beats are ms from first paint, and each one advances `phase` by a single
// step — so the order of this list is the order of the sequence, and inserting
// a beat shifts everything downstream with it.
const WORDS = [200, 650, 1100]; // Daniel / von / Malmborg, one at a time
const PLATES = 1700; // the plates behind the initials, and the card around them
const CROSS = 2400; // the card's own rows come in as the name goes out
const CROSS_STAGGER = 220;
const ARRIVE = 3300; // the site behind the card fades up
const SETTLE = ARRIVE + 700;
const STAGGER = 160;

/** Rows of the card's own copy, one beat apart. */
export const CARD_ROWS = 2;

// Everything that comes in behind the card — the home panels' images and
// labels, the section buttons in the nav — takes one of these slots in order.
export const STAGGER_SLOTS = 4;

const BEATS = [
  ...WORDS,
  PLATES,
  ...Array.from({ length: CARD_ROWS }, (_, i) => CROSS + i * CROSS_STAGGER),
  ARRIVE,
  SETTLE,
  ...Array.from(
    { length: STAGGER_SLOTS },
    (_, i) => SETTLE + (i + 1) * STAGGER,
  ),
];

// Phase boundaries, derived from the list above so they can't drift from it.
const PLATED = WORDS.length + 1;
const CROSSED = PLATED + 1;
const ARRIVED = PLATED + CARD_ROWS + 1;
const SETTLED = ARRIVED + 1;

// Kept in a module-level store rather than component state so the intro plays
// once per page load: navigating back to a view that animates in finds the
// timeline already spent and renders it settled, with no replay.
let phase = 0;
let running = false;
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  if (!running) {
    running = true;
    BEATS.forEach((at, i) =>
      setTimeout(() => {
        phase = i + 1;
        listeners.forEach((fn) => fn());
      }, at),
    );
  }
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const getSnapshot = () => phase;
const getServerSnapshot = () => 0;

export function useIntro() {
  const phase = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    /** How many words of the name have been written. */
    words: Math.min(phase, WORDS.length),
    /** The plates behind D, v and M are up — and the card with them. */
    plated: phase >= PLATED,
    /** How many of the card's own rows have come in. */
    rows: Math.max(0, Math.min(phase - PLATED, CARD_ROWS)),
    /** The name is handing the card over to those rows. */
    faded: phase >= CROSSED,
    /** The site behind the card can fade up. */
    arrived: phase >= ARRIVED,
    /** Everything has landed; the chrome is interactive. */
    settled: phase >= SETTLED,
    /** How many staggered slots have come up. Slot `i` shows at `> i`. */
    staggered: Math.max(0, phase - SETTLED),
  };
}
