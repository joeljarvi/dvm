import { useLayoutEffect, type RefObject } from "react";

/** How long the sound takes to come up to full volume, in ms. */
export const SOUND_FADE_IN = 1800;

/**
 * Turning a video's sound on fades it in rather than cutting it in. While
 * muted, its volume is held at 0, so unmuting starts from silence; then it
 * eases up to full. Muting is immediate.
 *
 * iOS ignores `volume` (the hardware buttons own it), so there the sound
 * still comes straight in.
 */
export function useSoundFadeIn(
  video: RefObject<HTMLVideoElement | null>,
  muted: boolean,
  /** Changes when the video does (e.g. its src), to start over from 0. */
  key?: unknown,
) {
  useLayoutEffect(() => {
    const el = video.current;
    if (!el) return;
    if (muted) {
      el.volume = 0;
      return;
    }
    el.volume = 0;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / SOUND_FADE_IN, 1);
      // Ease-in: loudness is heard on a log scale, so a linear ramp would
      // seem to jump at the start and crawl at the end.
      el.volume = t * t;
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [video, muted, key]);
}
