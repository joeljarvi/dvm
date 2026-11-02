import { useLayoutEffect, type RefObject } from "react";

export const SOUND_FADE_IN = 1800;

export const SOUND_FADE_OUT = 900;

function canSetVolume(el: HTMLVideoElement) {
  const before = el.volume;
  el.volume = before === 0.5 ? 0.25 : 0.5;
  const works = el.volume !== before;
  el.volume = before;
  return works;
}

export function useSoundFade(
  video: RefObject<HTMLVideoElement | null>,
  muted: boolean,

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

    if (muted && el.muted) {
      el.volume = 0;
      return;
    }

    const from = el.muted ? 0 : el.volume;
    if (!muted) {
      el.volume = from;
      el.muted = false;
    }
    const duration = muted ? SOUND_FADE_OUT : SOUND_FADE_IN;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.volume = muted ? from * (1 - t) ** 2 : from + (1 - from) * t * t;
      if (t < 1) frame = requestAnimationFrame(step);
      else if (muted) el.muted = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [video, muted, key]);
}
