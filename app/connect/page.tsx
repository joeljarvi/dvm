import type { Metadata } from "next";
import ConnectPage from "@/components/ConnectPage";
import { fetchAbout } from "@/sanity/queries";
import { pageMetadata } from "@/lib/metadata";
import { SITE_TITLE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const about = await fetchAbout();
  return pageMetadata({
    title: "Connect",
    description: `Get in touch with ${SITE_TITLE} — phone, email and Instagram.`,
    path: "/connect",
    image: about?.bioImageUrl,
    imageAlt: SITE_TITLE,
  });
}

// Linkable contact page — the same links as About's Connect column.
export default async function Connect() {
  const about = await fetchAbout();
  return <ConnectPage connect={about?.connect} />;
}
