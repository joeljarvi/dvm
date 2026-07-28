import { client } from "@/sanity/client";
import type { Project } from "@/lib/types";

export type Category = "personal" | "commissioned";

export const PROJECT_FIELDS = `
  title,
  "slug": slug.current,
  "coverImageUrl": coverImage.asset->url,
  client,
  agency,
  year,
  "images": images[]{
    "url": asset->url,
    "type": _type
  },
  "credits": credits[]{ role, name }
`;

export async function fetchProjects(category: Category): Promise<Project[]> {
  try {
    return await client.fetch<Project[]>(
      `*[_type == "project" && category == $category] | order(dateAdded desc) {
        ${PROJECT_FIELDS}
      }`,
      { category }
    );
  } catch {
    return [];
  }
}

export async function fetchFeaturedCoverImage(
  category: Category
): Promise<string | null> {
  try {
    const result = await client.fetch<{ coverImageUrl: string } | null>(
      `*[_type == "project" && category == $category && featured == true][0] {
        "coverImageUrl": coverImage.asset->url
      }`,
      { category }
    );
    return result?.coverImageUrl ?? null;
  } catch {
    return null;
  }
}

export async function fetchProjectBySlug(
  category: Category,
  slug: string
): Promise<Project | null> {
  try {
    const result = await client.fetch<Project | null>(
      `*[_type == "project" && category == $category && slug.current == $slug][0] {
        ${PROJECT_FIELDS}
      }`,
      { category, slug }
    );
    return result ?? null;
  } catch {
    return null;
  }
}
