import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { SITE_TITLE } from "@/lib/site";
import ProjectPage from "@/components/ProjectPage";
import {
  fetchProjectBySlug,
  fetchProjectSlugs,
  type Category,
} from "@/sanity/queries";

const CATEGORIES: Category[] = ["personal", "commissioned"];

function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export async function generateStaticParams() {
  const slugsByCategory = await Promise.all(
    CATEGORIES.map((category) => fetchProjectSlugs(category)),
  );
  return CATEGORIES.flatMap((category, i) =>
    slugsByCategory[i].map((slug) => ({ category, slug })),
  );
}

// Its title (with the client, when that says something the title doesn't),
// its short description — or, without one, a line built from its credits —
// and its cover (or first image) as the share image.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isCategory(category)) return {};
  const project = await fetchProjectBySlug(category, slug);
  if (!project) return {};

  const title =
    project.client &&
    project.client.toLowerCase() !== project.title.toLowerCase()
      ? `${project.title} — ${project.client}`
      : project.title;

  const byline = [project.client, project.agency].filter(Boolean).join(", ");
  const description =
    project.description?.trim() ||
    `${project.title}${byline ? ` for ${byline}` : ""}${
      project.year ? ` (${project.year})` : ""
    }. ${category === "personal" ? "Personal work" : "Commissioned work"} by ${SITE_TITLE}.`;

  const firstImage = project.images?.find((m) => m.type === "image");
  return pageMetadata({
    title,
    description,
    path: `/${category}/${slug}`,
    image: project.coverImageUrl ?? firstImage?.url,
    imageAlt:
      (project.coverImageUrl ? project.coverAlt : firstImage?.alt) ??
      project.title,
    type: "article",
  });
}

// A single project, linked from its title in InfoLayout — one Cover's
// worth of gallery, on its own page.
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();

  const project = await fetchProjectBySlug(category, slug);
  if (!project) notFound();

  return <ProjectPage project={project} category={category} />;
}
