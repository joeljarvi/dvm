"use client";

import { HOVER_CLASS, REVEAL_CLASS } from "@/lib/motion";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";
import type { Category } from "@/sanity/queries";
import { mediaAlt, sanityImage } from "@/lib/image";
import { useSoundFadeIn } from "@/lib/soundFade";
import { coverImages, morphName } from "@/components/HomeClient";
import {
  clearDetailFrame,
  peekDetailFrame,
  setReturnFrame,
} from "@/lib/detailFrame";
import { captureLayer } from "@/lib/screenshot";
import { useRegisterModal } from "@/lib/modalStack";
import NameMark from "@/components/NameMark";
import { Button } from "@/components/ui/button";

// The single-project counterpart to a home Strip's Cover — clicking its
// title on home lands here, with just the one project shown, same
// click-to-cycle gallery and cursor treatment as the home page.
export default function ProjectPage({
  project,
  category,
}: {
  project: Project;
  category: Category;
}) {
  const media = coverImages(project, "/personal_placeholder.png");
  // Opens on the image its home cover was showing, if that's how we came.
  const [frame, setFrame] = useState(() => peekDetailFrame(project.slug));
  useEffect(() => clearDetailFrame(), []);
  const [soundOn, setSoundOn] = useState(false);

  const current = media[frame] ?? media[0];
  const showSoundToggle = current?.type === "file";
  const alt = current
    ? mediaAlt(project.title, current, frame, media.length)
    : "";

  const step = () => setFrame((f) => (f + 1) % media.length);

  // Back to wherever we came from on this site; landing here directly, to
  // the project's own section on home.
  const router = useRouter();
  const back = () => {
    const fromHere =
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
    if (fromHere && window.history.length > 1) router.back();
    else router.push(`/#${category}`);
  };

  // Full screen: just the current image, edge to edge but for the gutter,
  // over everything including the nav — the name on top as a watermark.
  // The page opens in it (the home titles link straight here), so closing
  // it leaves the page.
  const fullScreen = true;
  // Back (bottom right) is a plain link home, to the project's own section; Escape goes
  // the same way. Home then opens on this image, so it shrinks back into its
  // own cover.
  const home = `/#${category}`;
  const leave = () => {
    if (project.slug) setReturnFrame(project.slug, frame);
  };
  useRegisterModal(fullScreen, () => {
    leave();
    router.push(home);
  });

  // Press Enter (or click the hint) in full screen to save the view as shown —
  // image and watermark, no buttons — as a PNG. See lib/screenshot.
  // "No Frame" saves just the image, cropped to it.
  const layer = useRef<HTMLDivElement>(null);
  const screenshot = async (cropToMedia = false) => {
    if (!layer.current) return;
    try {
      const blob = await captureLayer(layer.current, { cropToMedia });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${project.slug ?? project.title}-${frame + 1}${cropToMedia ? "-no-frame" : ""}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 0);
    } catch {
      // The media couldn't be read back (e.g. the CDN refused CORS).
    }
  };
  // Static: the watermark held at its starting position.
  const [still, setStill] = useState(false);

  // B: the watermark in blue.
  const [blue, setBlue] = useState(false);

  // P / Q / L: the image in a 3:4, 1:1 or 16:9 frame, filling it; the same
  // key again goes back to its own shape.
  const [aspect, setAspect] = useState<"3/4" | "1/1" | "16/9" | null>(null);
  const toggleAspect = (next: "3/4" | "1/1" | "16/9") =>
    setAspect((a) => (a === next ? null : next));

  useEffect(() => {
    if (!fullScreen) return;
    // Enter: screenshot. S: Static. N: screenshot, No Frame. (Enter's
    // default — clicking a focused button — is held back.)
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "enter") screenshot();
      else if (key === "s") setStill((v) => !v);
      else if (key === "n") screenshot(true);
      else if (key === "p") toggleAspect("3/4");
      else if (key === "q") toggleAspect("1/1");
      else if (key === "l") toggleAspect("16/9");
      else if (key === "b") setBlue((v) => !v);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // `inFullScreen`: the copy in the full-screen layer. Only whichever is
  // showing gets the sound.
  // The full-screen copy is the one heard; Play Sound fades it in.
  const fullScreenVideo = useRef<HTMLVideoElement>(null);
  useSoundFadeIn(fullScreenVideo, !soundOn, current?.url);

  const mediaEl = (className: string, inFullScreen = false) =>
    current?.type === "file" ? (
      <video
        ref={inFullScreen ? fullScreenVideo : undefined}
        // Lets the screenshot read the pixels of CDN-hosted media.
        crossOrigin={current.url.startsWith("/") ? undefined : "anonymous"}
        src={current.url}
        className={className}
        autoPlay
        muted={!soundOn || fullScreen !== inFullScreen}
        loop
        playsInline
        // Described once, on the full-screen copy that's showing.
        aria-label={inFullScreen ? alt : undefined}
        aria-hidden={!inFullScreen}
      />
    ) : (
      current && (
        <img
          src={
            current.url.startsWith("/")
              ? current.url
              : sanityImage(current.url, { w: 2400 })
          }
          alt={inFullScreen ? alt : ""}
          crossOrigin={current.url.startsWith("/") ? undefined : "anonymous"}
          className={className}
        />
      )
    );

  const barText = `text-[0.8rem] tracking-wide hover:text-blue-700 transition-colors ${HOVER_CLASS} cursor-pointer`;
  const barButton = `pointer-events-auto ${barText}`;

  return (
    <>
      <main className="font-selecta relative flex w-screen h-dvh overflow-hidden bg-background">
        <div className="relative shrink-0 w-full h-screen flex flex-col p-0 lg:py-28 lg:px-0 max-w-full px-5.5 lg:max-w-1/2 mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative inline-flex max-w-full max-h-full">
              <button
                type="button"
                aria-label={`Cycle images of ${project.title}`}
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={step}
              />

              {mediaEl(
                "block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none",
              )}
            </div>
          </div>
        </div>

        <div
          ref={layer}
          aria-hidden={!fullScreen}
          className={`fixed inset-0 z-100 bg-background p-5.5 transition-opacity ${REVEAL_CLASS} ${
            fullScreen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className={`relative inline-flex max-w-full max-h-full ${
                aspect === "3/4"
                  ? "h-full aspect-3/4"
                  : aspect === "1/1"
                    ? "h-full aspect-square"
                    : // Landscape: as wide as fits, both across and down.
                      aspect === "16/9"
                      ? "w-[min(100%,calc((100dvh-2.75rem)*16/9))] aspect-video"
                      : ""
              }`}
            >
              <button
                type="button"
                tabIndex={fullScreen ? 0 : -1}
                aria-label={`Cycle images of ${project.title}`}
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={step}
              />
              <ViewTransition
                name={morphName(project)}
                share="morph"
                default="none"
              >
                {mediaEl(
                  aspect
                    ? "block w-full h-full object-cover object-center pointer-events-none"
                    : "block max-w-full max-h-[calc(100dvh-2.75rem)] w-auto h-auto object-contain object-center pointer-events-none",
                  true,
                )}
              </ViewTransition>
            </div>
          </div>
          <NameMark play={fullScreen} watermark still={still} blue={blue} />
        </div>

        {/* The nav keeps only the project's own section link here — Personal
            top left, Commissioned top right — so Back takes the other top
            corner. */}
        <span
          className={`fixed top-0 z-80 flex flex-row items-center ${
            category === "personal"
              ? "right-0 justify-end"
              : "left-0 justify-start"
          }`}
        >
          <Button
            variant="link"
            size="sm"
            onClick={back}
            className={`px-5.5 py-4 h-14 w-auto bg-transparent hover:bg-transparent text-neutral-400 dark:text-neutral-500 hover:text-blue-700 active:text-blue-700 dark:hover:text-blue-700 dark:active:text-blue-700 transition-colors ${HOVER_CLASS} cursor-pointer ${
              category === "personal" ? "justify-end" : "justify-start"
            }`}
          >
            Back
          </Button>
        </span>

        <div className="fixed bottom-0 inset-x-0 z-110 grid grid-cols-4 pointer-events-none">
          {/* Mobile: Back alone, in the bottom-right corner like the nav's
              corner links. */}
          <div className="col-start-4 row-start-1 flex flex-row items-center justify-end lg:justify-start gap-x-4">
            <Button
              variant="link"
              size="sm"
              asChild
              className={`max-lg:px-5.5 max-lg:h-14 ${barButton} text-neutral-400 dark:text-neutral-500 dark:hover:text-blue-700`}
            >
              <Link href={home} onClick={leave}>
                Back
              </Link>
            </Button>
            {showSoundToggle && (
              <Button
                variant="link"
                size="sm"
                aria-pressed={soundOn}
                onClick={() => setSoundOn((v) => !v)}
                className={`hidden lg:inline-flex ${barButton} ${soundOn ? "text-blue-700" : "text-neutral-400"}`}
              >
                {soundOn ? "Sound Off" : "Play Sound"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
