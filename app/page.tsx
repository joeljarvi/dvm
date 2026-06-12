"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import PanelClient from "@/components/PanelClient";
import type { View } from "@/lib/types";

function pathToView(path: string): View {
  const slug = path.replace(/^\//, "");
  if (
    slug === "personal" ||
    slug === "commissioned" ||
    slug === "about" ||
    slug === "index"
  )
    return slug;
  return null;
}

export default function Home() {
  const [view, setViewState] = useState<View>(null);
  const [hovered, setHovered] = useState<"personal" | "commissioned" | null>(
    null,
  );

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
          className={`absolute top-0 left-0 z-10 hover:text-pink-400 ${hovered === "personal" ? "text-pink-400" : ""} {view === "personal" ? "text-pink-400" : ""}`}
          onClick={() => toggle("personal")}
        >
          personal
        </Button>
        {(view === "personal" || view === "commissioned") && (
          <Button
            className="absolute top-0 left-1/2 -translate-x-1/2 z-10 hover:text-pink-400"
            onClick={() => setView(null)}
          >
            back
          </Button>
        )}
        <Button
          className={`absolute top-0 right-0 z-10 hover:text-pink-400 ${hovered === "commissioned" ? "text-pink-400" : ""} {view === "commissioned" ? "text-pink-400" : ""}`}
          onClick={() => toggle("commissioned")}
        >
          commissioned
        </Button>

        {/* LEFT (PERSONAL) */}
        <motion.div
          className="overflow-hidden cursor-pointer bg-neutral-300"
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
          <PanelClient view={view} panel="personal" />
        </motion.div>

        {/* RIGHT (COMMISSIONED) */}
        <motion.div
          className="overflow-hidden cursor-pointer bg-neutral-500"
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
          <PanelClient view={view} panel="commissioned" />
        </motion.div>

        <Button
          className={`absolute bottom-0 left-0 z-30 hover:text-pink-400 ${view === "about" ? "text-pink-400" : "text-foreground"}`}
          onClick={() => toggle("about")}
        >
          about
        </Button>

        {(view === "index" || view === "about") && (
          <Button
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 hover:text-pink-400"
            onClick={() => setView(null)}
          >
            back
          </Button>
        )}

        <Button
          className={`absolute bottom-0 right-0 z-30 hover:text-pink-400 ${view === "index" ? "text-pink-400" : "text-foreground"}`}
          onClick={() => toggle("index")}
        >
          index
        </Button>

        {/* ABOUT OVERLAY */}
        <motion.div
          className="absolute inset-0 z-5 shadow bg-neutral-100"
          initial={{ y: "100%" }}
          animate={{ y: view === "about" ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        />

        {/* INDEX OVERLAY */}
        <motion.div
          className="absolute inset-0 z-5 shadow bg-neutral-200"
          initial={{ y: "100%" }}
          animate={{ y: view === "index" ? "0%" : "100%" }}
          transition={{ duration: 0.6, ease }}
        />
      </section>
    </div>
  );
}
