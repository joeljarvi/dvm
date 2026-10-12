import type { MetadataRoute } from "next";
import { fetchSitemapEntries, type Category } from "@/sanity/queries";
import { SITE_URL } from "@/lib/site";

const CATEGORIES: Category[] = ["personal", "commissioned"];

// Home, About, Connect, the archive, and every project page — the project
// pages are otherwise only reached through buttons, which crawlers don't
// follow. Each with when it last changed (from Sanity), so search engines
// re-crawl what's been edited; home and the archive change whenever a project
// does. Refreshed on publish, by the Sanity webhook (see api/revalidate).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects, aboutUpdatedAt, connectUpdatedAt } =
    await fetchSitemapEntries();

  const latest = (dates: (string | null | undefined)[]) => {
    const times = dates
      .filter((d): d is string => !!d)
      .map((d) => new Date(d).getTime());
    return times.length ? new Date(Math.max(...times)) : undefined;
  };
  const projectsUpdated = latest(projects.map((p) => p.updatedAt));

  return [
    {
      url: SITE_URL,
      lastModified: projectsUpdated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: latest([aboutUpdatedAt, connectUpdatedAt]),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/connect`,
      lastModified: latest([connectUpdatedAt]),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: projectsUpdated,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...CATEGORIES.flatMap((category) =>
      projects
        .filter((p) => p.category === category)
        .map((p) => ({
          url: `${SITE_URL}/${category}/${p.slug}`,
          lastModified: new Date(p.updatedAt),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
    ),
  ];
}
