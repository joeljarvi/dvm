import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import { ReactLenis } from "lenis/react";
import { motionCssVars } from "@/lib/motion";
import { fetchSiteSettings } from "@/sanity/queries";
import WatermarkCursor from "@/components/WatermarkCursor";

export const metadata: Metadata = {
  title: "Daniel von Malmborg",
  description: "Photographer & Creative Director",
};

const diatype = localFont({
  src: [
    {
      path: "../public/fonts/ABCDiatypeTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ABCDiatypeTrial-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-diatype",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { watermarkCursor } = await fetchSiteSettings();

  return (
    <html
      lang="en"
      style={motionCssVars}
      className={`  ${diatype.variable} antialiased`}
    >
      <body className="">
        <ReactLenis root />
        {children}
        <Nav />
        <WatermarkCursor on={watermarkCursor} />
      </body>
    </html>
  );
}
