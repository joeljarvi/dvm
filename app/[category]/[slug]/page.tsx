import { notFound } from "next/navigation";
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
