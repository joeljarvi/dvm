import { notFound } from "next/navigation";
import { fetchProjectBySlug } from "@/sanity/queries";
import ProjectDetail from "@/components/ProjectDetail";

// /commissioned/[slug].
export default async function CommissionedProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchProjectBySlug("commissioned", slug);
  if (!project) notFound();

  return (
    <main className="w-screen h-dvh">
      <ProjectDetail project={project} panel="commissioned" />
    </main>
  );
}
