import HomeClient from "@/components/HomeClient";
import { fetchFeaturedCoverImage } from "@/sanity/queries";

export default async function Home() {
  const [personalFeaturedCoverImageUrl, commissionedFeaturedCoverImageUrl] =
    await Promise.all([
      fetchFeaturedCoverImage("personal"),
      fetchFeaturedCoverImage("commissioned"),
    ]);

  return (
    <HomeClient
      personalFeaturedCoverImageUrl={personalFeaturedCoverImageUrl}
      commissionedFeaturedCoverImageUrl={commissionedFeaturedCoverImageUrl}
    />
  );
}
