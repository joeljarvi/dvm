import Link from "next/link";
import { Button } from "@/components/ui/button";
import NameMark from "@/components/NameMark";

export default function Error404() {
  return (
    // A full-screen layer over the layout's Nav (z-85), which otherwise
    // stays up on every route.
    <div className="fixed inset-0 z-90 bg-background flex flex-col gap-4 items-center justify-center h-screen font-diatype">
      <NameMark instant />
      <p className="absolute top-[62.5%] font-diatype text-[0.8rem] tracking-wide text-blue-700 px-5.5 text-center max-w-md">
        {" "}
        404. <br /> Page not found.
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
