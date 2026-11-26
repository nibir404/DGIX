"use client";

import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";

/** Secondary "Download CSV" button used above portal tables. */
export function CsvButton({ onClick, label = "Download CSV", className, disabled }: { onClick: () => void; label?: string; className?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-[13px] font-semibold text-ink transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <Icon name="download" size={15} />
      {label}
    </button>
  );
}
