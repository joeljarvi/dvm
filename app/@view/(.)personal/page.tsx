import { fetchProjects } from "@/sanity/queries";
import { models } from "@/lib/data";
import ViewBrowser from "@/components/ViewBrowser";
import Layer from "@/components/Layer";

// Level 1 — intercepts /personal, layered over the home page.
export default async function PersonalViewModal() {
  const list = await fetchProjects("personal");
  return (
    <Layer level={1}>
      <ViewBrowser list={list.length > 0 ? list : models} panel="personal" />
    </Layer>
  );
}
