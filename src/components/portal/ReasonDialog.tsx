"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Dialog } from "@/components/buyer/kit";

/**
 * Asks why something is being closed or declined, so the other side learns the reason.
 * Pick a preset reason; "Something else" requires a short note.
 */
export function ReasonDialog({
  open,
  title,
  intro,
  reasons,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  intro?: string;
  reasons: string[];
  confirmLabel: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const OTHER = "Something else";
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) {
      setChoice("");
      setNote("");
    }
  }, [open]);

  const other = choice === OTHER;
  const ready = choice && (!other || note.trim().length > 2);
  const reason = other ? note.trim() : note.trim() ? `${choice}: ${note.trim()}` : choice;

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onConfirm(reason);
        }}
        className="flex flex-col gap-4"
      >
        {intro && <p className="text-sm leading-[21px] text-muted">{intro}</p>}
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Reason</legend>
          {[...reasons, OTHER].map((r) => (
            <label
              key={r}
              className={clsx(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                choice === r ? "border-primary bg-mist text-ink" : "border-line text-ink/85 hover:border-[#C9D4E8]",
              )}
            >
              <input type="radio" name="reason" value={r} checked={choice === r} onChange={() => setChoice(r)} className="accent-[#1E4FA3]" />
              {r}
            </label>
          ))}
        </fieldset>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">{other ? "Tell us why" : "Add a note (optional)"}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none rounded-lg border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder={other ? "A sentence is enough" : "Anything that helps the other side"}
          />
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-lg border border-line px-5 text-sm font-semibold text-ink hover:border-ink">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!ready}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-danger px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
