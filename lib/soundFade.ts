import { useLayoutEffect, type RefObject } from "react";

/** How long the sound takes to come up to full volume, in ms. */
export const SOUND_FADE_IN = 1800;
/** How long it takes to die away when turned off, in ms. */
export const SOUND_FADE_OUT = 900;

// iOS ignores `volume` (the hardware buttons own it): setting it does
// nothing. There, sound just switches on and off.
function canSetVolume(el: HTMLVideoElement) {
  const before = el.volume;
  el.volume = before === 0.5 ? 0.25 : 0.5;
  const works = el.volume !== before;
  el.volume = before;
  return works;
}

/**
 * A video's sound fades in when turned on and out when turned off, rather
 * than cutting. This owns the video's muting: render the <video> `muted`
 * (so it can autoplay) and leave it to this — React would otherwise mute it
 * the moment the prop changed, before any fade out.
 *
 * Volume follows a squared curve both ways: loudness is heard on a log
 * scale, so a linear ramp would seem to jump at the loud end.
 */
export function useSoundFade(
  video: RefObject<HTMLVideoElement | null>,
  muted: boolean,
  /** Changes when the video does (e.g. its src). */
  key?: unknown,
) {
  useLayoutEffect(() => {
    const el = video.current;
    if (!el) return;

    if (!canSetVolume(el)) {
      el.muted = muted;
      el.volume = 1;
      return;
    }
    // Already silent: nothing to fade.
    if (muted && el.muted) {
      el.volume = 0;
      return;
    }

    // From wherever it is now — a fade turned around midway picks up there.
    const from = el.muted ? 0 : el.volume;
    if (!muted) {
      el.volume = from;
      el.muted = false;
    }
    const duration = muted ? SOUND_FADE_OUT : SOUND_FADE_IN;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.volume = muted
        ? from * (1 - t) ** 2
        : from + (1 - from) * t * t;
      if (t < 1) frame = requestAnimationFrame(step);
      else if (muted) el.muted = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [video, muted, key]);
}
