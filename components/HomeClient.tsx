"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  ViewTransition,
} from "react";
import { flushSync } from "react-dom";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
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
    // The cover's alt text, set on the cover field, applies wherever the
    // same image also sits in the gallery without one of its own.
    const inGallery = media.find((m) => m.url === project.coverImageUrl);
    const cover: ProjectMedia = inGallery
      ? { ...inGallery, alt: inGallery.alt ?? project.coverAlt }
      : { url: project.coverImageUrl, type: "image", alt: project.coverAlt };
    return [cover, ...media.filter((m) => m.url !== project.coverImageUrl)];
  }
  return media.length ? media : [{ url: fallbackSrc, type: "image" }];
}

// Leaving landing mode, the covers' gaps settle first — quickly, on the
// swap's curve (GAP_STEP) — and only then do the columns resize,
// carrying the cover into place: AFTER_COVER holds them back for that first
// step, and the cover's growth to its open size (its padding) with them.
// Desktop only: on a phone the cover fills its column, there's no gap to
// settle, and the columns move at once. Coming back into landing mode, and
// swapping columns, it all moves at once.
const AFTER_COVER = "lg:delay-(--motion-cover-step)";
// The gap step's tempo, on desktop (see AFTER_COVER); on mobile the gaps
// keep the panels' own.
const GAP_STEP =
  "lg:duration-(--motion-cover-step) lg:ease-(--motion-ease-switch)";

// Either side of a cover, across its column: in landing mode the gap facing
// the other panel ("inner") takes a third of what the outer one does,
// drawing the two covers together. Open, the two even out — the cover
// centred. Evening out rather than closing means only the outer gap
// changes, so the cover glides across; closing both at once let flexbox
// share out the shrinking space unevenly, and the cover lurched. (Where the
// cover fills its column — a phone — there's no space to share, and no
// gap.)
function landingGap(
  section: Exclude<Section, null>,
  side: "before" | "after",
  landingMode: boolean,
  tempo: string,
) {
  const inner =
    (section === "personal" && side === "after") ||
    (section === "commissioned" && side === "before");
  // Desktop only: on mobile the landing stage's padding sets the spacing
  // (see LANDING_STAGE_CLASS).
  const grow = landingMode && !inner ? "grow lg:grow-3" : "grow";
  return `basis-0 shrink-0 ${grow} transition-[flex-grow] ${tempo}`;
}

/**
 * Mobile's panels: stacked in landing mode, so picking one grows it down (or
 * up) the screen; once it has filled it, they turn to a row — Personal left,
 * Commissioned right — with no transition for that one frame, the closed
 * panel being nothing either way. From then on, swapping slides Personal in
 * from the left and Commissioned from the right, like desktop's. (Desktop is
 * always a row: its classes override these.)
 */
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
  // Back in landing mode (a reload aside, nothing leads there now), stacked
  // again.
  const [prevOpened, setPrevOpened] = useState(opened);
  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened === null) setStacked(true);
  }
  // Transitions back on once the turned layout has painted.
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

/**
 * Mobile, a section picked out of landing mode: rather than growing down the
 * screen, the landing view slides away sideways as the chosen section slides
 * in — Personal from the left, Commissioned from the right, the way they
 * swap from then on — and the chosen cover itself glides across and grows
 * into its place there: its media named for the transition, so it's lifted
 * out of the page and morphed from its landing place and size to its open
 * ones (every other name held off — see html[data-home-slide] in
 * globals.css). A view transition: the landing view is snapshotted, the
 * page switches straight to the opened row (its own transitions held off —
 * see html[data-home-slide] in globals.css), and the two snapshots slide.
 * `after` runs once it's done — the hash write, which Next's router hears
 * and would answer with a view transition of its own, cutting this one
 * short. Where view transitions aren't supported (and on desktop), false,
 * and nothing done: the caller opens it the usual way.
 */
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
  // Already on its way: a tap reaches the panel twice (its button, then the
  // panel it bubbles to), and a second transition would cut the first short.
  if (root.dataset.homeSlide) return true;
  root.dataset.homeSlide = section === "personal" ? "from-left" : "from-right";
  // Its box, the same element before and after, so it's one morph (the
  // media itself snapshots blank in WebKit).
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

/**
 * How the columns move when the open one changes: unhurried, like the
 * landing, when one is first picked (or landing mode comes back), and brief
 * when swapping straight from one to the other. Held until the next change,
 * so a transition keeps its timing all the way through.
 */
function useColumnTempo(opened: Section) {
  const [prev, setPrev] = useState(opened);
  const [tempo, setTempo] = useState(SELECT_CLASS);
  if (opened !== prev) {
    setPrev(opened);
    setTempo(prev !== null && opened !== null ? SWITCH_CLASS : SELECT_CLASS);
  }
  return tempo;
}

// A section open: covers are capped by the screen (its width less the
// column's gutters), not by their column. Swapping Personal and
// Commissioned, one column narrows to nothing as the other widens, and a
// cover capped by its column shrank and grew with it; capped by the screen,
// it keeps its size and the column just slides across it, cropping — the
// view moves, the picture doesn't scale. Held centred in its column (the
// frame's justify-center, which lets it overflow both sides evenly).
const OPEN_COVER_WIDTH = "max-w-[calc(100vw-2.75rem)] shrink-0";
const OPEN_MEDIA_WIDTH = "max-w-[calc(100vw-2.75rem)]";

export const COVER_STAGE_CLASS = "flex flex-col p-0 lg:py-28";

// Desktop, a cover's three sizes step down by the same amount of padding
// each time — full screen on the project page (p-5.5, 22px), the open
// column's scroll (py-28, 112px), and landing mode (py-50.5, 202px): +90px
// a step, so each step reads as the same distance. Landing's stage,
// otherwise COVER_STAGE_CLASS.
// Mobile, the panels stacked: each cover held off its outer edge — the
// screen's top for Personal, its bottom for Commissioned — by twice what
// it's held off the other (pt-24/pb-12, 96px/48px), leaving a 96px gap
// between the two, where "Or" sits.
const LANDING_STAGE_CLASS: Record<Exclude<Section, null>, string> = {
  personal: "flex flex-col pt-24 pb-12 lg:pt-50.5 lg:pb-50.5",
  commissioned: "flex flex-col pt-12 pb-24 lg:pt-50.5 lg:pb-50.5",
};
// The frame is a size container, and the media is capped in its units
// (cqw/cqh) rather than as a percentage of the box around it. That box
// shrink-wraps the media, so a percentage there is circular — Safari
// resolves it as no cap at all, shows the image at full size, and the box's
// overflow-hidden crops it to its top-left corner.
export const COVER_FRAME_CLASS =
  "relative w-full h-full flex flex-col items-center justify-center [container-type:size]";
export const COVER_BOX_CLASS =
  "relative inline-flex max-h-full overflow-hidden";

const MEDIA_FIT =
  "block max-h-[100cqh] w-auto h-auto object-contain object-center pointer-events-none";
export const MEDIA_CLASS = `${MEDIA_FIT} max-w-[100cqw]`;

// The view-transition name a project's cover media and its project page's
// full-screen media share — so following a title, the one grows into the
// other while the rest of the page crossfades (see globals.css). One per
// project, held for good: a single name passed from cover to cover as they
// scroll in would sit on two of them for a moment, which React rejects.
export const morphName = (project: Project) =>
  `project-media-${(project.slug ?? project.title).replace(/[^\w-]/g, "-")}`;

export const mediaSrc = (src: string) =>
  src.startsWith("/") ? src : sanityImage(src, { w: 1400 });

// Whether the pointer can hover — not on touch screens, where landing mode's
// hover-to-play would leave a video never playing.
const HOVER_QUERY = "(hover: hover)";
function useCanHover() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(HOVER_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(HOVER_QUERY).matches,
    () => true,
  );
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
  /** Which column it's in — which of its landing gaps faces the other. */
  section: Exclude<Section, null>;
  /** Its panel is under the pointer. */
  panelHovered: boolean;
  expanded: boolean;
  onExpand: () => void;
  onStepImage: (delta: number) => void;
  onEnter: () => void;
  muted?: boolean;
  /** The media's alt text (see mediaAlt). */
  alt: string;
  /** Takes the project's morph name (see morphName) — every cover but the
   * repeat of the first at the end of the loop, which would duplicate it. */
  morph?: boolean;
  /** The repeat of the first cover that closes the loop — a copy, so hidden
   * from screen readers and the tab order. */
  repeat?: boolean;
  /** The cover its column is showing — the one that glides into place when
   * the column is picked on mobile (see slideIntoSection). */
  current?: boolean;
  /** The column's first cover — on screen from the start, so loaded first
   * and in full; the rest wait until they're scrolled near. */
  priority?: boolean;
  /** Timing for the column's layout change (see useColumnTempo). */
  layoutClass: string;
}) {
  const src = media.url;

  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, 0.5);
  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  // Capped like the box around it. By its column into and out of landing
  // mode (the select tempo), so it grows and shrinks with the column; by the
  // screen when swapping columns (see OPEN_COVER_WIDTH), so it doesn't. The
  // two agree whenever the tempo changes over — the column is full width or
  // closed — so the cap swaps without a jump, and needs no transition.
  const capByColumn = landingMode || layoutClass === SELECT_CLASS;
  // The cap eases only into and out of landing mode (mobile's half-width
  // landing cover growing to full). Swapping columns it snaps: both covers
  // at full size from the start, sliding in alike — eased, the incoming one
  // grew from nothing on one side and not the other (WebKit snaps between
  // column and screen units anyway).
  const capEase = capByColumn ? `transition-[max-width] ${layoutClass}` : "";
  // Just out of landing mode: its gaps settle first, quickly, and it grows
  // after (see AFTER_COVER); otherwise all in step with the columns.
  const justOpened = !landingMode && layoutClass === SELECT_CLASS;
  const gapTempo = justOpened ? `${layoutClass} ${GAP_STEP}` : layoutClass;
  // Mobile landing: the panels stacked, the cover held to half its column's
  // width, easing out to full as its panel opens.
  const mediaClass = `${MEDIA_FIT} ${
    landingMode
      ? "max-w-[50cqw] lg:max-w-[100cqw]"
      : capByColumn
        ? "max-w-[100cqw]"
        : OPEN_MEDIA_WIDTH
  } ${capEase}`;

  // A video plays throughout once its column is open, but in landing mode
  // only while its panel is hovered — paused where it was when it isn't.
  // Without hover (touch screens) it just plays.
  const video = useRef<HTMLVideoElement>(null);
  const canHover = useCanHover();
  const playing = !landingMode || panelHovered || !canHover;
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) el.play().catch(() => {});
    else el.pause();
  }, [playing, src]);
  // Its sound fades in and out (and is muted by this, not the prop below).
  useSoundFade(video, muted, src);

  const mediaNode =
    media.type === "file" ? (
      <video
        ref={video}
        src={src}
        className={mediaClass}
        // Set from the start where it plays from the start — iOS won't load
        // a video's first frame otherwise.
        autoPlay={playing}
        preload={priority ? "auto" : "metadata"}
        // Starts muted, to autoplay; useSoundFade unmutes it.
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
      // Desktop landing mode: blurred and dimmed, until its panel is hovered
      // (or focused). The blur sits on this, the full-height stage, filled
      // with the page's background — not on the image, whose box crops — so
      // the image's edges soften into the page, as the About bio image does
      // (see BlurredPreview). The hover runs on the brisker reveal; leaving
      // landing mode, the column's own timing. Mobile, with no hover, stays
      // sharp.
      className={`relative shrink-0 w-full group bg-background ${landingMode ? "h-[50dvh] lg:h-screen" : "h-screen"} ${
        // The blur and dimming ease only in landing mode, on hover. Leaving
        // it they drop at once: an animating filter has Safari draw the
        // cover on a layer of its own, clipped at its edge — a hard line
        // round it as the columns move. (The chosen one is sharp already,
        // from the hover.)
        landingMode
          ? `transition-[height,padding,filter,opacity] ${REVEAL_CLASS}`
          : `transition-[height,padding] ${layoutClass}`
      } ${
        // Open: no filter at all, not even blur(0) — WebKit won't snapshot
        // a view-transition-named element under a filtered one (the slide
        // in, the morph to a project page).
        landingMode
          ? "lg:blur-xs lg:opacity-40 lg:group-hover/strip:blur-[0px] lg:group-hover/strip:opacity-100 lg:group-focus-within/strip:blur-[0px] lg:group-focus-within/strip:opacity-100"
          : ""
      } ${landingMode ? LANDING_STAGE_CLASS[section] : `${COVER_STAGE_CLASS} ${justOpened ? AFTER_COVER : ""}`} max-w-full mx-auto`}
    >
      {/* Its gaps run across its column on desktop (panels side by side),
          down it on mobile (panels stacked in landing mode). */}
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
            // Out of the tab order in landing mode, where each panel is one
            // stop (see SectionOverlay).
            tabIndex={landingMode || repeat ? -1 : 0}
            aria-label={`Cycle images of ${project.title}`}
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleClick}
          />

          {/* Wrapped the same way for good — adding or dropping the wrapper
              would remount the media, and a remounted video sits at the
              browser's default size until its metadata is back: a visible
              jump. */}
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

  /** Landing reveal: the covers have come in. */
  imagesShown?: boolean;

  layoutClass: string;
  /** Mobile: the panels stacked (landing mode, and until the chosen one has
   * opened) rather than in a row. */
  stacked: boolean;
  /** The moment they turn from one to the other: no transition, so the
   * closed panel — nothing either way — doesn't animate across. */
  turning: boolean;
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

  // Back from a project page: open on its cover and the image it was on,
  // so the full-screen image shrinks back into it (see morphName).
  const [returnTo] = useState(() => {
    const r = peekReturn();
    const index = r ? projects.findIndex((p) => p.slug === r.slug) : -1;
    return index < 0 ? null : { index, frame: r!.frame };
  });
  const [active, setActive] = useState(returnTo?.index ?? 0);
  const [frames, setFrames] = useState<number[]>(() =>
    projects.map((_, i) => (i === returnTo?.index ? returnTo.frame : 0)),
  );
  // Scrolled there before the first paint — inside the view transition's
  // new snapshot, so the morph lands on the cover where it sits.
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

  // A scroll container is a tab stop of its own in some browsers; this one
  // is scrolled by the keys below instead, so it's kept out of the order.
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

  // Open column: ← and → step through the shown project's images, the way
  // clicking its cover does; Enter follows its title to the project page.
  // Not under About or Index (when the sound is muted for them too), nor
  // when a control has focus and Enter is its own.
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
        // The title's own link, so the page opens just as it does on a click.
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
      // One cover on, snapped to the middle of the column: from the cover
      // nearest the middle now, its own height up or down (they're all the
      // same height), less however far off-centre it sits.
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

  // Desktop: side by side — half the screen each in landing mode; the chosen
  // one grows across it, the other closes to nothing, and swapping slides
  // side to side. Mobile: stacked in landing mode, the chosen one growing
  // down (or up) to fill the screen; once it has, the panels turn to a row
  // (see useMobileStack) — Personal left, Commissioned right — and swap side
  // to side from then on, as on desktop.
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

  // Mobile: a gutter on the edge facing the other panel — Personal's right,
  // Commissioned's left — so swapping, the two covers slide past each other
  // with a gap between them rather than butting up at the seam. The width of
  // the covers' own margin, so at rest it's never seen. Page-coloured rather
  // than a clip: WebKit won't snapshot a view-transition-named cover under a
  // clipped parent.
  const seam = `max-lg:after:content-[''] max-lg:after:absolute max-lg:after:inset-y-0 max-lg:after:w-5.5 max-lg:after:z-[15] max-lg:after:bg-background max-lg:after:pointer-events-none ${
    section === "personal" ? "max-lg:after:right-0" : "max-lg:after:left-0"
  }`;

  const shown = projects[active] ?? projects[0];
  const shownImages = columnImages[active] ?? [];
  const activeMedia = shownImages[frames[active] ?? 0] ?? shownImages[0];
  // Not in landing mode — only once a column is open.
  // Just picked out of landing mode: the info and the sound button come in
  // once the columns have moved (see AFTER_SELECT).
  const justPicked = opened !== null && layoutClass === SELECT_CLASS;
  const showSoundToggle =
    opened !== null && listens && activeMedia?.type === "file";

  return (
    <div
      ref={containerRef}
      data-panel={section}
      // The other column, closed down to nothing: nothing in it to reach.
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
          })}
        </div>
      </ReactLenis>

      {shown && (
        <div
          // Shown in the open column only, fading in once the columns have
          // moved — picked out of landing mode, or swapped to (AFTER_SELECT,
          // AFTER_SWITCH); fading out at once. Out of reach while hidden too
          // — no tab stops in it.
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
          // Fades in as it appears — after the columns have moved, when just
          // picked out of landing mode (with the nav; see AFTER_SELECT).
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
  // Picking a section: on mobile, out of landing mode, it slides in (see
  // slideIntoSection); otherwise just through the hash.
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
  // Both columns have read where to come back to (see Strip); spent now.
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

  // Landing mode: ← and → move between the two panels (focusing one stands
  // in for hovering it — see SectionOverlay); Enter then opens it.
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

  // The page's heading, for screen readers, comes in once a section is
  // chosen — landing mode reads its prompt instead — and takes focus, so
  // it's announced, and tabbing carries on from the top of the section.
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (opened !== null) heading.current?.focus({ preventScroll: true });
  }, [opened]);

  return (
    <>
      {/* Under About or Index, out of reach: tabbing stays in the overlay
          (and the nav). */}
      <main inert={overlayUp}>
        {/* The same as the page's metadata. */}
        {opened !== null && (
          <h1 ref={heading} tabIndex={-1} className="sr-only">
            {SITE_TITLE}, {SITE_DESCRIPTION}
          </h1>
        )}
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
