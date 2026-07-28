import { fetchProjects } from "@/sanity/queries";
import { clients } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";
import Layer from "@/components/Layer";

// Level 1 — intercepts /commissioned, layered over the home page.
export default async function CommissionedViewModal() {
  const list = await fetchProjects("commissioned");
  return (
    <Layer level={1}>
      <ViewBrowser
        list={list.length > 0 ? list : clients}
        panel="commissioned"
      />
    </Layer>
  );
}
