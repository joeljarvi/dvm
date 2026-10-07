import { toPlainText } from "@portabletext/react";
import { fetchAbout, fetchProjects, type Category } from "@/sanity/queries";
import type { Project } from "@/lib/types";
import {
  FALLBACK_EMAIL,
  FALLBACK_PHONE,
  INSTAGRAM_URL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

// /llms.txt (see llmstxt.org): the site in plain Markdown for AI assistants
// — who Daniel is, how to reach him, and every project with its client,
// agency, year and description. Built from Sanity, so it follows the
// content; regenerated at most hourly.
export const revalidate = 3600;

const CATEGORIES: { key: Category; heading: string }[] = [
  { key: "commissioned", heading: "Commissioned work" },
  { key: "personal", heading: "Personal work" },
];

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

function projectLine(project: Project, category: Category) {
  const url = project.slug
    ? `${SITE_URL}/${category}/${project.slug}`
    : SITE_URL;
  const facts = [
    project.client && project.client !== project.title
      ? // The personal work's "client" is its model, as the site calls it.
        `${category === "personal" ? "model" : "client"}: ${project.client}`
      : null,
    project.agency ? `agency: ${project.agency}` : null,
    project.year ? String(project.year) : null,
  ].filter(Boolean);
  const description = project.description ? oneLine(project.description) : "";
  return `- [${project.title}](${url})${facts.length ? ` (${facts.join(", ")})` : ""}${
    description ? `: ${description}` : ""
  }`;
}

export async function GET() {
  const [about, ...projects] = await Promise.all([
    fetchAbout(),
    ...CATEGORIES.map(({ key }) => fetchProjects(key)),
  ]);

  const bio = about?.shortBio?.length
    ? oneLine(toPlainText(about.shortBio))
    : "";
  const longBio = about?.longBio?.length
    ? oneLine(toPlainText(about.longBio))
    : "";
  const email = about?.connect?.email ?? FALLBACK_EMAIL;
  const phone = about?.connect?.phone ?? FALLBACK_PHONE;
  const instagram = about?.connect?.instagram ?? INSTAGRAM_URL;

  const clients = [
    ...new Set(
      projects[0].map((p) => p.client).filter((c): c is string => !!c),
    ),
  ];

  const lines = [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_TITLE} — ${SITE_DESCRIPTION}.${bio ? ` ${bio}` : ""}`,
    "",
    ...(longBio && longBio !== bio ? [longBio, ""] : []),
    ...(clients.length ? [`Clients include ${clients.join(", ")}.`, ""] : []),
    "## Contact",
    "",
    `- Email: ${email}`,
    `- Phone: ${phone}`,
    `- Instagram: ${instagram}`,
    ...(about?.connect?.other ?? []).map((o) => `- ${o.label}: ${o.url}`),
    "",
    "## Pages",
    "",
    `- [Home](${SITE_URL}): personal and commissioned work`,
    `- [About](${SITE_URL}/about): bio and contact`,
    `- [Connect](${SITE_URL}/connect): phone, email and Instagram`,
    `- [Index](${SITE_URL}/archive): every project, by client`,
    "",
    ...CATEGORIES.flatMap(({ key, heading }, i) =>
      projects[i].length
        ? [
            `## ${heading}`,
            "",
            ...projects[i].map((p) => projectLine(p, key)),
            "",
          ]
        : [],
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
