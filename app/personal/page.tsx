import { fetchProjects } from "@/sanity/queries";
import { models } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";

// Full, linkable page for the personal category.
export default async function PersonalPage() {
  const list = await fetchProjects("personal");
  return (
    <main className="w-screen h-dvh">
      <ViewBrowser list={list.length > 0 ? list : models} panel="personal" />
    </main>
  );
}
