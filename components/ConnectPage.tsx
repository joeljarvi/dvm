"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NameMark from "@/components/NameMark";
import ConnectLinks from "@/components/ConnectLinks";
import type { Connect } from "@/lib/types";

// /connect: About's Connect column on its own, over the name — a
// full-screen layer over the nav, like the 404 and the maintenance gate.
export default function ConnectPage({ connect }: { connect?: Connect | null }) {
  // Back to wherever we came from on this site; landing here directly, home.
  const router = useRouter();
  const back = () => {
    const fromHere =
      document.referrer &&
      new URL(document.referrer).origin === window.location.origin;
    if (fromHere && window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <main className="fixed inset-0 z-90 bg-background flex flex-col items-center justify-center h-screen font-diatype">
      <NameMark instant />

      {/* As About's Connect column: top of column 2, the heading on the
          nav's line and the links stacked under it. */}
      <div className="absolute top-0 left-1/4 w-1/4 flex flex-col items-start">
        <h1 className="flex h-14 items-center px-5.5 font-normal text-[0.8rem] tracking-wide text-blue-700 whitespace-nowrap">
          Connect
        </h1>
        <nav
          aria-label="Contact"
          className="flex flex-col items-start px-5.5 text-[0.8rem] tracking-wide"
        >
          <ConnectLinks connect={connect} className="px-0" />
        </nav>
      </div>

      <Button
        variant="link"
        size="sm"
        onClick={back}
        // Bottom of the page, at the start of column 4.
        className="absolute bottom-0 left-3/4 z-10 cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-blue-700 dark:hover:text-blue-700"
      >
        Back
      </Button>
    </main>
  );
}
