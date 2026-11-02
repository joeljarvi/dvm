import AboutSection from "@/components/AboutSection";
import type { Metadata } from "next";
import { toPlainText } from "@portabletext/react";
import { fetchAbout, fetchSiteSettings } from "@/sanity/queries";
import { pageMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { aboutSchema } from "@/lib/structuredData";

export async function generateMetadata(): Promise<Metadata> {
  const { shareImageUrl } = await fetchSiteSettings();
  const about = await fetchAbout();
  const bio = about?.shortBio?.length
    ? toPlainText(about.shortBio).replace(/\s+/g, " ").trim()
    : "";
  const description = bio
    ? bio.length > 160
      ? `${bio.slice(0, 157).replace(/\s+\S*$/, "")}…`
      : bio
    : `${SITE_TITLE}, ${SITE_DESCRIPTION}.`;
  return pageMetadata({
    title: "About",
    description,
    path: "/about",
    image: shareImageUrl ?? undefined,
    imageAlt: SITE_TITLE,
  });
}

export default async function AboutPage() {
  const about = await fetchAbout();

  return (
    <main className="w-screen h-dvh">
      <JsonLd data={aboutSchema(about)} />

      <h1 className="sr-only">About {SITE_TITLE}</h1>
      <AboutSection about={about} />
    </main>
  );
}
