import AboutSection from "@/components/AboutSection";
import type { Metadata } from "next";
import { toPlainText } from "@portabletext/react";
import { fetchAbout } from "@/sanity/queries";
import { pageMetadata } from "@/lib/metadata";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";

// The short bio as the description, cut to what a search result shows; the
// bio image to share.
export async function generateMetadata(): Promise<Metadata> {
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
    image: about?.bioImageUrl,
    imageAlt: SITE_TITLE,
  });
}

// Full, linkable about page.
export default async function AboutPage() {
  const about = await fetchAbout();

  return (
    <main className="w-screen h-dvh">
      <AboutSection about={about} />
    </main>
  );
}
