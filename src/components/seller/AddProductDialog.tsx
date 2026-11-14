"use client";

import { useState } from "react";
import clsx from "clsx";
import { Dialog } from "@/components/buyer/kit";
import { Button } from "@/components/portal/ui";
import { Icon } from "@/components/ui/Icon";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const FIELD =
  "w-full rounded-lg border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "erp", label: "ERP" },
  { value: "hr", label: "HR & payroll" },
  { value: "crm", label: "CRM" },
  { value: "retail", label: "Retail & POS" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "ai", label: "AI & automation" },
  { value: "custom", label: "Custom software" },
  { value: "services", label: "Services" },
];
const MARKETS = ["UAE", "KSA", "Qatar", "USA"];

/** Seller: start a new product passport. It enters review at PG0 with every check open. */
export function AddProductDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: (id: string, name: string) => void }) {
  const { addProduct } = useStore();
  const [f, setF] = useState({ name: "", category: "erp" as Category, tagline: "", description: "", price: "" });
  const [markets, setMarkets] = useState<string[]>(["UAE"]);
  const price = Number(f.price.replace(/[^0-9]/g, "")) || 0;
  const ok = f.name.trim().length > 1 && f.tagline.trim().length > 2 && markets.length > 0 && price > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ok) return;
    const id = addProduct({
      name: f.name.trim(),
      category: f.category,
      tagline: f.tagline.trim(),
      description: f.description.trim() || f.tagline.trim(),
      markets,
      priceFrom: price,
    });
    onAdded(id, f.name.trim());
    setF({ name: "", category: "erp", tagline: "", description: "", price: "" });
    setMarkets(["UAE"]);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Add a product">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <p className="text-sm text-muted">DGIX reviews every claim before buyers see it. You&apos;ll upload evidence for 8 checks next.</p>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Product name</span>
          <input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. ClinicFlow EMR" className={clsx(FIELD, "h-11")} />
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Category</span>
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Category })} className={clsx(FIELD, "h-11")}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Price from (USD)</span>
            <input inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} placeholder="24000" className={clsx(FIELD, "h-11")} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">One-line pitch</span>
          <input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} placeholder="Patient records and billing for multi-site clinics" className={clsx(FIELD, "h-11")} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">What it does <span className="font-normal text-muted">(optional)</span></span>
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={clsx(FIELD, "resize-none py-3")} />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-medium">Markets you want to sell in</legend>
          <div className="flex flex-wrap gap-2">
            {MARKETS.map((m) => {
              const on = markets.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMarkets((x) => (on ? x.filter((y) => y !== m) : [...x, m]))}
                  className={clsx(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
                    on ? "border-primary bg-mist font-medium text-primary" : "border-line bg-white text-ink hover:border-primary/40",
                  )}
                >
                  {on && <Icon name="check" size={14} />}
                  {m}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!ok}>Submit for review</Button>
        </div>
      </form>
    </Dialog>
  );
}
