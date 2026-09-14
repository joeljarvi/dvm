import HomeClient from "@/components/HomeClient";
import { fetchAbout, fetchProjects } from "@/sanity/queries";
import { clients, models } from "@/lib/data";

export default async function Home() {
  // The whole of each category — home browses both rather than featuring one.
  const [personal, commissioned, about] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
    fetchAbout(),
  ]);

  return (
    <HomeClient
      personal={personal.length > 0 ? personal : models}
      commissioned={commissioned.length > 0 ? commissioned : clients}
      about={about}
    />
  );
}
