"use client";

import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/buyer/ProjectDetail";
import { Btn, useBuyer } from "@/components/buyer/kit";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const b = useBuyer();
  const p = b.projects.find((x) => x.id === id);
  if (!p)
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-paper px-6 py-16 text-center">
        <div className="text-lg text-ink">{b.ready ? "Project not found" : "Loading…"}</div>
        {b.ready && <Btn href="/buyer/projects">All projects</Btn>}
      </div>
    );
  return <ProjectDetail project={p} />;
}
