import type { Metadata } from "next";

// The Sanity Studio — kept out of search results (and robots.txt disallows
// it too).
export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
