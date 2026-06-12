"use client";
import Link from "next/link";

const aboutText = `I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.
Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.
Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.`;

export default function AboutSection() {
  return (
    <div className="relative flex flex-col items-start justify-start w-full h-full pt-16 pl-2.5 pr-3 font-selecta font-medium  text-2xl   tracking-wide leading-[1.2]  gap-10 lg:gap-8 lg:pb-24  lg:tracking-normal lg:text-2xl ">
      <span className="">
        <h1 className=" ">Daniel von Malmborg</h1>
        <h2>+46708247484</h2>
        <Link href="mailto:daniel@vonmalmborg.com">
          <h2>daniel@vonmalmborg.com</h2>
        </Link>
      </span>

      <div className=" flex flex-col">
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
