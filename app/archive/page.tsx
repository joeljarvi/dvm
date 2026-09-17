import IndexSection from "@/components/IndexSection";
import { fetchProjects } from "@/sanity/queries";

// Full, linkable index page.
export default async function IndexPage() {
  const [personal, commissioned] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
  ]);

  return (
    <main className="w-screen h-dvh">
      <IndexSection projects={{ personal, commissioned }} />
    </main>
  );
}
