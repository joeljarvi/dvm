import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Connect } from "@/lib/types";
import { FALLBACK_EMAIL, FALLBACK_PHONE, INSTAGRAM_URL } from "@/lib/site";

const LINK_CLASS =
  "text-blue-700 hover:text-blue-700 dark:text-blue-700 dark:hover:text-blue-700 cursor-pointer w-min text-left h-auto justify-start";

const external = (url: string) =>
  /^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/**
 * Phone, Email, Instagram and any further entries from Sanity's Connect
 * document — the site's fallbacks where it has none. Just the links; the
 * caller lays them out (About's Connect column, the /connect page).
 */
export default function ConnectLinks({
  connect,
  className = "",
}: {
  connect?: Connect | null;
  /** Extra classes for each link, e.g. padding. */
  className?: string;
}) {
  const items = [
    { label: "Phone", url: `tel:${connect?.phone ?? FALLBACK_PHONE}` },
    { label: "Email", url: `mailto:${connect?.email ?? FALLBACK_EMAIL}` },
    { label: "Instagram", url: connect?.instagram ?? INSTAGRAM_URL },
    ...(connect?.other ?? []),
  ];

  return items.map((item) => (
    <Button
      key={`${item.label}-${item.url}`}
      variant="link"
      size="sm"
      className={`${LINK_CLASS} ${className}`}
      asChild
    >
      <Link href={item.url} {...external(item.url)}>
        {item.label}
      </Link>
    </Button>
  ));
}
