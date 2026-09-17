import { fetchProjects } from "@/sanity/queries";
import { models, clients } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";

// Full, linkable page for the personal category.
export default async function PersonalPage() {
  const [list, siblingList] = await Promise.all([
    fetchProjects("personal"),
    fetchProjects("commissioned"),
  ]);
  return (
    <main className="w-screen h-dvh">
      <ViewBrowser
        list={list.length > 0 ? list : models}
        siblingList={siblingList.length > 0 ? siblingList : clients}
        panel="personal"
      />
    </main>
  );
}
