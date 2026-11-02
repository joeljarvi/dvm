import type { Metadata } from "next";
import { sanityImage } from "@/lib/image";
import { SITE_TITLE } from "@/lib/site";

export function pageMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;

  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const shareImage = sanityImage(image, { w: 1200 });

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
