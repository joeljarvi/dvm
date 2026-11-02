import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { SITE_TITLE } from "@/lib/site";
import ProjectPage from "@/components/ProjectPage";
import JsonLd from "@/components/JsonLd";
import { projectSchema } from "@/lib/structuredData";
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();

  const project = await fetchProjectBySlug(category, slug);
  if (!project) notFound();

  const credit = category === "personal" ? "Model" : "Client";
  return (
    <>
      <JsonLd data={projectSchema(project, category)} />

      <section className="sr-only">
        <h1>{project.title}</h1>
        <p>
          {category === "personal" ? "Personal work" : "Commissioned work"} by{" "}
          {SITE_TITLE}
          {project.year ? `, ${project.year}` : ""}.
        </p>
        {project.client && (
          <p>
            {credit}: {project.client}
          </p>
        )}
        {project.agency && <p>Agency: {project.agency}</p>}
        {project.description && <p>{project.description}</p>}
        {!!project.credits?.length && (
          <ul>
            {project.credits
              .filter((c) => c.name)
              .map((c, i) => (
                <li key={i}>
                  {c.role ? `${c.role}: ` : ""}
                  {c.name}
                </li>
              ))}
          </ul>
        )}
      </section>
      <ProjectPage project={project} category={category} />
    </>
  );
}
