"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { DURATION, REVEAL_CLASS, ms } from "@/lib/motion";
import { lastPointer } from "@/lib/watermarkCursor";

// "Daniel von Malmborg" spread around the screen: across it at the landing
// prompt's height (see LandingPrompt), and turned on its side down its full
// height. Shared by the maintenance gate and the 404.
//
// Reveals word by word while `play` is on — across first, then down.
//
// As a watermark on desktop, the names cross at the cursor: the across name
// slides up and down with it, the turned one side to side, and the across
// name's "von" leaves its line to sit where they meet, as the cursor's tip.
// Each block sits in its own full-screen layer that does the moving — the
// turned block's own rotate/translate stay untouched.
const WORD = "font-diatype text-[0.8rem] tracking-wide";

const FIRST_WORD = ms(300);
const PER_WORD = ms(400);
const WORDS = 6;

/** ms from `play` until the last word has fully faded in. */
export const NAME_REVEAL_MS =
  FIRST_WORD + PER_WORD * (WORDS - 1) + DURATION.reveal;

export default function NameMark({
  play = true,
  watermark = false,
  still = false,
  blue = false,
  instant = false,
}: {
  play?: boolean;
  /** Watermark held at its starting position instead of following. */
  still?: boolean;
  /** Blue instead of grey. */
  blue?: boolean;
  /** All words up at once — no word-by-word reveal. */
  instant?: boolean;
  /** Over a full-screen image: the horizontal name shows on mobile too,
   * and on desktop both follow the cursor. */
  watermark?: boolean;
}) {
  const [shown, setShown] = useState(instant ? WORDS : 0);

  // As a watermark, blue while the pointer is pressed.
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!watermark) return;
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [watermark]);
  const tint =
    blue || pressed
      ? "text-blue-700"
      : "text-neutral-400 dark:text-neutral-500";

  const acrossY = useMotionValue(0);
  const downX = useMotionValue(0);
  // Where the two lines cross — the one "von", the cursor's tip.
  const vonX = useMotionValue(0);
  const acrossRow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!watermark) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    // The starting (and Static) position: the across name where it sits
    // elsewhere — its top at 62.5% — and the turned one centred. acrossY
    // places the across row by its middle, hence the half height.
    const centre = () => {
      const half = (acrossRow.current?.offsetHeight ?? 0) / 2;
      acrossY.set(desktop.matches ? window.innerHeight * 0.625 + half : 0);
      downX.set(0);
      vonX.set(window.innerWidth / 2);
    };
    const onMove = (e: PointerEvent) => {
      if (!desktop.matches) return;
      acrossY.set(e.clientY);
      downX.set(e.clientX - window.innerWidth / 2);
      vonX.set(e.clientX);
    };
    centre();
    // Following: open on the pointer if it's already been somewhere.
    const at = lastPointer();
    if (!still && at && desktop.matches) {
      acrossY.set(at.y);
      downX.set(at.x - window.innerWidth / 2);
      vonX.set(at.x);
    }
    desktop.addEventListener("change", centre);
    if (still) window.addEventListener("resize", centre);
    else window.addEventListener("pointermove", onMove);
    return () => {
      desktop.removeEventListener("change", centre);
      window.removeEventListener("resize", centre);
      window.removeEventListener("pointermove", onMove);
    };
  }, [watermark, still, acrossY, downX, vonX]);

  useEffect(() => {
    if (!play || instant) return;
    const timers = Array.from({ length: WORDS }, (_, i) =>
      setTimeout(() => setShown(i + 1), FIRST_WORD + PER_WORD * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [play, instant]);

  const word = (n: number, extra = "") =>
    `${WORD} ${extra} transition-opacity ${REVEAL_CLASS} ${
      shown >= n ? "opacity-100" : "opacity-0"
    }`;

  return (
    <>
      <motion.div
        style={{ y: acrossY }}
        className="pointer-events-none fixed inset-0 z-923"
      >
        <div
          ref={acrossRow}
          className={`pointer-events-none fixed inset-x-0 top-[62.5%] ${watermark ? "grid lg:top-0 lg:-translate-y-1/2" : "hidden lg:grid"} grid-cols-3 justify-center items-center h-min py-5.5 px-5.5 ${tint}`}
        >
          <p data-name-word className={word(1)}>
            Daniel
          </p>
          <p
            data-name-word
            className={word(
              2,
              `text-center ${watermark ? "lg:invisible" : ""}`,
            )}
          >
            von
          </p>
          <p data-name-word className={word(3, "text-right")}>
            Malmborg
          </p>
        </div>
      </motion.div>
      {/* Turned to read top to bottom: laid out as a row the screen's
          height long, then rotated about its top-left corner and shifted
          back across, so it covers the screen exactly with "Daniel" at the
          top. */}
      <motion.div
        style={{ x: downX }}
        className="pointer-events-none fixed inset-0 z-922"
      >
        <div
          data-turned
          className={`pointer-events-none fixed top-0 left-0 w-[100dvh] h-[100dvw] origin-top-left rotate-90 translate-x-[100dvw] ${watermark ? "flex lg:grid lg:grid-cols-3" : "flex"} flex-row justify-between items-center px-5.5 py-5.5 ${tint}`}
        >
          <p data-name-word className={word(4)}>
            Daniel
          </p>
          <p data-name-word className={word(5, "text-center")}>
            von
          </p>
          <p data-name-word className={word(6, "text-right")}>
            Malmborg
          </p>
        </div>
      </motion.div>
      {/* As a watermark on desktop, the across line's "von" — held out of
          the row above — sits where the lines cross, centred on the
          pointer: its tip. */}
      {watermark && (
        <motion.div
          style={{ x: vonX, y: acrossY }}
          className="hidden lg:block pointer-events-none fixed top-0 left-0 z-924"
        >
          <p
            data-name-word
            className={word(
              2,
              `whitespace-nowrap -translate-x-1/2 -translate-y-1/2 ${tint}`,
            )}
          >
            von
          </p>
        </motion.div>
      )}
    </>
  );
}
