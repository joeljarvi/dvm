"use client";

import { useRouter } from "next/navigation";
import { sanityImage } from "@/lib/image";
import { Button } from "@/components/ui/button";

export default function HomeClient({
  personalFeaturedCoverImageUrl,
  commissionedFeaturedCoverImageUrl,
}: {
  personalFeaturedCoverImageUrl?: string | null;
  commissionedFeaturedCoverImageUrl?: string | null;
}) {
  const router = useRouter();

  return (
    <section className="font-selecta relative flex flex-col lg:flex-row w-screen h-dvh overflow-hidden">
      {/* LEFT (PERSONAL) */}
      <div
        data-panel="personal"
        className="relative flex-1 h-1/2 lg:h-dvh overflow-hidden cursor-pointer bg-neutral-200"
        onClick={() => router.push("/personal")}
      >
        {personalFeaturedCoverImageUrl && (
          <img
            src={sanityImage(personalFeaturedCoverImageUrl, { w: 1400 })}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        <Button className="flex lg:hidden font-selecta text-lg font-medium tracking-wide ,t-1  ">
          personal
        </Button>
      </div>

      {/* RIGHT (COMMISSIONED) */}
      <div
        data-panel="commissioned"
        className="relative flex-1 h-1/2 lg:h-dvh overflow-hidden cursor-pointer bg-neutral-300"
        onClick={() => router.push("/commissioned")}
      >
        {commissionedFeaturedCoverImageUrl && (
          <img
            src={sanityImage(commissionedFeaturedCoverImageUrl, { w: 1400 })}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )}
        <Button className="flex lg:hidden font-selecta mt-1 text-lg font-medium tracking-wide  ">
          commissioned
        </Button>
      </div>
    </section>
  );
}
