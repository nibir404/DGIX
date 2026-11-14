"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useLookup } from "@/lib/store";
import { Arrow, Btn, Heading, Panel, StatusTag, dayMonth, requestThumb, useBuyer } from "@/components/buyer/kit";

export default function Requests() {
  const b = useBuyer();
  const lk = useLookup();
  const list = [...b.requests].sort((a, c) => c.createdAt.localeCompare(a.createdAt));
  const href = (r: (typeof list)[number]) => (r.status === "won" ? "/buyer/projects" : r.status === "offer" ? "/buyer/offers" : `/buyer/shortlist?request=${r.id}`);

  return (
    <div className="flex flex-col gap-5">
      <Heading kicker={`${b.company?.name ?? ""} · ${list.length} requests`} title="Requests" action={<Btn href="/buyer/requests/new">New request <Arrow color="#FFFFFF" /></Btn>} />
      <Panel className="flex flex-col px-5 py-1.5">
        {list.length === 0 && <div className="py-10 text-center text-sm text-muted">No requests yet. Tell us what you need and we&apos;ll shortlist in 24 hours.</div>}
        {list.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={href(r)} className={clsx("flex items-center gap-3.5 py-3.5", i < list.length - 1 && "border-b border-[#F1F4FA]")}>
              <Image src={requestThumb(r)} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg object-cover" />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="truncate text-sm font-medium leading-[18px] text-ink">{r.title}</div>
                <div className="truncate text-xs leading-4 text-muted">
                  {r.ref} · Sent {dayMonth(r.createdAt)} · {r.shortlist.length} matches{r.ownerId ? ` · ${lk.user(r.ownerId)?.name}` : ""}
                </div>
              </div>
              <div className="hidden text-xs leading-4 text-muted md:block">{r.budget} · {r.goLive}</div>
              <StatusTag status={r.status} />
            </Link>
          </motion.div>
        ))}
      </Panel>
    </div>
  );
}
