"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import NameMark from "@/components/NameMark";
import ConnectLinks from "@/components/ConnectLinks";
import type { Connect } from "@/lib/types";

export default function ConnectPage({ connect }: { connect?: Connect | null }) {
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
        className="absolute bottom-0 left-3/4 z-10 cursor-pointer text-neutral-400 dark:text-neutral-500 hover:text-blue-700 dark:hover:text-blue-700"
      >
        Back
      </Button>
    </main>
  );
}
