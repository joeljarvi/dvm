"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import type { View } from "@/lib/types";

const ease = [0.4, 0, 0.2, 1] as const;

interface NavProps {
  view: View;
  hovered: "personal" | "commissioned" | null;
  projectOpen: "personal" | "commissioned" | null;
  aboutOpen: boolean;
  indexOpen: boolean;
  itemDetailOpen: boolean;
  onPersonalClick: () => void;
  onCommissionedClick: () => void;
  onAboutClick: () => void;
  onIndexClick: () => void;
  onInfoClick: () => void;
  infoVisible: boolean;
  onCloseOrBack: () => void;
}

export default function Nav({
  view,
  hovered,
  projectOpen,
  aboutOpen,
  indexOpen,
  itemDetailOpen,
  onPersonalClick,
  onCommissionedClick,
  onAboutClick,
  onIndexClick,
  onInfoClick,
  infoVisible,
  onCloseOrBack,
}: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const centerLabel = itemDetailOpen ? "close" : "back";

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:contents">
        <Button
          className={`absolute  left-0 top-0 z-60 hover:text-pink-400 ${hovered === "personal" ? "text-pink-400" : ""}`}
          onClick={onPersonalClick}
        >
          personal
        </Button>

        {view && !itemDetailOpen && (
          <Button
            className={`absolute top-0 left-1/2 -translate-x-1/2 z-60 hover:text-pink-400`}
            onClick={onCloseOrBack}
          >
            back
          </Button>
        )}

        <Button
          className={`absolute top-0 right-0 z-60 hover:text-pink-400 ${hovered === "commissioned" ? "text-pink-400" : ""}`}
          onClick={onCommissionedClick}
        >
          commissioned
        </Button>

        <Button
          className={`absolute bottom-0 ${itemDetailOpen ? "left-5" : projectOpen && view === "commissioned" ? "left-2.5" : "left-0"} z-70 hover:text-pink-400 ${aboutOpen ? "text-pink-400" : "text-background"}`}
          onClick={onAboutClick}
        >
          about
        </Button>

        {(view || projectOpen) && (
          <Button
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 z-60  gap-x-1 hover:text-pink-400 ${infoVisible ? "text-pink-400" : "text-background"}`}
            onClick={onInfoClick}
          >
            info{" "}
            <div
              className={`w-3.5 aspect-square ${infoVisible ? "bg-pink-400 text-pink-400 " : "bg-foreground  hover:bg-pink-400"}`}
            />
          </Button>
        )}

        <Button
          className={`absolute bottom-0 ${itemDetailOpen ? "right-4" : projectOpen && view === "personal" ? "right-2.5" : "right-0"} z-60 hover:text-pink-400 ${indexOpen ? "text-pink-400" : "text-background"}`}
          onClick={onIndexClick}
        >
          index
        </Button>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden">
        {!view ? (
          <>
            {/* HOME: personal + commissioned top, about + index bottom */}
            {aboutOpen || indexOpen ? (
              <Button
                className="absolute top-1 right-0 z-60"
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? "close" : "menu"}
              </Button>
            ) : (
              <div className="absolute top-1 left-0 right-0 z-60 flex justify-between ">
                <Button onClick={onPersonalClick}>personal</Button>
                <Button onClick={onCommissionedClick}>commissioned</Button>
              </div>
            )}
            <div className="absolute bottom-1 left-0 right-0 z-60 flex justify-between ">
              <Button
                className={aboutOpen ? "text-pink-400" : ""}
                onClick={onAboutClick}
              >
                about
              </Button>
              <Button
                className={indexOpen ? "text-pink-400" : ""}
                onClick={onIndexClick}
              >
                index
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* NON-HOME: back/close + menu */}
            {!menuOpen && (
              <Button
                className="absolute top-1 left-0 z-60 hover:text-pink-400"
                onClick={onCloseOrBack}
              >
                {centerLabel}
              </Button>
            )}

            <Button
              className="absolute top-1 right-0 z-60"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "close" : "menu"}
            </Button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center gap-2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease }}
                >
                  <Button
                    className="text-xl hover:text-pink-400"
                    onClick={() => {
                      onPersonalClick();
                      closeMenu();
                    }}
                  >
                    personal
                  </Button>
                  <Button
                    className="text-xl hover:text-pink-400"
                    onClick={() => {
                      onCommissionedClick();
                      closeMenu();
                    }}
                  >
                    commissioned
                  </Button>
                  <Button
                    className="text-xl hover:text-pink-400"
                    onClick={() => {
                      onAboutClick();
                      closeMenu();
                    }}
                  >
                    about
                  </Button>
                  <Button
                    className="text-xl hover:text-pink-400"
                    onClick={() => {
                      onIndexClick();
                      closeMenu();
                    }}
                  >
                    index
                  </Button>
                  <Button
                    className={`text-xl hover:text-pink-400 ${!infoVisible ? "text-pink-400" : ""}`}
                    onClick={() => {
                      onInfoClick();
                      closeMenu();
                    }}
                  >
                    info
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </>
  );
}
