import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "@/sanity/queries";
import ProjectDetail from "@/components/ProjectDetail";
import Layer from "@/components/Layer";

// Level 2 — intercepts /commissioned/[slug], stacked over the @view browser.
export default async function CommissionedProjectModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProjectBySlug("commissioned", slug);
  if (!project) notFound();

  return (
    <Layer level={2} closeLabel="Close">
      <ProjectDetail project={project} panel="commissioned" />
    </Layer>
  );
}
