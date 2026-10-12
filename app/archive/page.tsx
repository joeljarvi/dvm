import IndexSection from "@/components/IndexSection";
import type { Metadata } from "next";
import { fetchProjects, fetchSiteSettings } from "@/sanity/queries";
import { pageMetadata } from "@/lib/metadata";
import { SITE_TITLE } from "@/lib/site";

// Called Index on the site; shared with the site's Share Image, like home.
export async function generateMetadata(): Promise<Metadata> {
  const { shareImageUrl } = await fetchSiteSettings();
  return pageMetadata({
    title: "Index",
    description: `Every project by ${SITE_TITLE}: personal and commissioned work, by client.`,
    path: "/archive",
    image: shareImageUrl ?? undefined,
    imageAlt: SITE_TITLE,
  });
}

// Full, linkable index page.
export default async function IndexPage() {
  const [personal, commissioned] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
  ]);

  return (
    <main className="w-screen h-dvh">
      <IndexSection projects={{ personal, commissioned }} />
    </main>
  );
}
