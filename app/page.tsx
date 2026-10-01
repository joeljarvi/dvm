import HomeClient from "@/components/HomeClient";
import { fetchAbout, fetchProjects, fetchSiteSettings } from "@/sanity/queries";
import { clients, models } from "@/lib/data";

export default async function Home() {
  const [personal, commissioned, about, settings] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
    fetchAbout(),
    fetchSiteSettings(),
  ]);

  return (
    <HomeClient
      personal={personal.length > 0 ? personal : models}
      commissioned={commissioned.length > 0 ? commissioned : clients}
      about={about}
      underConstruction={settings.underConstruction}
      landingText={settings.landingText}
    />
  );
}
