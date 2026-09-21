"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type { ScrollCallback } from "lenis";
import type { About, Project, ProjectMedia } from "@/lib/types";
import { sanityImage } from "@/lib/image";
import { useIntro } from "@/lib/intro";
import {
  setHoveredSection,
  useHoveredSection,
  type Section,
} from "@/lib/hover";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { setHash, useHash } from "@/lib/hash";
import { useInView } from "@/lib/inView";
import { Button } from "@/components/ui/button";
import InfoLayout from "@/components/InfoLayout";
import SectionOverlay from "./SectionOverlay";
import InfoOverlay from "./InfoOverlay";
import AboutSection from "./AboutSection";
import IndexSection from "./IndexSection";
import {
  CustomCursor,
  CustomCursorTarget,
} from "@/components/ui/custom-cursor";

function coverImages(project: Project, fallbackSrc: string): ProjectMedia[] {
  // Images and videos the user uploaded into the gallery, in upload order —
  // both types cycle together when clicking through a cover.
  const media = project.images ?? [];

  if (project.coverVideoUrl) {
    return [
      { url: project.coverVideoUrl, type: "file" },
      ...media.filter((m) => m.url !== project.coverVideoUrl),
    ];
  }
  if (project.coverImageUrl) {
    const cover =
      media.find((m) => m.url === project.coverImageUrl) ??
      ({ url: project.coverImageUrl, type: "image" } as ProjectMedia);
    return [cover, ...media.filter((m) => m.url !== project.coverImageUrl)];
  }
  return media.length ? media : [{ url: fallbackSrc, type: "image" }];
}

function Cover({
  project,
  media,
  columnOpen,
  expanded,
  onExpand,
  onStepImage,
  onEnter,
  muted = true,
}: {
  project: Project;
  media: ProjectMedia;

  columnOpen: boolean;
  expanded: boolean;
  onExpand: () => void;
  onStepImage: (delta: number) => void;
  onEnter: () => void;
  muted?: boolean;
}) {
  const src = media.url;

  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  const handleClick = () => {
    if (!columnOpen) return;
    if (!expanded) {
      onExpand();
      return;
    }
    onStepImage(1);
  };

  return (
    <div
      ref={box}
      data-slug={project.slug ?? project.title}
      className="relative shrink-0 w-full group h-screen flex flex-col p-0 lg:py-28 lg:px-0 max-w-full lg:max-w-1/3 mx-auto"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative inline-flex max-w-full max-h-full">
          <CustomCursorTarget asChild grow>
            <button
              type="button"
              aria-label={`Cycle images of ${project.title}`}
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={handleClick}
            />
          </CustomCursorTarget>

          {media.type === "file" ? (
            <video
              src={src}
              className="block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none"
              autoPlay
              muted={muted}
              loop
              playsInline
              aria-label={media.caption}
            />
          ) : (
            <img
              src={src.startsWith("/") ? src : sanityImage(src, { w: 1400 })}
              alt={media.caption ?? ""}
              className="block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function BreakGalleryOnScroll({ onScroll }: { onScroll: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;

    const handleScroll: ScrollCallback = (instance) => {
      if (instance.isScrolling) onScroll();
    };
    lenis.on("scroll", handleScroll);
    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis, onScroll]);

  return null;
}

function Strip({
  section,
  projects,
  fallbackSrc,
  background = "",
  opened,
  onOpen,
  scrollToSlug,
  onScrolled,
  muteSound = false,
}: {
  section: Exclude<Section, null>;
  projects: Project[];

  fallbackSrc: string;

  background?: string;

  opened: Section;
  onOpen: () => void;

  scrollToSlug?: string | null;
  onScrolled?: () => void;

  muteSound?: boolean;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  const [active, setActive] = useState(0);
  const [frames, setFrames] = useState<number[]>(() => projects.map(() => 0));
  const [expanded, setExpanded] = useState<boolean[]>(() =>
    projects.map(() => false),
  );

  // Videos always start muted — sound is opt-in per video, and switching to
  // a different cover mutes again rather than carrying sound over to it.
  const [soundOn, setSoundOn] = useState(false);
  useEffect(() => {
    setSoundOn(false);
  }, [active]);
  useEffect(() => {
    if (muteSound) setSoundOn(false);
  }, [muteSound]);

  const expandCover = useCallback((index: number) => {
    setExpanded((prev) => {
      if (prev[index]) return prev;
      const next = prev.slice();
      next[index] = true;
      return next;
    });
  }, []);

  const breakGallery = useCallback(() => {
    setExpanded((prev) => {
      if (!prev[active]) return prev;
      const next = prev.slice();
      next[active] = false;
      return next;
    });
  }, [active]);

  const stepImage = useCallback(
    (index: number, delta: number) => {
      setFrames((prev) => {
        const next = prev.slice();
        const total = columnImages[index]?.length ?? 1;
        next[index] = ((next[index] ?? 0) + delta + total) % total;
        return next;
      });
    },
    [columnImages],
  );

  const enterCover = useCallback((index: number) => {
    setActive((prev) => {
      if (index > prev) {
        setExpanded((prevExpanded) => {
          if (!prevExpanded[prev]) return prevExpanded;
          const next = prevExpanded.slice();
          next[prev] = false;
          return next;
        });
        setFrames((prevFrames) => {
          if ((prevFrames[prev] ?? 0) === 0) return prevFrames;
          const next = prevFrames.slice();
          next[prev] = 0;
          return next;
        });
      }
      return index;
    });
  }, []);

  useEffect(() => {
    if (!scrollToSlug) return;
    const lenis = lenisRef.current?.lenis;
    const el = containerRef.current?.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(scrollToSlug)}"]`,
    );
    if (lenis && el) lenis.scrollTo(el);
    onScrolled?.();
  }, [scrollToSlug, onScrolled]);

  useEffect(() => {
    if (!listens) return;
    const onKey = (e: KeyboardEvent) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      const page = window.innerHeight * 0.9;
      const back = e.key === "ArrowUp" || (e.key === " " && e.shiftKey);
      const on = e.key === "ArrowDown" || (e.key === " " && !e.shiftKey);
      if (!back && !on) return;
      e.preventDefault();
      lenis.scrollTo(lenis.scroll + (back ? -page : page));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listens]);

  const width =
    opened === null ? "w-[50vw]" : opened === section ? "w-screen" : "w-0";

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];
  const activeMedia = shownImages[frames[active] ?? 0] ?? shownImages[0];
  const showSoundToggle = listens && activeMedia?.type === "file";

  return (
    <div
      ref={containerRef}
      data-panel={section}
      onClick={onOpen}
      className={`group relative h-auto ${width} overflow-hidden pb-0 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-blue-700 ${background}`}
      onMouseEnter={() => setHoveredSection(section)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <SectionOverlay
        section={section}
        dismissed={opened !== null}
        onClick={onOpen}
      />

      <ReactLenis
        ref={lenisRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden"
        options={{
          orientation: "vertical",
          gestureOrientation: "both",
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          infinite: false,
          autoResize: true,
        }}
      >
        <BreakGalleryOnScroll onScroll={breakGallery} />
        <div className="flex flex-col items-start w-full px-5.5">
          {projects.map((p, i) => {
            const images = columnImages[i];
            const frame = frames[i] ?? 0;
            const media = images[frame] ?? images[0];
            return media ? (
              <Cover
                key={p.slug ?? `${p.title}-${i}`}
                project={p}
                media={media}
                columnOpen={opened === section}
                expanded={expanded[i] ?? false}
                onExpand={() => expandCover(i)}
                onStepImage={(delta) => stepImage(i, delta)}
                onEnter={() => enterCover(i)}
                muted={!(i === active && soundOn)}
              />
            ) : null;
          })}
        </div>
      </ReactLenis>

      {shown && (
        <div className="pointer-events-none absolute inset-x-0 top-[62.5vh] z-10 flex flex-col gap-y-2 px-5.5 pb-6">
          <InfoLayout
            title={shown.title}
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={shown.agency}
            frame={(frames[active] ?? 0) + 1}
            total={shownImages.length}
          />
        </div>
      )}

      {showSoundToggle && (
        <div className="hidden lg:grid fixed bottom-0 inset-x-0 z-40 grid-cols-4 pointer-events-none">
          <Button
            variant="link"
            size="sm"
            aria-pressed={soundOn}
            onClick={(e) => {
              e.stopPropagation();
              setSoundOn((v) => !v);
            }}
            className={`col-start-4 justify-self-start pointer-events-auto  font-selecta text-[0.8rem] tracking-wide hover:text-blue-700 transition-colors duration-200 ease-out cursor-pointer ${soundOn ? "text-blue-700" : "text-neutral-400 "}`}
          >
            {soundOn ? "Sound On" : "Sound Off"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HomeClient({
  personal,
  commissioned,
  about,
}: {
  personal: Project[];
  commissioned: Project[];
  about: About | null;
}) {
  const { rows, settled } = useIntro();

  const opened = useOpenedSection();

  const hash = useHash();

  useEffect(() => {
    if (hash === "personal" || hash === "commissioned") setOpenedSection(hash);
  }, [hash]);

  const [jumpSlug, setJumpSlug] = useState<string | null>(null);

  const row = (n: number) =>
    `transition-opacity duration-500 ease-out ${rows > n ? "" : "opacity-0"}`;

  useEffect(() => () => setHoveredSection(null), []);

  // Pulse the cursor while something's loading in: the opening intro, or a
  // drawer's content staggering in (see .reveal-stagger in globals.css) —
  // then settle it once everything's actually on screen.
  const [drawerOpening, setDrawerOpening] = useState(false);
  useEffect(() => {
    if (hash !== "about" && hash !== "index") {
      const reset = setTimeout(() => setDrawerOpening(false), 0);
      return () => clearTimeout(reset);
    }
    const on = setTimeout(() => setDrawerOpening(true), 0);
    const off = setTimeout(() => setDrawerOpening(false), 900);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [hash]);

  return (
    <CustomCursor
      layout="fixed"
      color="#1447e6"
      dotWidth={8}
      dotHeight={8}
      hoverWidth={16}
      hoverHeight={16}
      ring={false}
      pulsing={!settled || drawerOpening}
      className="contents"
    >
      <section className="font-selecta relative flex  flex-row w-screen h-dvh overflow-hidden">
        <Strip
          section="personal"
          projects={personal}
          fallbackSrc="/personal_placeholder.png"
          background="bg-background"
          opened={opened}
          onOpen={() => setHash("personal")}
          scrollToSlug={jumpSlug}
          onScrolled={() => setJumpSlug(null)}
          muteSound={hash === "about" || hash === "index"}
        />
        <Strip
          section="commissioned"
          projects={commissioned}
          fallbackSrc="/personal_placeholder.png"
          opened={opened}
          onOpen={() => setHash("commissioned")}
          scrollToSlug={jumpSlug}
          onScrolled={() => setJumpSlug(null)}
          muteSound={hash === "about" || hash === "index"}
        />
      </section>

      <InfoOverlay open={hash === "about"} onDismiss={() => setHash("")}>
        <AboutSection about={about} />
      </InfoOverlay>
      <InfoOverlay
        open={hash === "index"}
        onDismiss={() => setHash("")}
        panelClassName="inset-x-0 bottom-0 h-dvh lg:bottom-auto lg:top-0"
        shadow={false}
      >
        <IndexSection
          projects={{ personal, commissioned }}
          onSelect={(project, category) => {
            setOpenedSection(category);
            setJumpSlug(project.slug ?? project.title);
            setHash("");
          }}
          initialCategory={opened ?? "personal"}
        />
      </InfoOverlay>
    </CustomCursor>
  );
}
