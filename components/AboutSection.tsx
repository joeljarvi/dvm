"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const aboutText = `I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.
Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.
Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.`;

export default function AboutSection() {
  return (
    <div className="relative flex flex-col lg:grid  grid-rows-3 lg:grid-cols-4 items-start justify-start w-full h-full   font-selecta font-medium  text-sm  tracking-wide leading-[1.2]   gap-x-5.5 gap-y-4   lg:tracking-normal px-5.5 text-neutral-300     ">
      <Button
        variant="link"
        size="sm"
        className="hidden lg:flex col-start-3 w-min h-14  items-center px-0 font-medium text-blue-700"
      >
        Daniel von Malmborg
      </Button>
      <span className="col-start-1 row-start-2 hidden lg:block  ">
        <h3>Phone</h3>
        <h3>Email</h3>
        <h3>Instagram</h3>
      </span>
      <span className="mt-[33.3vh] lg:mt-0 col-span-1   w-full h-full  row-start-2   ">
        <h1 className="lg:hidden text-blue-700 mb-2">Daniel von Malmborg</h1>
        <h2 className="text-neutral-300 hover:text-blue-700 cursor-pointer">
          +46708247484{" "}
        </h2>
        <Link
          className=" text-neutral-300 hover:text-blue-700 cursor-pointer"
          href="mailto:daniel@vonmalmborg.com"
        >
          <h2>daniel@vonmalmborg.com</h2>
        </Link>
        <Link
          className="text-neutral-300 hover:text-blue-700 cursor-pointe"
          href="mailto:daniel@vonmalmborg.com"
        >
          <h2>@danielvonmalmborg</h2>
        </Link>
      </span>

      <div className=" row-start-3 flex flex-col  col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full mb-4 lg:mb-0 text-sm leading-tight tracking-normal gap-y-2 max-w-sm lg:max-w-full text-blue-700">
        <span className="">
          I’m a photographer and creative producer working in advertising for
          brands and agencies that value quality over quantity.
        </span>
        <span className="indent-0">
          Driven by craftsmanship — both my own and that of others — my work
          focuses on portraying designed objects, spaces, and the people behind
          the craft.
        </span>
        <span className="indent-0">
          Alongside commissioned work, an ongoing personal practice focuses on
          nature, form, and belonging.
        </span>
      </div>
      <span className="col-start-1 row-start-3 ">
        <h3 className="text-neutral-300">Links</h3>
      </span>

      <span className="col-span-3 col-start-2   w-full h-full  row-start-3 grid grid-cols-3 gap-x-5.5 gap-y-4 row-span-1  ">
        <span className="flex   w-full flex-col gap-y-4 col-span-3 lg:col-span-1 col-start-1 row-start-1 ">
          <h2 className="mb-0 text-neutral-300 hover:text-blue-700">
            <Link href="/multi2.co">multi2.co</Link>{" "}
          </h2>
          <h2 className="mb-0 text-neutral-300 hover:text-blue-700">Krejsy </h2>
        </span>
        <span className="hidden lg:flex flex-col gap-y-4 w-full col-start-2 row-start-1 text-neutral-300">
          <p className="mb-0">creative agency, built to multiply</p>
          <p className="mb-0">my band</p>
        </span>
      </span>
    </div>
  );
}
