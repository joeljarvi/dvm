export type View = "personal" | "commissioned" | null;

export type ProjectMedia = {
  url: string;
  type: "image" | "file";
};

export type Credit = {
  role: string;
  name: string;
};

export type Project = {
  title: string;
  slug?: string;
  coverImageUrl?: string;
  client?: string;
  agency?: string;
  year?: number;
  images?: ProjectMedia[];
  credits?: Credit[];
};
