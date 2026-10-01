"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";
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
import { useLandingReveal } from "@/lib/landing";
import { useSuppressWatermarkCursor } from "@/lib/watermarkCursor";
import { setHash, useHash } from "@/lib/hash";
import { useInView } from "@/lib/inView";
import {
  REVEAL_CLASS,
  ENTRANCE_CLASS,
  HOVER_CLASS,
  FADE_CLASS,
  DURATION,
  REVEAL_TRANSITION,
} from "@/lib/motion";
import { Button } from "@/components/ui/button";
import InfoLayout from "@/components/InfoLayout";
import SectionOverlay, { LandingPrompt, landingWords } from "./SectionOverlay";
import InfoOverlay from "./InfoOverlay";
import AboutSection from "./AboutSection";
import IndexSection from "./IndexSection";
import UnderConstruction from "./UnderConstruction";
import {
  CustomCursor,
  useWatermarkCursorOn,
  CustomCursorTarget,
} from "@/components/ui/custom-cursor";

export function coverImages(
  project: Project,
  fallbackSrc: string,
): ProjectMedia[] {
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

function landingGap(section: Exclude<Section, null>, side: "before" | "after") {
  const inner =
    (section === "personal" && side === "after") ||
    (section === "commissioned" && side === "before");
  return `${inner ? "flex-1" : "flex-3"} lg:flex-1`;
}

const LANDING_COVER_WIDTH = "max-w-1/2";

export const COVER_STAGE_CLASS = "flex flex-col p-0 lg:py-28";
export const COVER_FRAME_CLASS =
  "relative w-full h-full flex flex-col items-center justify-center";
export const COVER_BOX_CLASS =
  "relative inline-flex max-h-full overflow-hidden";

export const MEDIA_CLASS =
  "block max-w-full max-h-full w-auto h-auto object-contain object-center pointer-events-none";

export const mediaSrc = (src: string) =>
  src.startsWith("/") ? src : sanityImage(src, { w: 1400 });

function Cover({
  project,
  media,
  columnOpen,
  expanded,
  onExpand,
  onStepImage,
  onEnter,
  muted = true,
  landingMode,
  lifted,
  section,
}: {
  project: Project;
  media: ProjectMedia;
  section: Exclude<Section, null>;

  columnOpen: boolean;
  landingMode: boolean;
  /** Landing mode, its panel hovered. */
  lifted: boolean;
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
    if (!expanded) onExpand();
    onStepImage(1);
  };

  return (
    <div
      ref={box}
      data-slug={project.slug ?? project.title}
      className={`relative shrink-0 w-full group ${landingMode ? "h-[50dvh] lg:h-screen" : "h-screen"} ${COVER_STAGE_CLASS} max-w-full mx-auto`}
    >
      <div className={COVER_FRAME_CLASS}>
        {landingMode && (
          <div aria-hidden className={landingGap(section, "before")} />
        )}
        <motion.div
          // In landing mode, lifts slightly while its panel is hovered (the
          // panel's click target sits over the image there).
          animate={{ y: lifted ? -6 : 0 }}
          transition={REVEAL_TRANSITION}
          className={`${COVER_BOX_CLASS} ${landingMode ? LANDING_COVER_WIDTH : "max-w-full"} transition-[max-width] ${REVEAL_CLASS}`}
        >
          {/* Landing veil, over the image only — what's between the covers
              stays clear, so the section label beneath them reads sharp.
              Hovering the panel fades the whole veil out; the blur itself is
              never animated, since a changing backdrop-filter smears at the
              edges of the image. */}
          <div
            aria-hidden
            className={`absolute inset-0 z-[5] pointer-events-none bg-background/60 backdrop-blur-xs transition-opacity ${REVEAL_CLASS} ${
              landingMode
                ? "opacity-100 group-hover/strip:opacity-0"
                : "opacity-0"
            }`}
          />
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
              className={MEDIA_CLASS}
              autoPlay
              muted={muted}
              loop
              playsInline
              aria-label={media.caption}
            />
          ) : (
            <img
              src={mediaSrc(src)}
              alt={media.caption ?? ""}
              className={MEDIA_CLASS}
            />
          )}
        </motion.div>
        {landingMode && (
          <div aria-hidden className={landingGap(section, "after")} />
        )}
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
  imagesShown = true,
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

  /** Landing reveal: the covers have come in. */
  imagesShown?: boolean;
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

  const [soundOn, setSoundOn] = useState(false);
  const [prevActive, setPrevActive] = useState(active);
  const [prevMuteSound, setPrevMuteSound] = useState(muteSound);
  if (active !== prevActive) {
    setPrevActive(active);
    setSoundOn(false);
  }
  if (muteSound !== prevMuteSound) {
    setPrevMuteSound(muteSound);
    if (muteSound) setSoundOn(false);
  }

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

  // Side by side on desktop; stacked on mobile, where the panels split the
  // height instead — so the chosen one grows by height, not width.
  const size =
    opened === null
      ? "w-full h-1/2 lg:w-[50vw] lg:h-auto"
      : opened === section
        ? "w-full h-full lg:w-screen lg:h-auto"
        : "w-full h-0 lg:w-0 lg:h-auto";

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];
  const activeMedia = shownImages[frames[active] ?? 0] ?? shownImages[0];
  const showSoundToggle = listens && activeMedia?.type === "file";

  return (
    <div
      ref={containerRef}
      data-panel={section}
      onClick={onOpen}
      className={`group group/strip relative ${size} overflow-hidden pb-0 transition-[width,height] ${REVEAL_CLASS} hover:text-blue-700 ${background}`}
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
        className={`relative z-10 transition-[opacity,translate] ${ENTRANCE_CLASS} ${
          imagesShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden`}
        options={{
          orientation: "vertical",
          gestureOrientation: "both",
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1,
          infinite: true,
          syncTouch: true,
          autoResize: true,
        }}
      >
        <BreakGalleryOnScroll onScroll={breakGallery} />
        <div className="flex flex-col items-start w-full px-5.5">
          {/* Lenis' infinite mode just wraps the scroll position back to 0 at
              the end — it doesn't repeat anything. So the first cover is
              repeated once at the bottom: the last screen then matches the
              first, and the wrap is invisible. The copy is the first cover in
              every respect (same index, frame and handlers). */}
          {[...projects, ...projects.slice(0, 1)].map((p, n) => {
            const i = n % projects.length;
            const images = columnImages[i];
            const frame = frames[i] ?? 0;
            const media = images[frame] ?? images[0];
            return media ? (
              <Cover
                key={n === i ? (p.slug ?? `${p.title}-${i}`) : "loop"}
                project={p}
                media={media}
                columnOpen={opened === section}
                landingMode={opened === null}
                lifted={opened === null && pointerOver === section}
                section={section}
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
        <div
          // Held back through landing mode; fades in once a section is chosen.
          className={`pointer-events-none absolute inset-x-0 top-[62.5%] z-10 flex flex-col gap-y-2 px-5.5 transition-opacity ${REVEAL_CLASS} ${
            opened !== null ? "" : "opacity-0"
          }`}
        >
          <InfoLayout
            title={shown.title}
            titleHref={shown.slug ? `/${section}/${shown.slug}` : undefined}
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
            className={`col-start-4 justify-self-start pointer-events-auto  text-[0.8rem] tracking-wide hover:text-blue-700 transition-colors ${HOVER_CLASS} cursor-pointer ${soundOn ? "text-blue-700" : "text-neutral-400 "}`}
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
  underConstruction,
  landingText,
}: {
  personal: Project[];
  commissioned: Project[];
  about: About | null;
  underConstruction: boolean;
  landingText?: string | null;
}) {
  const { rows, settled } = useIntro();

  const opened = useOpenedSection();

  const hash = useHash();

  useEffect(() => {
    if (hash === "personal" || hash === "commissioned") setOpenedSection(hash);
  }, [hash]);

  const [jumpSlug, setJumpSlug] = useState<string | null>(null);

  const prompt = useMemo(() => landingWords(landingText), [landingText]);
  const landing = useLandingReveal(prompt.length);

  // The watermark cursor (if it's on) holds back in landing mode until the
  // prompt and the covers are in — the covers' entrance done. Coming back
  // home finds the reveal spent, so it's there straight away.
  const [revealed, setRevealed] = useState(() => landing.images);
  useEffect(() => {
    if (!landing.images) return;
    const t = setTimeout(() => setRevealed(true), DURATION.entrance);
    return () => clearTimeout(t);
  }, [landing.images]);
  const holding = opened === null && !revealed;
  useSuppressWatermarkCursor(holding);
  // No cursor at all meanwhile — the blue circle stays down too.
  const watermarkOn = useWatermarkCursorOn();
  const hovered = useHoveredSection();

  const row = (n: number) =>
    `transition-opacity ${FADE_CLASS} ${rows > n ? "" : "opacity-0"}`;

  useEffect(() => () => setHoveredSection(null), []);

  // Pulse the cursor while something's loading in: the opening intro, or a
  // drawer opening — then settle it once everything's actually on screen.
  const [drawerOpening, setDrawerOpening] = useState(false);
  useEffect(() => {
    if (hash !== "about" && hash !== "index") {
      const reset = setTimeout(() => setDrawerOpening(false), 0);
      return () => clearTimeout(reset);
    }
    const on = setTimeout(() => setDrawerOpening(true), 0);
    // Matches the drawer's own fade.
    const off = setTimeout(() => setDrawerOpening(false), DURATION.reveal);
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
      ring={false}
      pulsing={!settled || drawerOpening}
      hidden={watermarkOn && holding}
      className="contents"
    >
      <section className="font-selecta relative flex flex-col lg:flex-row w-screen h-dvh overflow-hidden bg-background">
        <Strip
          section="personal"
          projects={personal}
          fallbackSrc="/personal_placeholder.png"
          opened={opened}
          onOpen={() => setHash("personal")}
          scrollToSlug={jumpSlug}
          onScrolled={() => setJumpSlug(null)}
          muteSound={hash === "about" || hash === "index"}
          imagesShown={landing.images}
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
          imagesShown={landing.images}
        />

        <LandingPrompt
          prompt={prompt}
          dismissed={opened !== null}
          words={landing.words}
          hovered={hovered}
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

      <UnderConstruction active={underConstruction} />
    </CustomCursor>
  );
}
