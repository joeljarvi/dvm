"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "motion/react";
import { DURATION, REVEAL_CLASS, ms } from "@/lib/motion";
import { lastPointer } from "@/lib/pointer";

const WORD = "font-diatype text-[0.8rem] tracking-wide";

const FIRST_WORD = ms(300);
const PER_WORD = ms(400);
const WORDS = 6;

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

  still?: boolean;

  blue?: boolean;

  instant?: boolean;

  watermark?: boolean;
}) {
  const [shown, setShown] = useState(instant ? WORDS : 0);

  const tint = blue
    ? "text-blue-700"
    : "text-neutral-400 dark:text-neutral-500";

  const acrossY = useMotionValue(0);
  const downX = useMotionValue(0);

  const vonX = useMotionValue(0);
  const acrossRow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!watermark) return;
    const desktop = window.matchMedia("(min-width: 64rem)");

    const centre = () => {
      const half = (acrossRow.current?.offsetHeight ?? 0) / 2;
      acrossY.set(window.innerHeight * 0.625 + half);
      downX.set(0);
      vonX.set(window.innerWidth / 2);
    };
    const follow = (e: { clientX: number; clientY: number }) => {
      acrossY.set(e.clientY);
      downX.set(e.clientX - window.innerWidth / 2);
      vonX.set(e.clientX);
    };
    centre();

    const at = lastPointer();
    if (!still && at) follow({ clientX: at.x, clientY: at.y });
    desktop.addEventListener("change", centre);
    if (still) window.addEventListener("resize", centre);
    else {
      window.addEventListener("pointerdown", follow);
      window.addEventListener("pointermove", follow);
    }
    return () => {
      desktop.removeEventListener("change", centre);
      window.removeEventListener("resize", centre);
      window.removeEventListener("pointerdown", follow);
      window.removeEventListener("pointermove", follow);
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
          className={`pointer-events-none fixed inset-x-0 ${watermark ? "grid top-0 -translate-y-1/2" : "hidden lg:grid top-[62.5%]"} grid-cols-3 justify-center items-center h-min py-5.5 px-5.5 ${tint}`}
        >
          <p data-name-word data-across="start" className={word(1)}>
            Daniel
          </p>
          <p
            data-name-word
            className={word(2, `text-center ${watermark ? "invisible" : ""}`)}
          >
            von
          </p>
          <p data-name-word data-across="end" className={word(3, "text-right")}>
            Malmborg
          </p>
        </div>
      </motion.div>

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

      {watermark && (
        <motion.div
          style={{ x: vonX, y: acrossY }}
          className="pointer-events-none fixed top-0 left-0 z-924"
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
