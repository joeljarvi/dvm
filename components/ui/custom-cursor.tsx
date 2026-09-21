"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type Ref,
} from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

type CustomCursorContextValue = {
  color: string;
  registerTarget: (id: string, rect: Rect | null) => void;
};

const CustomCursorContext = createContext<CustomCursorContextValue | null>(
  null,
);

function useCustomCursorContext(component: string) {
  const ctx = useContext(CustomCursorContext);
  if (!ctx) {
    throw new Error(`<${component}> must be rendered inside <CustomCursor>`);
  }
  return ctx;
}

const SPRING = { stiffness: 500, damping: 40, mass: 0.5 };
// Targets much bigger than a button (a full-bleed image, a full-panel
// backdrop) would otherwise morph the ring up to their exact size — cap it
// so it reads as a cursor growing slightly on hover, not a giant outline of
// the whole element.
const MAX_RING_SIZE = 28;

/**
 * A cursor dot that follows the pointer with spring physics and morphs into
 * a ring around whichever `CustomCursorTarget` is underneath it.
 *
 * `layout="fixed"` (default) tracks the pointer across the whole viewport —
 * use this in the app. `layout="demo"` scopes tracking and rendering to this
 * component's own box instead, for previewing it inside a bounded card.
 *
 * `ring={false}` turns off the hover morph entirely — the dot stays a fixed
 * `dotWidth` x `dotHeight`, always filled with `color`, and just follows the
 * pointer.
 *
 * `pulsing` breathes the dot's scale up and down on a loop — flip it on for
 * the windows where something's loading (the initial intro, a drawer's
 * content staggering in) and off once it's settled.
 */
export function CustomCursor({
  className,
  color = "#000000",
  layout = "fixed",
  ring = true,
  dotWidth = 10,
  dotHeight = 10,
  hoverWidth,
  hoverHeight,
  pulsing = false,
  children,
  ...props
}: ComponentProps<"div"> & {
  color?: string;
  layout?: "fixed" | "demo";
  ring?: boolean;
  dotWidth?: number;
  dotHeight?: number;
  // Size the dot grows to over a `CustomCursorTarget` with `grow` set, when
  // `ring` is off. Defaults to dotWidth/dotHeight (no change) if omitted.
  hoverWidth?: number;
  hoverHeight?: number;
  pulsing?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<string, Rect>());
  const [pointerFine, setPointerFine] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
  );
  const [visible, setVisible] = useState(false);
  const [ringed, setRinged] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setPointerFine(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (layout !== "fixed") return;
    document.documentElement.classList.toggle("custom-cursor", pointerFine);
    return () => document.documentElement.classList.remove("custom-cursor");
  }, [layout, pointerFine]);

  // Position tracks the raw pointer with no spring — any lag here reads as
  // the cursor falling behind. Only size/shape (the ring morph) eases.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(dotWidth);
  const height = useMotionValue(dotHeight);
  const radius = useMotionValue(Math.min(dotWidth, dotHeight) / 2);
  const springWidth = useSpring(width, SPRING);
  const springHeight = useSpring(height, SPRING);
  const springRadius = useSpring(radius, SPRING);

  const registerTarget = useCallback((id: string, rect: Rect | null) => {
    if (rect) targets.current.set(id, rect);
    else targets.current.delete(id);
  }, []);

  useEffect(() => {
    if (layout === "fixed" && !pointerFine) return;
    const container = containerRef.current;
    if (!container) return;
    const scope: Window | HTMLDivElement =
      layout === "demo" ? container : window;

    const move = (e: PointerEvent) => {
      setVisible(true);
      const origin =
        layout === "demo" ? container.getBoundingClientRect() : null;

      const targetEl = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-cursor-target]",
      );
      const rect = targetEl
        ? targets.current.get(targetEl.dataset.cursorTarget!)
        : null;

      if (ring && rect) {
        setRinged(true);
        const natural = Math.max(rect.width, rect.height) * 1.15;
        const capped = natural > MAX_RING_SIZE;

        // A small control (icon button) reads better as a magnetic snap to
        // its center. A target bigger than the ring itself — a full-bleed
        // image, a full-panel backdrop — should just let the ring follow the
        // actual pointer; snapping it to the center makes it feel stuck.
        if (capped) {
          x.set(e.clientX - (origin?.left ?? 0));
          y.set(e.clientY - (origin?.top ?? 0));
        } else {
          x.set(rect.left + rect.width / 2 - (origin?.left ?? 0));
          y.set(rect.top + rect.height / 2 - (origin?.top ?? 0));
        }
        const ringSize = capped ? MAX_RING_SIZE : natural;
        width.set(ringSize);
        height.set(ringSize);
        radius.set(
          capped ? MAX_RING_SIZE / 2 : Math.min(rect.width, rect.height) / 2,
        );
      } else {
        setRinged(false);
        x.set(e.clientX - (origin?.left ?? 0));
        y.set(e.clientY - (origin?.top ?? 0));

        // Not morphing into a ring, but a target can still opt in (via
        // `grow` on CustomCursorTarget) to have the dot grow in place.
        const grow = !ring && targetEl?.dataset.cursorGrow === "true";
        const w = grow ? (hoverWidth ?? dotWidth) : dotWidth;
        const h = grow ? (hoverHeight ?? dotHeight) : dotHeight;
        width.set(w);
        height.set(h);
        radius.set(Math.min(w, h) / 2);
      }
    };

    const leave = () => setVisible(false);

    scope.addEventListener("pointermove", move as EventListener);
    scope.addEventListener("pointerleave", leave);
    return () => {
      scope.removeEventListener("pointermove", move as EventListener);
      scope.removeEventListener("pointerleave", leave);
    };
  }, [
    layout,
    pointerFine,
    ring,
    dotWidth,
    dotHeight,
    hoverWidth,
    hoverHeight,
    x,
    y,
    width,
    height,
    radius,
  ]);

  const ctx = useMemo<CustomCursorContextValue>(
    () => ({ color, registerTarget }),
    [color, registerTarget],
  );

  return (
    <CustomCursorContext.Provider value={ctx}>
      <div
        ref={containerRef}
        data-slot="custom-cursor"
        className={cn(
          "relative",
          layout === "demo" && "overflow-hidden [&_*]:cursor-none",
          className,
        )}
        {...props}
      >
        {children}
        <motion.div
          aria-hidden
          data-slot="custom-cursor-dot"
          className="hidden lg:block pointer-events-none top-0 left-0 z-950 rounded-full"
          animate={pulsing ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={
            pulsing
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2, ease: "easeOut" }
          }
          style={{
            position: layout === "demo" ? "absolute" : "fixed",
            width: springWidth,
            height: springHeight,
            borderRadius: springRadius,
            translateX: x,
            translateY: y,
            x: "-50%",
            y: "-50%",
            opacity: visible ? 1 : 0,
            backgroundColor: ringed ? "transparent" : color,
            border: `1.5px solid ${color}`,
            transition:
              "background-color 150ms ease-out, opacity 150ms ease-out",
          }}
        />
      </div>
    </CustomCursorContext.Provider>
  );
}

const targetSizes = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      sm: "size-10",
      md: "size-14",
      lg: "size-20",
    },
  },
});

export function CustomCursorTarget({
  className,
  size,
  asChild = false,
  grow = false,
  children,
  ...props
}: ComponentProps<"div"> &
  VariantProps<typeof targetSizes> & { asChild?: boolean; grow?: boolean }) {
  const { registerTarget } = useCustomCursorContext("CustomCursorTarget");
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const Comp = asChild ? Slot.Root : "div";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      registerTarget(id, {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      registerTarget(id, null);
    };
  }, [id, registerTarget]);

  return (
    <Comp
      ref={ref as Ref<HTMLDivElement>}
      data-slot="custom-cursor-target"
      data-cursor-target={id}
      data-cursor-grow={grow || undefined}
      className={cn(targetSizes({ size }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
