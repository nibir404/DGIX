"use client";

import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useLookup } from "@/lib/store";
import type { BuyerRequest, RequestEventKind } from "@/lib/types";

const KIND: Record<RequestEventKind, { icon: IconName; tone: string }> = {
  opened: { icon: "plus", tone: "bg-mist text-primary" },
  matched: { icon: "sparkle", tone: "bg-mist text-primary" },
  shortlist: { icon: "check", tone: "bg-[#E6F4EC] text-success" },
  demo: { icon: "video", tone: "bg-mist text-primary" },
  offer: { icon: "file", tone: "bg-mist text-primary" },
  signed: { icon: "check", tone: "bg-[#E6F4EC] text-success" },
  closed: { icon: "x", tone: "bg-[#FBE7E7] text-danger" },
  note: { icon: "chat", tone: "bg-mist text-muted" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** Dated history of a request: who did what, newest first. */
export function ActivityLog({ request, className, limit }: { request: BuyerRequest; className?: string; limit?: number }) {
  const lk = useLookup();
  // Requests saved before the log existed only know when they were opened.
  const events = (request.log?.length ? request.log : [{ at: request.createdAt, kind: "opened" as const, text: "Request opened" }]).slice().reverse();
  const shown = limit ? events.slice(0, limit) : events;

  return (
    <ol className={clsx("flex flex-col", className)} aria-label="Request activity">
      {shown.map((e, i) => {
        const k = KIND[e.kind] ?? KIND.note;
        const who = "by" in e && e.by ? lk.user(e.by) : undefined;
        const last = i === shown.length - 1;
        return (
          <li key={`${e.at}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-28px)] w-px bg-line" />}
            <span className={clsx("relative flex size-8 shrink-0 items-center justify-center rounded-full", k.tone)}>
              <Icon name={k.icon} size={14} />
            </span>
            <div className="min-w-0 pt-1">
              <div className="text-sm leading-5 text-ink">{e.text}</div>
              <div className="mt-0.5 text-xs leading-4 text-muted">
                <time dateTime={e.at}>{when(e.at)}</time>
                {" · "}
                {who ? `${who.name}${who.role === "staff" ? " (DGIX)" : ""}` : "DGIX system"}
              </div>
            </div>
          </li>
        );
      })}
      {limit && events.length > limit && <li className="pl-11 text-xs text-muted">+ {events.length - limit} earlier</li>}
    </ol>
  );
}
