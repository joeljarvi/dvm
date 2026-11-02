import type { About, Project } from "@/lib/types";
import type { Category } from "@/sanity/queries";
import {
  FALLBACK_EMAIL,
  FALLBACK_PHONE,
  INSTAGRAM_URL,
  SITE_SUMMARY,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import { sanityImage } from "@/lib/image";

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function personSchema(about?: About | null) {
  const connect = about?.connect;
  const elsewhere = [
    connect?.instagram ?? INSTAGRAM_URL,
    ...(connect?.other ?? [])
      .map((o) => o.url)
      .filter((url) => /^https?:/.test(url)),
  ];
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE_TITLE,
    url: SITE_URL,
    jobTitle: "Photographer and Creative Producer",
    description: SITE_SUMMARY,
    email: `mailto:${connect?.email ?? FALLBACK_EMAIL}`,
    telephone: connect?.phone ?? FALLBACK_PHONE,
    sameAs: [...new Set(elsewhere)],
  };
}

export function homeSchema(about?: About | null) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_TITLE,
        description: SITE_SUMMARY,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      personSchema(about),
    ],
  };
}

export function aboutSchema(about?: About | null) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/about`,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: personSchema(about),
  };
}

export function projectSchema(project: Project, category: Category) {
  const image =
    project.coverImageUrl ??
    project.images?.find((m) => m.type === "image")?.url;
  const contributors = (project.credits ?? [])
    .filter((c) => c.name)
    .map((c) => ({ "@type": "Person", name: c.name, jobTitle: c.role }));
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    url: `${SITE_URL}/${category}/${project.slug}`,
    ...(project.description && { description: project.description }),
    ...(image && { image: sanityImage(image, { w: 1200 }) }),
    ...(project.year && { dateCreated: String(project.year) }),
    genre: "Photography",
    creator: { "@type": "Person", "@id": PERSON_ID, name: SITE_TITLE },

    ...(project.client &&
      (category === "commissioned"
        ? {
            sponsor: { "@type": "Organization", name: project.client },
            ...(project.agency && {
              producer: { "@type": "Organization", name: project.agency },
            }),
          }
        : { about: { "@type": "Person", name: project.client } })),
    ...(contributors.length && { contributor: contributors }),
    isPartOf: { "@id": WEBSITE_ID },
  };
}
