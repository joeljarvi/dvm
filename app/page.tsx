"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import PanelClient from "@/components/PanelClient";
import type { View } from "@/lib/types";
import AboutSection from "@/components/AboutSection";
import IndexSection from "@/components/IndexSection";
import { clients, models, title, year } from "@/lib/data";

function pathToView(path: string): View {
  const slug = path.replace(/^\//, "");
  if (slug === "personal" || slug === "commissioned") return slug;
  return null;
}

export default function Home() {
  const [view, setViewState] = useState<View>(null);
  const [hovered, setHovered] = useState<"personal" | "commissioned" | null>(
    null,
  );
  const [projectOpen, setProjectOpenState] = useState<
    "personal" | "commissioned" | null
  >(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);

  function setProjectOpen(panel: "personal" | "commissioned", open: boolean) {
    setProjectOpenState(open ? panel : null);
  }

  const ease = [0.4, 0, 0.2, 1] as const;

  function setView(next: View) {
    setViewState(next);
    window.history.pushState(null, "", next ? `/${next}` : "/");
  }

  function toggle(target: View) {
    setView(view === target ? null : target);
  }

  useEffect(() => {
    function onPopState() {
      setViewState(pathToView(window.location.pathname));
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="font-selecta">
      <section className="relative flex w-full overflow-hidden">
        {/* Buttons always visible at section level */}
        <Button
          className={`absolute top-0 left-0 z-60 hover:text-pink-400 ${hovered === "personal" ? "text-pink-400" : ""} {view === "personal" ? "text-pink-400" : ""}`}
          onClick={() => {
            if (view === "commissioned" && projectOpen === "commissioned") {
              setProjectOpen("commissioned", false);
              setTimeout(() => setView("personal"), 600);
            } else {
              toggle("personal");
            }
          }}
        >
          personal
        </Button>
        {(view === "personal" || view === "commissioned") && (
          <Button
            className="absolute top-0 left-1/2 -translate-x-1/2 z-60 hover:text-pink-400"
            onClick={() => {
              if (itemDetailOpen) {
                setItemDetailOpen(false);
              } else if (projectOpen) {
                setProjectOpen(projectOpen, false);
              } else {
                setView(null);
              }
            }}
          >
            back
          </Button>
        )}
        <Button
          className={`absolute top-0 right-0 z-60 hover:text-pink-400 ${hovered === "commissioned" ? "text-pink-400" : ""} {view === "commissioned" ? "text-pink-400" : ""}`}
          onClick={() => {
            if (view === "personal" && projectOpen === "personal") {
              setProjectOpen("personal", false);
              setTimeout(() => setView("commissioned"), 600);
            } else {
              toggle("commissioned");
            }
          }}
        >
          commissioned
        </Button>

        {/* LEFT (PERSONAL) */}
        <motion.div
          className="overflow-hidden cursor-pointer bg-neutral-200"
          initial={{ x: "-100%" }}
          animate={{
            x: 0,
            width:
              view === "commissioned"
                ? "0%"
                : view === "personal"
                  ? "100%"
                  : "50%",
          }}
          transition={{ duration: 0.6, ease }}
          onClick={() => toggle("personal")}
          onMouseEnter={() => setHovered("personal")}
          onMouseLeave={() => setHovered(null)}
        >
          <PanelClient
            view={view}
            panel="personal"
            list={models}
            title={title}
            year={year}
            projectOpen={projectOpen === "personal"}
            setProjectOpen={(open) => setProjectOpen("personal", open)}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
          />
        </motion.div>

        {/* RIGHT (COMMISSIONED) */}
        <motion.div
          className="overflow-hidden cursor-pointer bg-neutral-300"
          initial={{ x: "100%" }}
          animate={{
            x: 0,
            width:
              view === "personal"
                ? "0%"
                : view === "commissioned"
                  ? "100%"
                  : "50%",
          }}
          transition={{ duration: 0.6, ease }}
          onClick={() => toggle("commissioned")}
          onMouseEnter={() => setHovered("commissioned")}
          onMouseLeave={() => setHovered(null)}
        >
          <PanelClient
            view={view}
            panel="commissioned"
            list={clients}
            title={title}
            year={year}
            projectOpen={projectOpen === "commissioned"}
            setProjectOpen={(open) => setProjectOpen("commissioned", open)}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
          />
        </motion.div>

        <Button
          className={`absolute bottom-0 left-0 z-60 hover:text-pink-400 ${aboutOpen ? "text-pink-400" : "text-foreground"}`}
          onClick={() => setAboutOpen((o) => !o)}
        >
          about
        </Button>

        <Button
          className={`absolute bottom-0 right-0 z-60 hover:text-pink-400 ${indexOpen ? "text-pink-400" : "text-foreground"}`}
          onClick={() => setIndexOpen((o) => !o)}
        >
          index
        </Button>

        {/* ABOUT OVERLAY — left half, slides from bottom */}
        <motion.div
          className="absolute bottom-0 left-0 w-full lg:w-1/4 h-full z-40 bg-neutral-100"
          initial={{ y: "100%" }}
          animate={{ y: aboutOpen ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        >
          {aboutOpen && <AboutSection />}
        </motion.div>

        {/* INDEX OVERLAY — right half, slides from bottom */}
        <motion.div
          className="absolute bottom-0 right-0 w-full lg:w-1/4 h-full z-50 bg-neutral-200"
          initial={{ y: "100%" }}
          animate={{ y: indexOpen ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        >
          {indexOpen && <IndexSection />}
        </motion.div>
      </section>
    </div>
  );
}
