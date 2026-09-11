import type { Project } from "./types";

export const clients: Project[] = [
  { title: "Björk & Berries" },
  { title: "Apoteket Hjärtat" },
  { title: "H&M" },
  { title: "IKEA" },
  { title: "Pressbyrån" },
  { title: "Lyko" },
  { title: "If" },
  { title: "Lendo" },
  { title: "KPMG" },
  { title: "Inika" },
  { title: "KÄLLA" },
  { title: "Åkestam Holst" },
  { title: "Bold" },
  { title: "NoA Ignite" },
  { title: "Bluebird" },
];

// Placeholder clients outside the curated list — shown only when the Index
// overlay's "All projects" toggle is on, to visualize a fuller index/carousel
// without touching the real, curated content.
export const extraClients: Project[] = Array.from({ length: 10 }, (_, i) => ({
  title: `Boring Client #${i + 1}`,
  client: `Boring Client #${i + 1}`,
}));

export const models: Project[] = [
  { title: "Johan" },
  { title: "Karin, Daniel och Erik" },
  { title: "Mamma" },
  { title: "Jonas" },
  { title: "Lena" },
  { title: "Monika" },
  { title: "Sara" },
  { title: "Tyra" },
  { title: "Noel" },
  { title: "Maria" },
  { title: "Ibrahim" },
  { title: "Josef" },
  { title: "Hilma och Scott" },
  { title: "Nathan" },
  { title: "Emil" },
];

// Same idea as extraClients, for the personal index's "All projects" toggle.
export const extraModels: Project[] = Array.from({ length: 10 }, (_, i) => ({
  title: `Boring Person #${i + 1}`,
  client: `Boring Person #${i + 1}`,
}));

// Which placeholder set backs each category's "All projects" toggle.
export const extraProjects: Record<"commissioned" | "personal", Project[]> = {
  commissioned: extraClients,
  personal: extraModels,
};
