export type ProjectMedia = {
  url: string;
  type: "image" | "file";
  caption?: string;

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

  connect?: Connect;
};

export type Project = {
  title: string;
  slug?: string;
  coverImageUrl?: string;
  coverAlt?: string;

  coverVideoUrl?: string;
  client?: string;
  agency?: string;

  description?: string;
  year?: number;
  images?: ProjectMedia[];
  credits?: Credit[];
  featured?: boolean;
};
