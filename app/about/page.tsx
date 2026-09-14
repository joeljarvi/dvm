import AboutSection from "@/components/AboutSection";
import { fetchAbout } from "@/sanity/queries";

// Full, linkable about page.
export default async function AboutPage() {
  const about = await fetchAbout();

  return (
    <main className="w-screen h-dvh">
      <AboutSection about={about} />
    </main>
  );
}
