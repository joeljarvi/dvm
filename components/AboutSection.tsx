"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const aboutText = `I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.
Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.
Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.`;

export default function AboutSection({ onClose }: { onClose?: () => void }) {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 items-start justify-start w-full h-full   font-selecta font-medium  text-lg lg:text-xll   tracking-wide leading-[1.2]  gap-0    lg:tracking-normal    text-background   ">
      {onClose && (
        <Button
          className="fixed top-0 left-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 z-10 hover:text-pink-400"
          onClick={onClose}
        >
          close
        </Button>
      )}
      <span className="col-span-1 bg-neutral-600 lg:bg-neutral-400  w-full h-full px-2.5 pt-2 ">
        <h1 className=" ">Daniel von Malmborg</h1>
        <h2>+46708247484</h2>
        <Link href="mailto:daniel@vonmalmborg.com">
          <h2>daniel@vonmalmborg.com</h2>
        </Link>
      </span>

      <div className=" bg-neutral-600 lg:bg-neutral-500 flex flex-col  col-span-1 lg:col-span-1 w-full h-full px-2.5 pt-8 pb-2.5 ">
        <span>
          I’m a photographer and creative producer working in advertising for
          brands and agencies that value quality over quantity.
        </span>
        <span className="indent-4">
          Driven by craftsmanship — both my own and that of others — my work
          focuses on portraying designed objects, spaces, and the people behind
          the craft.
        </span>
        <span className="indent-4">
          Alongside commissioned work, an ongoing personal practice focuses on
          nature, form, and belonging.
        </span>
      </div>
    </div>
  );
}
