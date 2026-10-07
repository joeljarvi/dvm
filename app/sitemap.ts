import type { MetadataRoute } from "next";
import { fetchProjectSlugs, type Category } from "@/sanity/queries";
import { SITE_URL } from "@/lib/site";

const CATEGORIES: Category[] = ["personal", "commissioned"];

// Home, About, the archive, and every project page — the project pages are
// otherwise only reached through buttons, which crawlers don't follow.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await Promise.all(CATEGORIES.map(fetchProjectSlugs));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, changeFrequency: "weekly", priority: 0.6 },
    ...CATEGORIES.flatMap((category, i) =>
      slugs[i].map((slug) => ({
        url: `${SITE_URL}/${category}/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ),
  ];
}
