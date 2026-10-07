export type ProjectMedia = {
  url: string;
  type: "image" | "file";
  caption?: string;
  /** Optional alt text from Sanity (see mediaAlt). */
  alt?: string;
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

export type ConnectLink = {
  label: string;
  url: string;
};

export type Connect = {
  email?: string;
  phone?: string;
  instagram?: string;
  other?: ConnectLink[];
};

export type About = {
  shortBio?: PortableTextBlock[];
  longBio?: PortableTextBlock[];
  bioImageUrl?: string;
  links?: AboutLink[];
  /** From the separate Connect document. */
  connect?: Connect;
};

export type Project = {
  title: string;
  slug?: string;
  coverImageUrl?: string;
  coverAlt?: string;
  /** A video cover takes precedence over `coverImageUrl` when both are set. */
  coverVideoUrl?: string;
  client?: string;
  agency?: string;
  /** Optional short description, for search results and link previews. */
  description?: string;
  year?: number;
  images?: ProjectMedia[];
  credits?: Credit[];
  featured?: boolean;
};
