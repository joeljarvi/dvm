import HomeClient from "@/components/HomeClient";
import { fetchFeaturedProject } from "@/sanity/queries";

export default async function Home() {
  const [personal, commissioned] = await Promise.all([
    fetchFeaturedProject("personal"),
    fetchFeaturedProject("commissioned"),
  ]);

  return <HomeClient personal={personal} commissioned={commissioned} />;
}
