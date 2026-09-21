"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import type { Category } from "@/sanity/queries";
import { sanityImage } from "@/lib/image";
import { coverImages } from "@/components/HomeClient";
import InfoLayout from "@/components/InfoLayout";
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

  return (
    <CustomCursor
      layout="fixed"
      color="#1447e6"
      dotWidth={8}
      dotHeight={8}
      ring={false}
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

              {current?.type === "file" ? (
                <video
                  src={current.url}
                  className="block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none"
                  autoPlay
                  muted={!soundOn}
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
                        : sanityImage(current.url, { w: 1400 })
                    }
                    alt={current.caption ?? ""}
                    className="block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none"
                  />
                )
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

        {showSoundToggle && (
          <div className="hidden lg:grid fixed bottom-0 inset-x-0 z-40 grid-cols-4 pointer-events-none">
            <Button
              variant="link"
              size="sm"
              aria-pressed={soundOn}
              onClick={() => setSoundOn((v) => !v)}
              className={`col-start-4 justify-self-start pointer-events-auto  text-[0.8rem] tracking-wide hover:text-blue-700 transition-colors duration-200 ease-out cursor-pointer ${soundOn ? "text-blue-700" : "text-neutral-400 "}`}
            >
              {soundOn ? "Sound On" : "Sound Off"}
            </Button>
          </div>
        )}
      </main>
    </CustomCursor>
  );
}
