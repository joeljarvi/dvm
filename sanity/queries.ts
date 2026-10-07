import { client } from "@/sanity/client";
import type { About, Connect, Project } from "@/lib/types";

export type Category = "personal" | "commissioned";

export const PROJECT_FIELDS = `
  title,
  "slug": slug.current,
  "coverImageUrl": coverImage.asset->url,
  "coverAlt": coverImage.alt,
  "coverVideoUrl": coverVideo.asset->url,
  client,
  agency,
  description,
  year,
  featured,
  "images": images[defined(asset)]{
    "url": asset->url,
    "type": _type,
    caption,
    alt
  },
  "credits": credits[]{ role, name }
`;

export async function fetchProjects(category: Category): Promise<Project[]> {
  try {
    return await client.fetch<Project[]>(
      `*[_type == "project" && category == $category] | order(orderRank asc) {
        ${PROJECT_FIELDS}
      }`,
      { category },
      { next: { tags: ["project"] } },
    );
  } catch {
    return [];
  }
}

export async function fetchAbout(): Promise<About | null> {
  try {
    const result = await client.fetch<{
      about:
        | (Omit<About, "bioImageUrl"> & { bioImageUrl?: string | null })
        | null;
      connect: Connect | null;
      latestCommissionedCoverUrl: string | null;
    }>(
      `{
        "about": *[_type == "about"][0]{
          shortBio,
          longBio,
          links[]{ title, url, description },
          "bioImageUrl": bioImage.asset->url
        },
        "connect": *[_type == "connect"][0]{
          email,
          phone,
          instagram,
          other[]{ label, url }
        },
        "latestCommissionedCoverUrl": *[_type == "project" && category == "commissioned" && defined(coverImage)] | order(dateAdded desc)[0].coverImage.asset->url
      }`,
      {},
      { next: { tags: ["about", "connect", "project"] } },
    );

    if (!result.about) return result.connect ? { connect: result.connect } : null;

    return {
      ...result.about,
      connect: result.connect ?? undefined,
      bioImageUrl:
        result.about.bioImageUrl ??
        result.latestCommissionedCoverUrl ??
        undefined,
    };
  } catch {
    return null;
  }
}

// Ordered slugs for one category — same order as fetchProjects, so prev/next
// on a project walks the list in the order the browser shows it.
export async function fetchProjectSlugs(category: Category): Promise<string[]> {
  try {
    const rows = await client.fetch<{ slug: string | null }[]>(
      `*[_type == "project" && category == $category] | order(orderRank asc) {
        "slug": slug.current
      }`,
      { category },
      { next: { tags: ["project"] } },
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
      { next: { tags: ["project"] } },
    );
    return result ?? null;
  } catch {
    return null;
  }
}

export async function fetchSiteSettings(): Promise<{
  underConstruction: boolean;
  landingText: string | null;
  watermarkCursor: boolean;
}> {
  try {
    const result = await client.fetch<{
      underConstruction?: boolean;
      landingText?: string | null;
      watermarkCursor?: boolean;
    } | null>(
      `*[_type == "settings" && _id == "siteSettings"][0] { underConstruction, landingText, watermarkCursor }`,
      {},
      { next: { tags: ["settings"] } },
    );
    return {
      underConstruction: result?.underConstruction ?? false,
      landingText: result?.landingText?.trim() || null,
      watermarkCursor: result?.watermarkCursor ?? false,
    };
  } catch {
    return {
      underConstruction: false,
      landingText: null,
      watermarkCursor: false,
    };
  }
}
