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
}: {
  open: boolean;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  // Joins the modal stack while open, so the nav's shared Escape handling pops
  // it like any other layer. No label — it carries no close button of its own.
  useRegisterModal(open, onDismiss);

  return (
    <div
      className={`fixed inset-0 z-999 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Close"
        onClick={onDismiss}
        className={`absolute inset-0 bg-background/30 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 h-dvh  bg-background shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-full w-full overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
