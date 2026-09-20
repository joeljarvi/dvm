"use client";

import { useRegisterModal } from "@/lib/modalStack";

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

  panelClassName?: string;

  shadow?: boolean;
}) {
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
        className={`absolute ${panelClassName} bg-background/60 backdrop-blur-xs ${shadow ? "shadow-2xl" : ""} transition-opacity duration-500 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div
          data-lenis-prevent
          data-open={open}
          className="reveal-stagger relative h-full w-full overflow-y-auto overscroll-contain scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
