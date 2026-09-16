export type View = "personal" | "commissioned" | null;

export type ProjectMedia = {
  url: string;
  type: "image" | "file";
  caption?: string;
};

export type Credit = {
  role: string;
  name: string;
};

import type { PortableTextBlock } from "@portabletext/types";

export type AboutLink = {
  title: string;
  url: string;
  description: string;
};

export type About = {
  bio?: PortableTextBlock[];
  bioImageUrl?: string;
  phone?: string;
  email?: string;
  links?: AboutLink[];
};

export type Project = {
  title: string;
  slug?: string;
  coverImageUrl?: string;
  /** A video cover takes precedence over `coverImageUrl` when both are set. */
  coverVideoUrl?: string;
  client?: string;
  agency?: string;
  year?: number;
  images?: ProjectMedia[];
  credits?: Credit[];
  featured?: boolean;
};
