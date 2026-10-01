"use client";

import { DURATION, HOVER_CLASS, REVEAL_CLASS, ms } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import type { Category } from "@/sanity/queries";
import { sanityImage } from "@/lib/image";
import { coverImages } from "@/components/HomeClient";
import { captureLayer } from "@/lib/screenshot";
import { useRegisterModal } from "@/lib/modalStack";
import { useSuppressWatermarkCursor } from "@/lib/watermarkCursor";
import InfoLayout from "@/components/InfoLayout";
import NameMark from "@/components/NameMark";
import { Button } from "@/components/ui/button";
import {
  CustomCursor,
  CustomCursorTarget,
} from "@/components/ui/custom-cursor";

// The single-project counterpart to a home Strip's Cover — clicking the
// title in InfoLayout lands here, with just the one project shown, same
// click-to-cycle gallery and cursor treatment as the home page.
export default function ProjectPage({
  project,
  category,
}: {
  project: Project;
  category: Category;
}) {
  const media = coverImages(project, "/personal_placeholder.png");
  const [frame, setFrame] = useState(0);
  const [soundOn, setSoundOn] = useState(false);

  const current = media[frame] ?? media[0];
  const showSoundToggle = current?.type === "file";

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
  // A layer on the shared modal stack, so Escape (handled by the nav) closes
  // it like any other.
  const [fullScreen, setFullScreen] = useState(false);
  useRegisterModal(fullScreen, () => setFullScreen(false));
  // Full screen has its own watermark — the site-wide cursor one steps aside.
  useSuppressWatermarkCursor(fullScreen);

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

  // P / Q: the image in a 3:4 or 1:1 frame, filling it; the same key again
  // goes back to its own shape.
  // Bumped to replay the full-screen instructions.
  // 0 is the intro on opening full screen, which hides itself; each replay
  // after it stays up until I is pressed again.
  const [guideRun, setGuideRun] = useState(0);
  const [guideHidden, setGuideHidden] = useState(false);
  const toggleGuide = () => {
    if (guideRun > 0 && !guideHidden) {
      setGuideHidden(true);
    } else {
      setGuideHidden(false);
      setGuideRun((n) => n + 1);
    }
  };

  // B: the watermark in blue.
  const [blue, setBlue] = useState(false);

  const [aspect, setAspect] = useState<"3/4" | "1/1" | null>(null);
  const toggleAspect = (next: "3/4" | "1/1") =>
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
      else if (key === "b") setBlue((v) => !v);
      else if (key === "i") toggleGuide();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // `inFullScreen`: the copy in the full-screen layer. Only whichever is
  // showing gets the sound.
  const mediaEl = (className: string, inFullScreen = false) =>
    current?.type === "file" ? (
      <video
        // Lets the screenshot read the pixels of CDN-hosted media.
        crossOrigin={current.url.startsWith("/") ? undefined : "anonymous"}
        src={current.url}
        className={className}
        autoPlay
        muted={!soundOn || fullScreen !== inFullScreen}
        loop
        playsInline
        aria-label={current.caption}
      />
    ) : (
      current && (
        <img
          src={
            current.url.startsWith("/")
              ? current.url
              : sanityImage(current.url, { w: 2400 })
          }
          alt={current.caption ?? ""}
          crossOrigin={current.url.startsWith("/") ? undefined : "anonymous"}
          className={className}
        />
      )
    );

  const barText = `text-[0.8rem] tracking-wide hover:text-blue-700 transition-colors ${HOVER_CLASS} cursor-pointer`;
  const barButton = `pointer-events-auto ${barText}`;

  return (
    <CustomCursor
      layout="fixed"
      color="#1447e6"
      dotWidth={8}
      dotHeight={8}
      ring={false}
      hidden={fullScreen}
      className="contents"
    >
      <main className="font-selecta relative flex w-screen h-dvh overflow-hidden bg-background">
        <div className="relative shrink-0 w-full h-screen flex flex-col p-0 lg:py-28 lg:px-0 max-w-full px-5.5 lg:max-w-1/2 mx-auto">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative inline-flex max-w-full max-h-full">
              <CustomCursorTarget asChild grow>
                <button
                  type="button"
                  aria-label={`Cycle images of ${project.title}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={step}
                />
              </CustomCursorTarget>

              {mediaEl(
                "block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none",
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-[62.5vh] z-10 flex flex-col gap-y-2 px-5.5">
          <InfoLayout
            title={project.title}
            model={category === "personal" ? project.client : undefined}
            client={category === "commissioned" ? project.client : undefined}
            agency={project.agency}
            frame={frame + 1}
            total={media.length}
            highlight
          />
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
                    : ""
              }`}
            >
              <CustomCursorTarget asChild grow>
                <button
                  type="button"
                  tabIndex={fullScreen ? 0 : -1}
                  aria-label={`Cycle images of ${project.title}`}
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={step}
                />
              </CustomCursorTarget>
              {fullScreen &&
                mediaEl(
                  aspect
                    ? "block w-full h-full object-cover object-center pointer-events-none"
                    : "block max-w-full max-h-[calc(100dvh-2.75rem)] w-auto h-auto object-contain object-center pointer-events-none",
                  true,
                )}
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
            className={`px-5.5 py-4 h-14 w-auto bg-transparent hover:bg-transparent text-neutral-400 hover:text-blue-700 active:text-blue-700 transition-colors ${HOVER_CLASS} cursor-pointer ${
              category === "personal" ? "justify-end" : "justify-start"
            }`}
          >
            Back
          </Button>
        </span>

        {/* Desktop, in full screen: the keys, top-left — see Instructions.
            Re-keyed to play again from "Instructions". */}
        {fullScreen && (
          <Instructions
            key={guideRun}
            autoHide={guideRun === 0}
            hidden={guideHidden}
            onReplay={toggleGuide}
            buttonClass={barText}
            items={[
              {
                label: "Press Enter to Screen Shot",
                onClick: () => screenshot(),
              },
              {
                label: "Press S for Static",
                onClick: () => setStill((v) => !v),
                active: still,
              },
              {
                label: "Press N for No Frame",
                onClick: () => screenshot(true),
              },
              {
                label: "Press P for 3:4",
                onClick: () => toggleAspect("3/4"),
                active: aspect === "3/4",
              },
              {
                label: "Press Q for 1:1",
                onClick: () => toggleAspect("1/1"),
                active: aspect === "1/1",
              },
              {
                label: "Press B for Blue Text",
                onClick: () => setBlue((v) => !v),
                active: blue,
              },
            ]}
          />
        )}

        <div className="fixed bottom-0 inset-x-0 z-110 grid grid-cols-4 pointer-events-none">
          {/* Mobile: Full Screen alone, in the bottom-right corner like the
              nav's corner links. */}
          <div className="col-start-4 row-start-1 flex flex-row items-center justify-end lg:justify-start gap-x-4">
            <Button
              variant="link"
              size="sm"
              aria-pressed={fullScreen}
              onClick={() => {
                if (!fullScreen) {
                  setGuideRun(0);
                  setGuideHidden(false);
                }
                setFullScreen((v) => !v);
              }}
              className={`max-lg:px-5.5 max-lg:h-14 ${barButton} ${fullScreen ? "text-blue-700" : "text-neutral-400"}`}
            >
              {/* Mobile calls it by what it adds: the watermark. */}
              <span className="lg:hidden">
                {fullScreen ? "Hide" : "Watermark"}
              </span>
              <span className="hidden lg:inline">
                {fullScreen ? "Close" : "Full Screen"}
              </span>
            </Button>
            {showSoundToggle && (
              <Button
                variant="link"
                size="sm"
                aria-pressed={soundOn}
                onClick={() => setSoundOn((v) => !v)}
                className={`hidden lg:inline-flex ${barButton} ${soundOn ? "text-blue-700" : "text-neutral-400"}`}
              >
                {soundOn ? "Sound On" : "Sound Off"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </CustomCursor>
  );
}

// Full screen's key list: its lines fade in one by one. The first time —
// opening full screen — they hold, then fade away together, leaving a single
// "Press I for Instructions" button in their place. That (or the I key)
// plays them again, and they stay until it's pressed once more. Each line is clickable too; `active` ones (a
// toggle that's on) read blue.
const GUIDE_FIRST = ms(300);
const GUIDE_PER = ms(300);
const GUIDE_HOLD = ms(2500);

function Instructions({
  items,
  autoHide,
  hidden,
  onReplay,
  buttonClass,
}: {
  items: { label: string; onClick: () => void; active?: boolean }[];
  /** Fade away by itself once shown — the intro only. */
  autoHide: boolean;
  hidden: boolean;
  onReplay: () => void;
  buttonClass: string;
}) {
  const [shown, setShown] = useState(0);
  const [autoClosed, setAutoClosed] = useState(false);
  const open = !hidden && !autoClosed;
  const count = items.length;

  useEffect(() => {
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(() => setShown(i + 1), GUIDE_FIRST + GUIDE_PER * i),
    );
    if (autoHide)
      timers.push(
        setTimeout(
          () => setAutoClosed(true),
          GUIDE_FIRST + GUIDE_PER * (count - 1) + DURATION.reveal + GUIDE_HOLD,
        ),
      );
    return () => timers.forEach(clearTimeout);
  }, [count, autoHide]);

  // Clickable only while showing — hidden lines would otherwise sit,
  // invisible, over the "Instructions" button.
  const fade = (visible: boolean) =>
    `transition-opacity ${REVEAL_CLASS} ${
      visible
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`;

  return (
    <div className="hidden lg:block fixed top-0 left-0 z-110 pt-4 px-5.5 pointer-events-none">
      <div
        className={`flex flex-col items-start gap-y-1 transition-opacity ${REVEAL_CLASS} ${open ? "" : "opacity-0"}`}
      >
        {items.map(({ label, onClick, active }, i) => (
          <Button
            key={label}
            variant="link"
            size="sm"
            aria-pressed={active}
            onClick={onClick}
            className={`px-0 h-auto ${buttonClass} ${
              active ? "text-blue-700" : "text-neutral-400"
            } ${fade(open && shown > i)}`}
          >
            {label}
          </Button>
        ))}
      </div>
      <Button
        variant="link"
        size="sm"
        onClick={onReplay}
        className={`absolute top-4 left-5.5 px-0 h-auto ${buttonClass} text-neutral-400 ${fade(!open)}`}
      >
        Press &quot;I&quot; for Instructions
      </Button>
    </div>
  );
}
