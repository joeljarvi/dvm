"use client";

import { useRegisterModal } from "@/lib/modalStack";

// A sheet the height of the viewport that slides up from the bottom edge. Home
// shows About and Index in one of these rather than navigating to their pages.
// It stays mounted so it can animate back down on close — the content is handed
// in already chosen, so it lingers through the slide-out rather than vanishing.
export default function InfoOverlay({
  open,
  onDismiss,
  children,
  panelClassName = "inset-x-0 h-dvh",
  shadow = true,
}: {
  open: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
  /** Position + size of the sliding panel itself. Defaults to the full-width,
   * full-height sheet About and the full index use; a smaller overlay (e.g.
   * the commissioned/Home client index) passes its own. */
  panelClassName?: string;
  /** The panel's drop shadow — off for the index's slimmer sidebar. */
  shadow?: boolean;
}) {
  // Joins the modal stack while open, so the nav's shared Escape handling pops
  // it like any other layer. No label — it carries no close button of its own.
  useRegisterModal(open, onDismiss);

  return (
    <div
      className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close"
        onClick={onDismiss}
        className={`absolute inset-0 bg-background/30 transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute ${panelClassName} bg-background/70 backdrop-blur-sm ${shadow ? "shadow-2xl" : ""} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* A faint noise grain over the translucent background, so the sheet
            reads as a sheet of paper rather than flat glass. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* `data-lenis-prevent` so the sheet scrolls natively — the root Lenis
            would otherwise capture the wheel and touch and this would sit stuck. */}
        <div
          data-lenis-prevent
          className="relative h-full w-full overflow-y-auto overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
