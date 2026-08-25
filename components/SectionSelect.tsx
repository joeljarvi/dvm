"use client";

import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { Button } from "@/components/ui/button";

// Where the select can take you. Home is deliberately absent — the wordmark
// and the panels already lead back there.
const DESTINATIONS = [
  { label: "Commissioned_", href: "/commissioned" },
  { label: "Personal_", href: "/personal" },
  { label: "Index_", href: "/index" },
  { label: "About_", href: "/about" },
  { label: "Home_", href: "/" },
];

/**
 * The top-left corner: reads as the view you are in, opens as a way out of it.
 * `current` is matched against the hrefs above to mark and label the open one.
 */
export default function SectionSelect({
  current,
  className = "",
}: {
  /** Pathname of the view showing, e.g. `/commissioned/some-slug`. */
  current: string;
  className?: string;
}) {
  const here = DESTINATIONS.find(
    (d) => current === d.href || current.startsWith(`${d.href}/`),
  );

  // The trigger already names where you are, so the menu offers only the ways
  // out of it. On home nothing matches and all four stand.
  const elsewhere = DESTINATIONS.filter((d) => d !== here);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="link"
          // aria-expanded is set by Radix, so the caret can follow it.
          className={`justify-start w-auto h-full cursor-pointer  hover:text-blue-700 active:text-blue-700 bg-transparent active:bg-transparent ${
            here ? "text-blue-700" : ""
          } ${className}`}
        >
          {here?.label ?? "menu"}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* Opens sideways rather than down: the corner sits in an h-8 bar, so
            the destinations read as a continuation of it. `side="right"` puts
            them after the trigger, `align="center"` keeps them on its
            baseline. */}
        <DropdownMenu.Content
          side="right"
          align="center"
          sideOffset={0}
          // Above the nav's own z-90 so it clears the chrome it opens over.
          className="z-100 flex flex-row items-center gap-0 font-selecta text-base font-medium lowercase tracking-wide"
        >
          {elsewhere.map((d) => (
            <DropdownMenu.Item key={d.href} asChild>
              <Link
                href={d.href}
                className="flex px-0 whitespace-nowrap outline-none cursor-pointer transition-colors text-neutral-400 bg-transparent duration-200 ease-out data-highlighted:text-blue-700 data-highlighted:bg-transparent"
              >
                {d.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
