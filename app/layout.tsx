import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import { motionCssVars } from "@/lib/motion";
import { fetchSiteSettings } from "@/sanity/queries";
import { sanityImage } from "@/lib/image";
import SiteAnalytics from "@/components/SiteAnalytics";
import {
  SITE_DESCRIPTION,
  SITE_SUMMARY,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { shareImageUrl } = await fetchSiteSettings();
  const image = sanityImage(shareImageUrl, { w: 1200 });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${SITE_TITLE} — ${SITE_DESCRIPTION}`,
      template: `%s — ${SITE_TITLE}`,
    },
    description: SITE_SUMMARY,
    openGraph: {
      type: "website",
      siteName: SITE_TITLE,
      title: SITE_TITLE,
      description: SITE_SUMMARY,
      locale: "en_US",
      ...(image && { images: [{ url: image, alt: SITE_TITLE }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_SUMMARY,
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
        <SmoothScroll />
        <Nav part="top" />
        {children}
        <Nav part="bottom" />
        <SiteAnalytics />
      </body>
    </html>
  );
}
