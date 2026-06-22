"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import PanelClient from "@/components/PanelClient";
import Nav from "@/components/Nav";
import type { View, Project } from "@/lib/types";
import AboutSection from "@/components/AboutSection";
import IndexSection from "@/components/IndexSection";

function pathToView(path: string): View {
  const slug = path.replace(/^\//, "");
  if (slug === "personal" || slug === "commissioned") return slug;
  return null;
}

export default function HomeClient({
  personalList,
  commissionedList,
  featuredCoverImageUrl,
}: {
  personalList: Project[];
  commissionedList: Project[];
  featuredCoverImageUrl?: string | null;
}) {
  const [view, setViewState] = useState<View>(null);
  const [hovered, setHovered] = useState<"personal" | "commissioned" | null>(
    null,
  );
  const [projectOpen, setProjectOpenState] = useState<
    "personal" | "commissioned" | null
  >(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [lastOpened, setLastOpened] = useState<"about" | "index" | null>(null);
  const [itemDetailOpen, setItemDetailOpen] = useState(false);
  const [infoVisible, setInfoVisible] = useState(true);

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
    <div className="font-selecta w-screen">
      <section className="relative flex w-full overflow-hidden">
        <Nav
          view={view}
          hovered={hovered}
          projectOpen={projectOpen}
          aboutOpen={aboutOpen}
          indexOpen={indexOpen}
          itemDetailOpen={itemDetailOpen}
          onPersonalClick={() => {
            if (aboutOpen || indexOpen) {
              setAboutOpen(false);
              setIndexOpen(false);
              return;
            }
            if (view === "commissioned") {
              if (projectOpen === "commissioned")
                setProjectOpen("commissioned", false);
              setView(null);
              setTimeout(() => setView("personal"), 600);
            } else {
              toggle("personal");
            }
          }}
          onCommissionedClick={() => {
            if (aboutOpen || indexOpen) {
              setAboutOpen(false);
              setIndexOpen(false);
              return;
            }
            if (view === "personal") {
              if (projectOpen === "personal") setProjectOpen("personal", false);
              setView(null);
              setTimeout(() => setView("commissioned"), 600);
            } else {
              toggle("commissioned");
            }
          }}
          onAboutClick={() => {
            setAboutOpen((o) => !o);
            setLastOpened("about");
          }}
          onIndexClick={() => {
            setIndexOpen((o) => !o);
            setLastOpened("index");
          }}
          onInfoClick={() => setInfoVisible((o) => !o)}
          infoVisible={infoVisible}
          onCloseOrBack={() => {
            if (itemDetailOpen) {
              setItemDetailOpen(false);
            } else {
              if (projectOpen) setProjectOpen(projectOpen, false);
              setView(null);
            }
          }}
        />

        {/* LEFT (PERSONAL) */}
        <motion.div
          className="overflow-hidden  shadow-lg cursor-pointer bg-neutral-200"
          initial={{ x: "0" }}
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
            list={personalList}
            year={2026}
            projectOpen={projectOpen === "personal"}
            setProjectOpen={(open) => setProjectOpen("personal", open)}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
            infoVisible={infoVisible}
          />
        </motion.div>

        {/* RIGHT (COMMISSIONED) */}
        <motion.div
          className="relative overflow-hidden cursor-pointer bg-neutral-300 "
          initial={{ x: "0%" }}
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
          {featuredCoverImageUrl && (
            <motion.img
              src={featuredCoverImageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              animate={{ opacity: view === null ? 1 : 0 }}
              transition={{ duration: 0.6, ease }}
            />
          )}
          <PanelClient
            view={view}
            panel="commissioned"
            list={commissionedList}
            year={2026}
            projectOpen={projectOpen === "commissioned"}
            setProjectOpen={(open) => setProjectOpen("commissioned", open)}
            itemDetailOpen={itemDetailOpen}
            setItemDetailOpen={setItemDetailOpen}
            infoVisible={infoVisible}
          />
        </motion.div>

        {/* PAGE SCRIM */}
        <motion.div
          className="absolute inset-0 z-35 pointer-events-none bg-black"
          animate={{ opacity: aboutOpen || indexOpen ? 0.4 : 0 }}
          transition={{ duration: 0.6, ease }}
        />

        {/* INDEX SCRIM / CLICK-CATCHER */}
        <motion.div
          className="absolute inset-0 z-45 bg-black"
          style={{ pointerEvents: aboutOpen ? "auto" : "none" }}
          animate={{ opacity: aboutOpen && indexOpen ? 0.3 : 0 }}
          transition={{ duration: 0.6, ease }}
          onClick={() => setAboutOpen(false)}
        />

        {/* ABOUT OVERLAY */}
        <motion.div
          className={`absolute left-2.5 right-2.5 bottom-0 ${
            lastOpened === "about" ? "z-50" : "z-40"
          }`}
          initial={{ y: "100%" }}
          animate={{ y: aboutOpen ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        >
          {aboutOpen && <AboutSection onClose={() => setAboutOpen(false)} />}
        </motion.div>

        {/* INDEX OVERLAY */}
        <motion.div
          className={`absolute top-16 left-2.5 lg:left-5 right-2.5 lg:right-5 bottom-8 ${
            lastOpened === "index" ? "z-50" : "z-40"
          }`}
          initial={{ y: "100%" }}
          animate={{ y: indexOpen ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        >
          {indexOpen && <IndexSection onClose={() => setIndexOpen(false)} />}
        </motion.div>
      </section>
    </div>
  );
}
