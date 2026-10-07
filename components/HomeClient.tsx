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
  COVER_STEP_CLASS,
  AFTER_SELECT,
  AFTER_SWITCH,
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

// Leaving landing mode, the cover settles first — its gaps even out, its
// width eases to its open size, inside the column as it is — quickly, on the
// swap's curve (COVER_STEP_CLASS). Only then do the columns resize, carrying
// it into place (and, on mobile, the cover's height grows with its panel):
// AFTER_COVER holds them back for that first step. Coming back into landing
// mode, and swapping columns, it all moves at once.
const AFTER_COVER = "delay-(--motion-cover-step)";

// Always there, and shrunk to nothing out of landing mode rather than
// removed — so the cover glides to its place instead of jumping there.
// The gap on the side facing the other panel ("inner") takes a third of what
// the outer one does, drawing the two covers together: above and below each
// other on mobile, side by side on desktop (the frame runs as a row there).
function landingGap(
  section: Exclude<Section, null>,
  side: "before" | "after",
  landingMode: boolean,
  tempo: string,
) {
  const inner =
    (section === "personal" && side === "after") ||
    (section === "commissioned" && side === "before");
  // Out of landing mode: on mobile the gaps close. On desktop they even out
  // instead of closing — the cover ends up centred either way, but this way
  // only the outer gap changes, so the cover just glides across. Closing
  // both at once let flexbox share out the shrinking space unevenly, and
  // the cover lurched.
  const grow = landingMode ? (inner ? "grow" : "grow-3") : "grow-0 lg:grow";
  return `basis-0 shrink-0 ${grow} transition-[flex-grow] ${tempo}`;
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

// Halved on mobile only, where the landing panels split the height. On
// desktop the cover is already the size it will be once its column opens.
const LANDING_COVER_WIDTH = "max-w-1/2 lg:max-w-full";

// Desktop, a section open: covers are capped by the screen (its width less
// the column's gutters), not by their column. Swapping Personal and
// Commissioned, one column narrows to nothing as the other widens, and a
// cover capped by its column shrank and grew with it; capped by the screen,
// it keeps its size and the column just slides across it, cropping — the
// view moves, the picture doesn't scale. Held centred in its column (the
// frame's justify-center, which lets it overflow both sides evenly).
const OPEN_COVER_WIDTH =
  "max-w-full lg:max-w-[calc(100vw-2.75rem)] lg:shrink-0";
const OPEN_MEDIA_WIDTH = "max-w-[100cqw] lg:max-w-[calc(100vw-2.75rem)]";

export const COVER_STAGE_CLASS = "flex flex-col p-0 lg:py-28";
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
  priority = false,
  layoutClass,
}: {
  project: Project;
  media: ProjectMedia;

  columnOpen: boolean;
  landingMode: boolean;
  /** Which column it's in — sets which of its landing gaps faces the other. */
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

  // Capped like the box around it (half the frame in landing mode on
  // mobile), and animated with it, so the box never has to crop it
  // mid-transition.
  // Just out of landing mode (the select tempo): the cover's own step —
  // gaps, width — comes first and quick, and its height waits with the
  // columns (see AFTER_COVER). Otherwise all in step with the columns.
  const leavingLanding = !landingMode && layoutClass === SELECT_CLASS;
  const coverTempo = leavingLanding ? COVER_STEP_CLASS : layoutClass;

  const mediaClass = `${MEDIA_FIT} ${landingMode ? "max-w-[50cqw] lg:max-w-[100cqw]" : OPEN_MEDIA_WIDTH} transition-[max-width] ${coverTempo}`;

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
      aria-hidden={repeat || undefined}
      data-slug={project.slug ?? project.title}
      className={`relative shrink-0 w-full group ${landingMode ? "h-[50dvh] lg:h-screen" : `h-screen ${leavingLanding ? AFTER_COVER : ""}`} transition-[height] ${layoutClass} ${COVER_STAGE_CLASS} max-w-full mx-auto`}
    >
      <div className={`${COVER_FRAME_CLASS} lg:flex-row`}>
        <div
          aria-hidden
          className={landingGap(section, "before", landingMode, coverTempo)}
        />
        <div
          className={`${COVER_BOX_CLASS} ${landingMode ? LANDING_COVER_WIDTH : OPEN_COVER_WIDTH} transition-[max-width] ${coverTempo}`}
        >
          {/* Landing veil, over the image only — what's between the covers
              stays clear, so the section label beneath them reads sharp.
              Hovering the panel fades the whole veil out; the blur itself is
              never animated, since a changing backdrop-filter smears at the
              edges of the image. The hover runs on the brisker reveal; going
              out of landing mode keeps the column's own timing. On mobile,
              with no hover, there's no veil at all. */}
          <div
            aria-hidden
            className={`absolute inset-0 z-[5] pointer-events-none bg-background/60 backdrop-blur-xs transition-opacity ${
              landingMode
                ? `${REVEAL_CLASS} opacity-100 group-hover/strip:opacity-0 group-focus-within/strip:opacity-0 max-lg:opacity-0`
                : `${layoutClass} opacity-0`
            }`}
          />
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
          className={landingGap(section, "after", landingMode, coverTempo)}
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
      className={`group group/strip relative ${size} overflow-hidden pb-0 transition-[width,height] ${layoutClass} ${opened !== null && layoutClass === SELECT_CLASS ? AFTER_COVER : ""} hover:text-blue-700 ${background}`}
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
            layoutClass={layoutClass}
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
            layoutClass={layoutClass}
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
          open={hash === "index"}
        />
      </InfoOverlay>

      <UnderConstruction active={underConstruction} />
    </>
  );
}
