"use client";

import { HOVER_CLASS, REVEAL_CLASS } from "@/lib/motion";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Project } from "@/lib/types";
import type { Category } from "@/sanity/queries";
import { mediaAlt, sanityImage } from "@/lib/image";
import { useSoundFade } from "@/lib/soundFade";
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

export default function ProjectPage({
  project,
  category,
}: {
  project: Project;
  category: Category;
}) {
  const media = coverImages(project, "/personal_placeholder.png");

  const [frame, setFrame] = useState(() => peekDetailFrame(project.slug));
  useEffect(() => clearDetailFrame(), []);
  const [soundOn, setSoundOn] = useState(false);

  const current = media[frame] ?? media[0];
  const showSoundToggle = current?.type === "file";
  const alt = current
    ? mediaAlt(project.title, current, frame, media.length)
    : "";

  const step = () => setFrame((f) => (f + 1) % media.length);

  const router = useRouter();
  const back = () => {
    const fromHere =
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
    if (fromHere && window.history.length > 1) router.back();
    else router.push(`/#${category}`);
  };

  const fullScreen = true;

  const home = `/#${category}`;
  const leave = () => {
    if (project.slug) setReturnFrame(project.slug, frame);
  };
  useRegisterModal(fullScreen, () => {
    leave();
    router.push(home);
  });

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
    } catch {}
  };

  const [still, setStill] = useState(false);

  const [blue, setBlue] = useState(false);

  const [aspect, setAspect] = useState<"3/4" | "1/1" | "16/9" | null>(null);
  const toggleAspect = (next: "3/4" | "1/1" | "16/9") =>
    setAspect((a) => (a === next ? null : next));

  useEffect(() => {
    if (!fullScreen) return;

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

  const fullScreenVideo = useRef<HTMLVideoElement>(null);
  useSoundFade(fullScreenVideo, !soundOn, current?.url);

  const mediaEl = (className: string, inFullScreen = false) =>
    current?.type === "file" ? (
      <video
        ref={inFullScreen ? fullScreenVideo : undefined}
        crossOrigin={current.url.startsWith("/") ? undefined : "anonymous"}
        src={current.url}
        className={className}
        autoPlay
        muted
        loop
        playsInline
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
                    : aspect === "16/9"
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
