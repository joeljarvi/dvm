import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error404() {
  return (
    <div className="relative flex flex-col gap-4 items-center justify-center h-screen font-diatype">
      <p className="font-diatype text-[0.8rem] tracking-wide text-neutral-400 px-5.5 text-center max-w-md">
        {" "}
        404
      </p>
      <p className="font-diatype text-[0.8rem] tracking-wide text-neutral-400 px-5.5 text-center max-w-md">
        {" "}
        This page can&apos;t be found.
      </p>
      <Button
        variant="link"
        size="sm"
        className="absolute top-0 left-0 z-10"
        asChild
      >
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
}
