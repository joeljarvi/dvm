import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Button } from "@/components/ui/button";
import type { About } from "@/lib/types";

// Shown when Sanity has no About document yet — same degradation pattern
// as the rest of the site (see FALLBACK in IndexSection).
const FALLBACK_BIO = [
  "I’m a photographer and creative producer working in advertising for brands and agencies that value quality over quantity.",
  "Driven by craftsmanship — both my own and that of others — my work focuses on portraying designed objects, spaces, and the people behind the craft.",
  "Alongside commissioned work, an ongoing personal practice focuses on nature, form, and belonging.",
];
const FALLBACK_PHONE = "+46708247484";
const FALLBACK_EMAIL = "daniel@vonmalmborg.com";
const FALLBACK_LINKS = [
  { url: "https://multi2.co", description: "creative agency, built to multiply" },
];

const bioComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="indent-0 mb-0">{children}</p>,
  },
};

const displayUrl = (url: string) =>
  url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function AboutSection({ about }: { about?: About | null }) {
  const phone = about?.phone ?? FALLBACK_PHONE;
  const email = about?.email ?? FALLBACK_EMAIL;
  const links = about?.links?.length ? about.links : FALLBACK_LINKS;

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
      <span className="mt-28 lg:mt-0 col-span-1   w-full h-full  row-start-2   ">
        <h1 className="lg:hidden text-blue-700 mb-0">Daniel von Malmborg</h1>
        <h2 className="text-neutral-300 hover:text-blue-700 cursor-pointer">
          {phone}{" "}
        </h2>
        <Link
          className=" text-neutral-300 hover:text-blue-700 cursor-pointer"
          href={`mailto:${email}`}
        >
          <h2>{email}</h2>
        </Link>
        <Link
          className="text-neutral-300 hover:text-blue-700 cursor-pointe"
          href="mailto:daniel@vonmalmborg.com"
        >
          <h2>@danielvonmalmborg</h2>
        </Link>
      </span>

      <div className=" row-start-3 flex flex-col  col-span-1 lg:col-span-1 lg:col-start-3 lg:row-start-2 w-full h-full mb-4 lg:mb-0 text-sm leading-tight tracking-normal gap-y-2 max-w-sm lg:max-w-full text-blue-700">
        {about?.bio?.length ? (
          <PortableText value={about.bio} components={bioComponents} />
        ) : (
          FALLBACK_BIO.map((paragraph, i) => (
            <p key={i} className="indent-0 mb-0">
              {paragraph}
            </p>
          ))
        )}
      </div>
      <span className="col-start-1 row-start-3 ">
        <h3 className="text-neutral-300">Links</h3>
      </span>

      <div className="col-span-3 col-start-2 w-full h-full row-start-3 grid grid-cols-1 lg:grid-cols-3 gap-x-5.5 gap-y-4 row-span-1">
        {links.map((link) => (
          <span key={link.url} className="flex w-full flex-col gap-y-1">
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-blue-700"
            >
              <h2 className="mb-0">{displayUrl(link.url)}</h2>
            </Link>
            <p className="mb-0 hidden lg:block text-neutral-300">
              {link.description}
            </p>
          </span>
        ))}
      </div>
    </div>
  );
}
