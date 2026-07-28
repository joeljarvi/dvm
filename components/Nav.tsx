"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { closeTop, useModalCount } from "@/lib/modalStack";
import Link from "next/link";

const ease = [0.4, 0, 0.2, 1] as const;

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const modalCount = useModalCount();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menuOpen) setMenuOpen(false);
      else closeTop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // No site nav over the Sanity Studio.
  if (pathname.startsWith("/studio")) return null;

  const personalActive = pathname.startsWith("/personal");
  const commissionedActive = pathname.startsWith("/commissioned");
  const aboutActive = pathname === "/about";
  const indexActive = pathname === "/index";
  const anyActive =
    personalActive || commissionedActive || aboutActive || indexActive;

  const go = (href: string) => {
    router.push(href);
    setMenuOpen(false);
  };

  return (
    <>
      {/* DESKTOP — corners + bottom bar */}
      <div className="hidden lg:contents">
        <div className="fixed left-0 top-0 z-50 flex items-center justify-center w-full">
          <Button
            data-nav="personal"
            className={`hover:text-pink-400 w-1/2 justify-start ${personalActive ? "text-pink-400" : ""}`}
            onClick={() => router.push("/personal")}
          >
            personal
          </Button>
          <Button
            data-nav="commissioned"
            className={`hover:text-pink-400 w-1/2 justify-end ${commissionedActive ? "text-pink-400" : ""}`}
            onClick={() => router.push("/commissioned")}
          >
            commissioned
          </Button>
        </div>

        <div
          className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between ${anyActive ? "bg-transparent" : "bg-transparent"}`}
        >
          <Button
            className={`hover:text-pink-400 ${aboutActive ? "text-pink-400" : ""}`}
            onClick={() => router.push("/about")}
          >
            about
          </Button>

          {modalCount > 0 && (
            <Button className="hover:text-pink-400" onClick={closeTop}>
              close
            </Button>
          )}

          <Button
            className={`hover:text-pink-400 ${indexActive ? "text-pink-400" : ""}`}
            onClick={() => router.push("/index")}
          >
            index
          </Button>
        </div>
      </div>

      {/* MOBILE — menu button + overlay */}
      <div className="lg:hidden">
        {modalCount > 0 && !menuOpen && (
          <Button
            className="fixed bottom-1 left-0 z-60 hover:text-pink-400"
            onClick={closeTop}
          >
            close
          </Button>
        )}

        <Button
          className="fixed bottom-1 right-0 z-60 hover:text-pink-400"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? "close" : "menu"}
        </Button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-1 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease }}
            >
              <Button
                className={`text-xl hover:text-pink-400 ${personalActive ? "text-pink-400" : ""}`}
                onClick={() => go("/personal")}
              >
                personal
              </Button>
              <Button
                className={`text-xl hover:text-pink-400 ${commissionedActive ? "text-pink-400" : ""}`}
                onClick={() => go("/commissioned")}
              >
                commissioned
              </Button>
              <Button
                className={`text-xl hover:text-pink-400 ${aboutActive ? "text-pink-400" : ""}`}
                onClick={() => go("/about")}
              >
                about
              </Button>
              <Button
                className={`text-xl hover:text-pink-400 ${indexActive ? "text-pink-400" : ""}`}
                onClick={() => go("/index")}
              >
                index
              </Button>
              <Button
                className={`text-xl hover:text-pink-400 ${indexActive ? "text-pink-400" : ""}`}
                onClick={() => go("/index")}
                asChild
              >
                <Link href="/studio"> log in</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
