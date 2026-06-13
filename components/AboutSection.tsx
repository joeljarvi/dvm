"use client";
import Link from "next/link";

const aboutText = `I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.
Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.
Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.`;

export default function AboutSection() {
  return (
    <div className="relative grid grid-cols-2 lg:grid-cols-3 items-start justify-start w-full h-full pt-16 pl-2.5 pr-3 font-selecta font-medium  text-sm   tracking-wide leading-[1.2]  gap-2  lg:pb-24  lg:tracking-normal   ">
      <span className="col-span-1 ">
        <h1 className=" ">Daniel von Malmborg</h1>
        <h2>+46708247484</h2>
        <Link href="mailto:daniel@vonmalmborg.com">
          <h2>daniel@vonmalmborg.com</h2>
        </Link>
      </span>

      <div className=" flex flex-col max-w-xs col-span-1 lg:col-span-2  lg:max-w-lg">
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
