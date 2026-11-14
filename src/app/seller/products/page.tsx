"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Button, Empty } from "@/components/portal/ui";
import { AddProductDialog } from "@/components/seller/AddProductDialog";
import { Icon } from "@/components/ui/Icon";
import { useFlash } from "@/components/admin/kit";
import { Head, NIGHT_CARD, Panel, ProductTabs, scoreOf, useSeller } from "@/components/seller/kit";

export default function ProductsPage() {
  return (
    <Suspense>
      <Products />
    </Suspense>
  );
}

function Products() {
  const { products, focus } = useSeller();
  const [sel, setSel] = useState<string>();
  const [adding, setAdding] = useState(false);
  const { flash, toast } = useFlash();
  const p = products.find((x) => x.id === sel) ?? focus;

  // "+ Add product" in the top bar links here with ?new=1 (also while already on this page)
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (params.get("new") !== "1") return;
    setAdding(true);
    router.replace(pathname, { scroll: false });
  }, [params, router, pathname]);

  const dialog = (
    <>
      <AddProductDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(id, name) => {
          setAdding(false);
          setSel(id);
          flash(`${name} submitted · upload evidence in Verification`);
        }}
      />
      {toast}
    </>
  );
  const addBtn = (
    <Button onClick={() => setAdding(true)} className="shrink-0">
      <Icon name="plus" size={16} /> Add product
    </Button>
  );

  if (!p)
    return (
      <>
        <Empty title="No products yet" body="Add your first product to start its passport. DGIX checks it before buyers see it." action={addBtn} />
        {dialog}
      </>
    );

  const score = scoreOf(p);
  const listed = p.status === "listed";
  const img = p.visual === "people" ? "/media/passport-peoplecore.webp" : "/media/glass-verified.webp";

  return (
    <div className="flex flex-col gap-5">
      <Head kicker={<>Products / {p.name}</>} title="Product passport" right={<ProductTabs products={products} value={p.id} onChange={setSel} />} />

      <div className="flex flex-col gap-4 lg:flex-row">
        <Panel className="flex flex-col gap-5 bg-paper p-5 sm:flex-row lg:grow-[1.5] lg:basis-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="" className="h-[150px] w-full shrink-0 rounded-lg object-cover sm:w-[200px]" />
          <div className="flex grow basis-0 flex-col justify-center gap-2">
            <div className="text-[22px] font-semibold leading-7 text-ink">{p.name}</div>
            <div className="text-sm leading-5 text-muted">{p.description}</div>
            <div className="mt-[6px] flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#F6F8FC] px-[10px] py-[5px] text-xs leading-4 text-ink">v{p.version}</span>
              <span className="rounded-lg bg-[#F6F8FC] px-[10px] py-[5px] text-xs leading-4 text-ink">{p.markets.join(" · ")}</span>
              <span className={clsx("rounded-lg px-[10px] py-[5px] text-xs leading-4", listed ? "bg-[#E6F4EC] text-[#0E6439]" : "bg-[#FFF3DC] text-warning")}>
                {listed ? "Listed · Daffodil Verified" : p.status === "pilot" ? "Pilot" : "Not listed yet"}
              </span>
            </div>
          </div>
        </Panel>

        <Panel className="flex min-h-[190px] flex-col justify-between gap-3 bg-night p-6 lg:grow lg:basis-0" style={{ backgroundImage: NIGHT_CARD }}>
          <div className="text-[13px] leading-4 text-[#FFFFFFB3]">Readiness score</div>
          <div className="flex items-baseline gap-[6px]">
            <div className="text-[56px] font-light leading-[68px] tracking-[-0.05em] text-paper">{score}</div>
            <div className="text-[18px] leading-[22px] text-[#FFFFFF80]">/100</div>
          </div>
          <div className="flex h-2 shrink-0 rounded-lg bg-[#FFFFFF26]">
            <motion.div key={p.id} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="rounded-lg bg-[linear-gradient(90deg,#7FB6FF_0%,#7FB6FF_100%)]" />
          </div>
          <div className="text-xs leading-4 text-[#FFFFFF99]">Only 100/100 is listed as globally ready</div>
        </Panel>
      </div>

      <Panel className="flex shrink-0 flex-col bg-paper px-4 py-2 md:px-6">
        <div className="flex gap-3 border-b border-[#F1F4FA] py-[14px] text-xs font-semibold leading-4 tracking-[0.06em] text-[#9AA2B4]">
          <div className="grow-2 basis-0">CHECK</div>
          <div className="hidden grow-3 basis-0 sm:block">SCORE</div>
          <div className="w-[120px] shrink-0 text-right">STATUS</div>
        </div>
        {p.checks.map((c, i) => {
          const ok = c.score >= c.max;
          return (
            <div key={c.key} className={clsx("flex flex-wrap items-center gap-x-3 gap-y-2 py-[13px] sm:flex-nowrap", i < p.checks.length - 1 && "border-b border-[#F1F4FA]")}>
              <div className="grow-2 basis-0 text-sm leading-[18px] text-ink">
                {c.label}
                {c.key === "readiness" && p.markets[0] ? ` · ${p.markets[0]}` : ""}
              </div>
              <div className="order-last flex w-full items-center gap-[10px] sm:order-none sm:w-auto sm:grow-3 sm:basis-0">
                <div className="flex h-[6px] grow basis-0 rounded-lg bg-mist">
                  <motion.div key={p.id + c.key} initial={{ width: 0 }} animate={{ width: `${(c.score / c.max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.04 }} className={clsx("rounded-lg", ok ? "bg-primary" : "bg-amber")} />
                </div>
                <div className="w-[44px] shrink-0 text-[13px] leading-4 text-ink">
                  {c.score}/{c.max}
                </div>
              </div>
              <div className={clsx("w-[120px] shrink-0 text-right text-xs leading-4", ok ? "text-success" : "font-semibold text-warning")}>
                {ok ? "✓ Passed" : c.note ? <Link href="/seller/verification" className="hover:underline">{c.note}</Link> : <Link href="/seller/verification" className="hover:underline">Evidence needed</Link>}
              </div>
            </div>
          );
        })}
      </Panel>
      {dialog}
    </div>
  );
}
