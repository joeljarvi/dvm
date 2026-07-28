import { fetchProjects } from "@/sanity/queries";
import { clients } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";

// Full, linkable page for the commissioned category.
export default async function CommissionedPage() {
  const list = await fetchProjects("commissioned");
  return (
    <main className="w-screen h-dvh">
      <ViewBrowser list={list.length > 0 ? list : clients} panel="commissioned" />
    </main>
  );
}
