"use client";
import Link from "next/link";

const aboutText = `I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.
Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.
Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.`;

export default function AboutSection() {
  return (
    <div className="relative grid grid-cols-2 lg:grid-cols-2 items-start justify-start w-full h-full   font-selecta font-medium  text-sm   tracking-wide leading-[1.2]  gap-0    lg:tracking-normal  pt-[50dvh]  text-background   ">
      <span className="col-span-1 bg-neutral-600 lg:bg-neutral-400  w-full h-full px-2.5 pt-2 ">
        <h1 className=" ">Daniel von Malmborg</h1>
        <h2>+46708247484</h2>
        <Link href="mailto:daniel@vonmalmborg.com">
          <h2>daniel@vonmalmborg.com</h2>
        </Link>
      </span>

      <div className=" bg-neutral-700 lg:bg-neutral-500 flex flex-col  col-span-1 lg:col-span-1 w-full h-full px-2.5 pt-2 ">
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
