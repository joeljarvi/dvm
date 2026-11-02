import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { fetchAbout, fetchProjects, fetchSiteSettings } from "@/sanity/queries";
import { clients, models } from "@/lib/data";
import JsonLd from "@/components/JsonLd";
import { homeSchema } from "@/lib/structuredData";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [personal, commissioned, about, settings] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
    fetchAbout(),
    fetchSiteSettings(),
  ]);

  return (
    <>
      <JsonLd data={homeSchema(about)} />
      <HomeClient
        personal={personal.length > 0 ? personal : models}
        commissioned={commissioned.length > 0 ? commissioned : clients}
        about={about}
        underConstruction={settings.underConstruction}
        landingText={settings.landingText}
      />
    </>
  );
}
