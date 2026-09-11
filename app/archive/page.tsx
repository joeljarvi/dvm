import IndexSection from "@/components/IndexSection";
import { fetchProjects } from "@/sanity/queries";

// Full, linkable index page.
export default async function IndexPage() {
  const commissioned = await fetchProjects("commissioned");

  return (
    <main className="w-screen h-dvh">
      <IndexSection projects={commissioned} category="commissioned" />
    </main>
  );
}
