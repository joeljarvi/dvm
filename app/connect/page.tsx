import type { Metadata } from "next";
import ConnectPage from "@/components/ConnectPage";
import { fetchAbout, fetchSiteSettings } from "@/sanity/queries";
import { pageMetadata } from "@/lib/metadata";
import { SITE_TITLE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { shareImageUrl } = await fetchSiteSettings();
  return pageMetadata({
    title: "Connect",
    description: `Get in touch with ${SITE_TITLE} — phone, email and Instagram.`,
    path: "/connect",
    image: shareImageUrl ?? undefined,
    imageAlt: SITE_TITLE,
  });
}

export default async function Connect() {
  const about = await fetchAbout();
  return <ConnectPage connect={about?.connect} />;
}
