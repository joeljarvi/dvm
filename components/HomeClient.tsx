"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { flushSync } from "react-dom";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { SCROLL_OPTIONS } from "@/lib/scroll";
import { useCanHover } from "@/lib/canHover";
import type { ScrollCallback } from "lenis";
import type { About, Project, ProjectMedia } from "@/lib/types";
import { mediaAlt, sanityImage } from "@/lib/image";
import { useSoundFade } from "@/lib/soundFade";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import {
  setHoveredSection,
  useHoveredSection,
  type Section,
} from "@/lib/hover";
import { setOpenedSection, useOpenedSection } from "@/lib/section";
import { useLandingReveal } from "@/lib/landing";
import { clearReturn, peekReturn, setDetailFrame } from "@/lib/detailFrame";
import { setHash, useHash } from "@/lib/hash";
import { useInView } from "@/lib/inView";
import {
  REVEAL_CLASS,
  ENTRANCE_CLASS,
  HOVER_CLASS,
  SELECT_CLASS,
  SWITCH_CLASS,
  AFTER_SELECT,
  AFTER_SWITCH,
  DURATION,
} from "@/lib/motion";
import { Button } from "@/components/ui/button";
import InfoLayout from "@/components/InfoLayout";
import SectionOverlay, { LandingPrompt, landingWords } from "./SectionOverlay";
import InfoOverlay from "./InfoOverlay";
import AboutSection from "./AboutSection";
import IndexSection from "./IndexSection";
import UnderConstruction from "./UnderConstruction";

export function coverImages(
  project: Project,
  fallbackSrc: string,
): ProjectMedia[] {
  const media = project.images ?? [];

  if (project.coverVideoUrl) {
    return [
      { url: project.coverVideoUrl, type: "file" },
      ...media.filter((m) => m.url !== project.coverVideoUrl),
    ];
  }
  if (project.coverImageUrl) {
    const inGallery = media.find((m) => m.url === project.coverImageUrl);
    const cover: ProjectMedia = inGallery
      ? { ...inGallery, alt: inGallery.alt ?? project.coverAlt }
      : { url: project.coverImageUrl, type: "image", alt: project.coverAlt };
    return [cover, ...media.filter((m) => m.url !== project.coverImageUrl)];
  }
  return media.length ? media : [{ url: fallbackSrc, type: "image" }];
}

const AFTER_COVER = "lg:delay-(--motion-cover-step)";

const GAP_STEP =
  "lg:duration-(--motion-cover-step) lg:ease-(--motion-ease-switch)";

function landingGap(
  section: Exclude<Section, null>,
  side: "before" | "after",
  landingMode: boolean,
  tempo: string,
) {
  const inner =
    (section === "personal" && side === "after") ||
    (section === "commissioned" && side === "before");

  const grow = landingMode && !inner ? "grow lg:grow-3" : "grow";
  return `basis-0 shrink-0 ${grow} transition-[flex-grow] ${tempo}`;
}

function useMobileStack(opened: Section) {
  const [stacked, setStacked] = useState(true);
  const [turning, setTurning] = useState(false);
  useEffect(() => {
    if (opened === null || !stacked) return;
    const turn = setTimeout(() => {
      setTurning(true);
      setStacked(false);
    }, DURATION.select);
    return () => clearTimeout(turn);
  }, [opened, stacked]);

  const [prevOpened, setPrevOpened] = useState(opened);
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened === null) setStacked(true);
  }

  useEffect(() => {
    if (!turning) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setTurning(false));
    });
    return () => cancelAnimationFrame(frame);
  }, [turning]);
  return { stacked, turning, setStacked };
}

const DESKTOP_QUERY = "(min-width: 64rem)";

function slideIntoSection(
  section: Exclude<Section, null>,
  open: () => void,
  after: () => void,
): boolean {
  if (
    window.matchMedia(DESKTOP_QUERY).matches ||
    typeof document.startViewTransition !== "function"
  )
    return false;
  const root = document.documentElement;

  if (root.dataset.homeSlide) return true;
  root.dataset.homeSlide = section === "personal" ? "from-left" : "from-right";

  const media = document.querySelector<HTMLElement>(
    `[data-panel="${section}"] [data-slug][data-current] [data-cover-box]`,
  );
  media?.style.setProperty("view-transition-name", "home-cover");
  const transition = document.startViewTransition(() => flushSync(open));
  transition.finished.finally(() => {
    delete root.dataset.homeSlide;
    media?.style.removeProperty("view-transition-name");
    after();
  });
  return true;
}

function useColumnTempo(opened: Section) {
  const [prev, setPrev] = useState(opened);
  const [tempo, setTempo] = useState(SELECT_CLASS);
  if (opened !== prev) {
    setPrev(opened);
    setTempo(prev !== null && opened !== null ? SWITCH_CLASS : SELECT_CLASS);
  }
  return tempo;
}

const OPEN_COVER_WIDTH = "max-w-[calc(100vw-2.75rem)] shrink-0";
const OPEN_MEDIA_WIDTH = "max-w-[calc(100vw-2.75rem)]";

export const COVER_STAGE_CLASS = "flex flex-col p-0 lg:py-28";

const LANDING_STAGE_CLASS: Record<Exclude<Section, null>, string> = {
  personal: "flex flex-col pt-24 pb-12 lg:pt-50.5 lg:pb-50.5",
  commissioned: "flex flex-col pt-12 pb-24 lg:pt-50.5 lg:pb-50.5",
};

export const COVER_FRAME_CLASS =
  "relative w-full h-full flex flex-col items-center justify-center [container-type:size]";
export const COVER_BOX_CLASS =
  "relative inline-flex max-h-full overflow-hidden";

const MEDIA_FIT =
  "block max-h-[100cqh] w-auto h-auto object-contain object-center pointer-events-none";
export const MEDIA_CLASS = `${MEDIA_FIT} max-w-[100cqw]`;

export const morphName = (project: Project) =>
  `project-media-${(project.slug ?? project.title).replace(/[^\w-]/g, "-")}`;

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
  alt,
  landingMode,
  panelHovered,
  section,
  morph = false,
  repeat = false,
  current = false,
  priority = false,
  layoutClass,
}: {
  project: Project;
  media: ProjectMedia;

  columnOpen: boolean;
  landingMode: boolean;

  section: Exclude<Section, null>;

  panelHovered: boolean;
  expanded: boolean;
  onExpand: () => void;
  onStepImage: (delta: number) => void;
  onEnter: () => void;
  muted?: boolean;

  alt: string;

  morph?: boolean;

  repeat?: boolean;

  current?: boolean;

  priority?: boolean;

  layoutClass: string;
}) {
  const src = media.url;

  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  const capByColumn = landingMode || layoutClass === SELECT_CLASS;

  const capEase = capByColumn ? `transition-[max-width] ${layoutClass}` : "";

  const justOpened = !landingMode && layoutClass === SELECT_CLASS;
  const gapTempo = justOpened ? `${layoutClass} ${GAP_STEP}` : layoutClass;

  const mediaClass = `${MEDIA_FIT} ${
    landingMode
      ? "max-w-[50cqw] lg:max-w-[100cqw]"
      : `${capByColumn ? "max-w-[100cqw]" : OPEN_MEDIA_WIDTH} will-change-transform`
  } ${capEase}`;

  const video = useRef<HTMLVideoElement>(null);
  const canHover = useCanHover();
  const playing = !landingMode || panelHovered || !canHover;
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing, src]);

  useSoundFade(video, muted, src);

  const mediaNode =
    media.type === "file" ? (
      <video
        ref={video}
        src={src}
        className={mediaClass}
        autoPlay={playing}
        preload={priority ? "auto" : "metadata"}
        muted
        loop
        playsInline
        aria-label={alt}
      />
    ) : (
      <img
        src={mediaSrc(src)}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={mediaClass}
      />
    );

  const handleClick = () => {
    if (!columnOpen) return;
    if (!expanded) onExpand();
    onStepImage(1);
  };

  return (
    <div
      ref={box}
      data-current={current || undefined}
      aria-hidden={repeat || undefined}
      data-slug={project.slug ?? project.title}
      className={`relative shrink-0 w-full group bg-background ${landingMode ? "h-[50dvh] lg:h-screen" : "h-screen"} ${
        landingMode
          ? `transition-[height,padding,filter,opacity] ${REVEAL_CLASS}`
          : `transition-[height,padding] ${layoutClass}`
      } ${
        landingMode
          ? "lg:blur-xs lg:opacity-40 lg:group-hover/strip:blur-[0px] lg:group-hover/strip:opacity-100 lg:group-focus-within/strip:blur-[0px] lg:group-focus-within/strip:opacity-100"
          : ""
      } ${landingMode ? LANDING_STAGE_CLASS[section] : `${COVER_STAGE_CLASS} ${justOpened ? AFTER_COVER : ""}`} max-w-full mx-auto`}
    >
      <div className={`${COVER_FRAME_CLASS} lg:flex-row`}>
        <div
          aria-hidden
          className={landingGap(section, "before", landingMode, gapTempo)}
        />
        <div
          data-cover-box
          className={`${COVER_BOX_CLASS} ${
            landingMode
              ? "max-w-1/2 lg:max-w-full"
              : capByColumn
                ? "max-w-full"
                : OPEN_COVER_WIDTH
          } ${capEase}`}
        >
          <button
            type="button"
            tabIndex={landingMode || repeat ? -1 : 0}
            aria-label={`Cycle images of ${project.title}`}
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleClick}
          />

          <ViewTransition
            name={morph ? morphName(project) : undefined}
            share={morph ? "morph" : "none"}
            default="none"
          >
            {mediaNode}
          </ViewTransition>
        </div>
        <div
          aria-hidden
          className={landingGap(section, "after", landingMode, gapTempo)}
        />
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
  layoutClass,
  stacked,
  turning,
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

  imagesShown?: boolean;

  layoutClass: string;

  stacked: boolean;

  turning: boolean;
}) {
  const lenisRef = useRef<LenisRef>(null);

  const smoothTouch = useCanHover();
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerOver = useHoveredSection();
  const listens =
    opened === section || (opened === null && pointerOver === section);

  const columnImages = useMemo(
    () => projects.map((p) => coverImages(p, fallbackSrc)),
    [projects, fallbackSrc],
  );

  const [returnTo] = useState(() => {
    const r = peekReturn();
    const index = r ? projects.findIndex((p) => p.slug === r.slug) : -1;
    return index < 0 ? null : { index, frame: r!.frame };
  });
  const [active, setActive] = useState(returnTo?.index ?? 0);
  const [frames, setFrames] = useState<number[]>(() =>
    projects.map((_, i) => (i === returnTo?.index ? returnTo.frame : 0)),
  );

  useLayoutEffect(() => {
    if (!returnTo) return;
    containerRef.current
      ?.querySelector<HTMLElement>(
        `[data-slug="${CSS.escape(projects[returnTo.index].slug ?? "")}"]`,
      )
      ?.scrollIntoView({ block: "start" });
  }, [returnTo, projects]);
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
    lenisRef.current?.wrapper?.setAttribute("tabindex", "-1");
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

  const columnOpen = opened === section;
  const overlayUp = muteSound;
  useEffect(() => {
    if (!columnOpen || overlayUp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("a, button, input, textarea, select, [contenteditable]")
      )
        return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        expandCover(active);
        stepImage(active, e.key === "ArrowRight" ? 1 : -1);
      } else if (e.key === "Enter") {
        const slug = projects[active]?.slug;
        if (!slug) return;
        e.preventDefault();

        containerRef.current
          ?.querySelector<HTMLAnchorElement>(`a[href="/${section}/${slug}"]`)
          ?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    columnOpen,
    overlayUp,
    active,
    projects,
    section,
    expandCover,
    stepImage,
  ]);

  useEffect(() => {
    if (!listens || overlayUp) return;
    const onKey = (e: KeyboardEvent) => {
      const lenis = lenisRef.current?.lenis;
      const wrapper = lenisRef.current?.wrapper;
      if (!lenis || !wrapper) return;
      const back = e.key === "ArrowUp" || (e.key === " " && e.shiftKey);
      const on = e.key === "ArrowDown" || (e.key === " " && !e.shiftKey);
      if (!back && !on) return;
      e.preventDefault();

      const view = wrapper.getBoundingClientRect();
      const middle = view.top + view.height / 2;
      let nearest: DOMRect | null = null;
      for (const el of wrapper.querySelectorAll("[data-slug]")) {
        const r = el.getBoundingClientRect();
        if (
          !nearest ||
          Math.abs(r.top + r.height / 2 - middle) <
            Math.abs(nearest.top + nearest.height / 2 - middle)
        )
          nearest = r;
      }
      if (!nearest) return;
      const offCentre = nearest.top + nearest.height / 2 - middle;
      lenis.scrollTo(
        lenis.scroll + offCentre + (back ? -nearest.height : nearest.height),
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listens, overlayUp]);

  const open = opened === section;
  const desktopSize =
    opened === null ? "lg:w-1/2" : open ? "lg:w-full" : "lg:w-0";
  const mobileSize = stacked
    ? opened === null
      ? "w-full h-1/2"
      : open
        ? "w-full h-full"
        : "w-full h-0"
    : open
      ? "w-full h-full"
      : "w-0 h-full";
  const size = `${mobileSize} ${desktopSize} lg:h-full`;

  const seam = `max-lg:after:content-[''] max-lg:after:absolute max-lg:after:inset-y-0 max-lg:after:w-5.5 max-lg:after:z-[15] max-lg:after:bg-background max-lg:after:pointer-events-none ${
    section === "personal" ? "max-lg:after:right-0" : "max-lg:after:left-0"
  }`;

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];
  const activeMedia = shownImages[frames[active] ?? 0] ?? shownImages[0];

  const justPicked = opened !== null && layoutClass === SELECT_CLASS;
  const showSoundToggle =
    opened !== null && listens && activeMedia?.type === "file";

  return (
    <div
      ref={containerRef}
      data-panel={section}
      inert={opened !== null && opened !== section}
      onClick={onOpen}
      className={`group group/strip relative ${size} ${seam} overflow-hidden pb-0 shrink-0 ${turning ? "transition-none" : `transition-[width,height] ${layoutClass}`} ${opened !== null && layoutClass === SELECT_CLASS ? AFTER_COVER : ""} hover:text-blue-700 ${background}`}
      onMouseEnter={() => setHoveredSection(section)}
      onMouseLeave={() => setHoveredSection(null)}
    >
      <SectionOverlay
        section={section}
        dismissed={opened !== null}
        onClick={onOpen}
        onFocusChange={(focused) => setHoveredSection(focused ? section : null)}
      />

      <ReactLenis
        ref={lenisRef}
        className={`relative z-10 transition-[opacity,translate] ${ENTRANCE_CLASS} ${
          imagesShown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        } w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden`}
        options={{
          ...SCROLL_OPTIONS,
          orientation: "vertical",
          gestureOrientation: "both",
          smoothWheel: true,
          infinite: smoothTouch,
          syncTouch: smoothTouch,
          autoResize: true,
        }}
      >
        <BreakGalleryOnScroll onScroll={breakGallery} />
        <div className="flex flex-col items-start w-full px-5.5">
          {[...projects, ...(smoothTouch ? projects.slice(0, 1) : [])].map(
            (p, n) => {
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
                  section={section}
                  panelHovered={pointerOver === section}
                  expanded={expanded[i] ?? false}
                  onExpand={() => expandCover(i)}
                  onStepImage={(delta) => stepImage(i, delta)}
                  onEnter={() => enterCover(i)}
                  muted={!(i === active && soundOn)}
                  alt={mediaAlt(p.title, media, frame, images.length)}
                  morph={n === i}
                  repeat={n !== i}
                  current={n === i && i === active}
                  priority={n === 0}
                  layoutClass={layoutClass}
                />
              ) : null;
            },
          )}
        </div>
      </ReactLenis>

      {shown && (
        <div
          inert={opened !== section}
          className={`pointer-events-none absolute inset-x-0 top-[62.5%] z-10 flex flex-col gap-y-2 px-5.5 transition-opacity ${REVEAL_CLASS} ${
            opened === section
              ? justPicked
                ? AFTER_SELECT
                : layoutClass === SWITCH_CLASS
                  ? AFTER_SWITCH
                  : ""
              : "opacity-0"
          }`}
        >
          <InfoLayout
            title={shown.title}
            titleHref={shown.slug ? `/${section}/${shown.slug}` : undefined}
            onTitleClick={() =>
              shown.slug && setDetailFrame(shown.slug, frames[active] ?? 0)
            }
            model={section === "personal" ? shown.client : undefined}
            client={section === "commissioned" ? shown.client : undefined}
            agency={shown.agency}
            frame={(frames[active] ?? 0) + 1}
            total={shownImages.length}
          />
        </div>
      )}

      {showSoundToggle && (
        <div
          className={`hidden lg:grid fixed bottom-0 inset-x-0 z-40 grid-cols-4 pointer-events-none transition-opacity ${REVEAL_CLASS} starting:opacity-0 ${
            justPicked ? AFTER_SELECT : ""
          }`}
        >
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
            {soundOn ? "Sound Off" : "Play Sound"}
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
  const opened = useOpenedSection();
  const layoutClass = useColumnTempo(opened);
  const { stacked, turning, setStacked } = useMobileStack(opened);

  const pick = (section: Exclude<Section, null>) => {
    const slid =
      opened === null &&
      slideIntoSection(
        section,
        () => {
          setOpenedSection(section);
          setStacked(false);
        },
        () => setHash(section),
      );
    if (!slid) setHash(section);
  };

  useEffect(() => clearReturn(), []);

  const hash = useHash();

  useEffect(() => {
    if (hash === "personal" || hash === "commissioned") setOpenedSection(hash);
  }, [hash]);

  const [jumpSlug, setJumpSlug] = useState<string | null>(null);

  const prompt = useMemo(() => landingWords(landingText), [landingText]);
  const landing = useLandingReveal(prompt.length);

  const hovered = useHoveredSection();

  useEffect(() => () => setHoveredSection(null), []);

  const overlayUp = hash === "about" || hash === "index";
  useEffect(() => {
    if (opened !== null || overlayUp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const section =
        e.key === "ArrowLeft"
          ? "personal"
          : e.key === "ArrowRight"
            ? "commissioned"
            : null;
      if (!section) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      document
        .querySelector<HTMLElement>(`[data-section-trigger="${section}"]`)
        ?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opened, overlayUp]);

  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (opened !== null) heading.current?.focus({ preventScroll: true });
  }, [opened]);

  return (
    <>
      <main inert={overlayUp}>
        <h1
          ref={heading}
          tabIndex={-1}
          aria-hidden={opened === null}
          className="sr-only"
        >
          {SITE_TITLE}, {SITE_DESCRIPTION}
        </h1>
        <section
          className={`font-selecta relative flex ${stacked ? "flex-col" : "flex-row"} lg:flex-row w-screen h-dvh overflow-hidden bg-background`}
        >
          <Strip
            section="personal"
            projects={personal}
            fallbackSrc="/personal_placeholder.png"
            opened={opened}
            onOpen={() => pick("personal")}
            scrollToSlug={jumpSlug}
            onScrolled={() => setJumpSlug(null)}
            muteSound={hash === "about" || hash === "index"}
            imagesShown={landing.images}
            layoutClass={layoutClass}
            stacked={stacked}
            turning={turning}
          />
          <Strip
            section="commissioned"
            projects={commissioned}
            fallbackSrc="/personal_placeholder.png"
            opened={opened}
            onOpen={() => pick("commissioned")}
            scrollToSlug={jumpSlug}
            onScrolled={() => setJumpSlug(null)}
            muteSound={hash === "about" || hash === "index"}
            imagesShown={landing.images}
            layoutClass={layoutClass}
            stacked={stacked}
            turning={turning}
          />

          <LandingPrompt
            prompt={prompt}
            dismissed={opened !== null}
            words={landing.words}
            hovered={hovered}
          />
        </section>
      </main>

      <InfoOverlay open={hash === "about"} onDismiss={() => setHash("")}>
        <AboutSection about={about} open={hash === "about"} />
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
          open={hash === "index"}
        />
      </InfoOverlay>

      <UnderConstruction active={underConstruction} />
    </>
  );
}
