"use client";

import { ProjectDetail } from "@/components/buyer/ProjectDetail";
import { Btn, useBuyer } from "@/components/buyer/kit";

export default function Projects() {
  const b = useBuyer();
  const p = b.projects.find((x) => x.milestones.some((m) => m.status === "in_review")) ?? b.projects.find((x) => x.milestones.some((m) => m.status !== "done")) ?? b.projects[0];
  if (!p)
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg bg-paper px-6 py-16 text-center">
        <div className="text-lg text-ink">No projects yet</div>
        <div className="max-w-sm text-sm text-muted">Once you sign an offer, delivery is tracked here milestone by milestone.</div>
        <Btn href="/buyer/offers">See offers</Btn>
      </div>
    );
  return <ProjectDetail project={p} />;
}
