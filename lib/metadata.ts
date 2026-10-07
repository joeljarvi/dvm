import type { Metadata } from "next";
import { sanityImage } from "@/lib/image";
import { SITE_TITLE } from "@/lib/site";

// A page's own metadata: title, description, canonical address and share
// image. Its openGraph and twitter replace the layout's wholesale (they
// aren't merged), so this sets them in full.
export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: {
  /** Before the layout's " — Daniel von Malmborg". */
  title: string;
  description: string;
  path: string;
  /** A Sanity image URL (or any URL); sized for sharing here. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const shareImage = sanityImage(image, { w: 1200 });
  // Shared links get the full title, as in the browser tab — "About" alone
  // wouldn't say whose.
  const fullTitle = `${title} — ${SITE_TITLE}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE_TITLE,
      title: fullTitle,
      description,
      url: path,
      ...(shareImage && {
        images: [{ url: shareImage, alt: imageAlt ?? title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(shareImage && { images: [shareImage] }),
    },
  };
}
