import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import { ReactLenis } from "lenis/react";
import { motionCssVars } from "@/lib/motion";
import { fetchAbout } from "@/sanity/queries";
import { sanityImage } from "@/lib/image";
import SiteAnalytics from "@/components/SiteAnalytics";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site";

// Defaults for every page; a page's own metadata (e.g. a project's) layers
// over them. The share image falls back to the About page's bio image.
export async function generateMetadata(): Promise<Metadata> {
  const about = await fetchAbout();
  const image = sanityImage(about?.bioImageUrl, { w: 1200 });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_TITLE} — ${SITE_DESCRIPTION}`,
      template: `%s — ${SITE_TITLE}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_TITLE,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      locale: "en_US",
      ...(image && { images: [{ url: image, alt: SITE_TITLE }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      ...(image && { images: [image] }),
    },
  };
}

const diatype = localFont({
  src: [
    {
      path: "../public/fonts/ABCDiatype-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-diatype",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={motionCssVars}
      className={`  ${diatype.variable} antialiased`}
    >
      <body className="">
        <ReactLenis root />
        <Nav part="top" />
        {children}
        <Nav part="bottom" />
        <SiteAnalytics />
      </body>
    </html>
  );
}
