import { client } from "@/sanity/client";
import HomeClient from "@/components/HomeClient";
import { models, clients } from "@/lib/data";
import type { Project } from "@/lib/types";

async function fetchCommissionedProjects(): Promise<Project[]> {
  try {
    return await client.fetch<Project[]>(
      `*[_type == "project" && category == "commissioned"] | order(dateAdded desc) {
        title,
        "coverImageUrl": coverImage.asset->url,
        client,
        agency,
        year,
        "images": images[]{
          "url": asset->url,
          "type": _type
        },
        "credits": credits[]{ role, name }
      }`
    );
  } catch {
    return [];
  }
}

async function fetchFeaturedCoverImage(): Promise<string | null> {
  try {
    const result = await client.fetch<{ coverImageUrl: string } | null>(
      `*[_type == "project" && category == "commissioned" && featured == true][0] {
        "coverImageUrl": coverImage.asset->url
      }`
    );
    return result?.coverImageUrl ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [commissionedFromSanity, featuredCoverImageUrl] = await Promise.all([
    fetchCommissionedProjects(),
    fetchFeaturedCoverImage(),
  ]);

  const commissionedList = commissionedFromSanity.length > 0 ? commissionedFromSanity : clients;

  return (
    <HomeClient
      personalList={models}
      commissionedList={commissionedList}
      featuredCoverImageUrl={featuredCoverImageUrl}
    />
  );
}
