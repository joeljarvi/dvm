import { fetchProjects } from "@/sanity/queries";
import { clients, models } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";

// Full, linkable page for the commissioned category.
export default async function CommissionedPage() {
  const [list, siblingList] = await Promise.all([
    fetchProjects("commissioned"),
    fetchProjects("personal"),
  ]);
  return (
    <main className="w-screen h-dvh">
      <ViewBrowser
        list={list.length > 0 ? list : clients}
        siblingList={siblingList.length > 0 ? siblingList : models}
        panel="commissioned"
      />
    </main>
  );
}
