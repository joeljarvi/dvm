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
      { category },
    );
  } catch {
    return [];
  }
}

// The project behind a home panel — its cover fills the panel and its
// metadata is what the bar shows while that panel is hovered.
export async function fetchFeaturedProject(
  category: Category,
): Promise<Project | null> {
  try {
    const result = await client.fetch<Project | null>(
      `*[_type == "project" && category == $category && featured == true][0] {
        ${PROJECT_FIELDS}
      }`,
      { category },
    );
    return result ?? null;
  } catch {
    return null;
  }
}

// Ordered slugs for one category — same order as fetchProjects, so prev/next
// on a project walks the list in the order the browser shows it.
export async function fetchProjectSlugs(category: Category): Promise<string[]> {
  try {
    const rows = await client.fetch<{ slug: string | null }[]>(
      `*[_type == "project" && category == $category] | order(dateAdded desc) {
        "slug": slug.current
      }`,
      { category },
    );
    return rows.map((r) => r.slug).filter((s): s is string => !!s);
  } catch {
    return [];
  }
}

export async function fetchProjectBySlug(
  category: Category,
  slug: string,
): Promise<Project | null> {
  try {
    const result = await client.fetch<Project | null>(
      `*[_type == "project" && category == $category && slug.current == $slug][0] {
        ${PROJECT_FIELDS}
      }`,
      { category, slug },
    );
    return result ?? null;
  } catch {
    return null;
  }
}
