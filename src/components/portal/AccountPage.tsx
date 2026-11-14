"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useLookup, useStore } from "@/lib/store";
import { Button, Card, Chip, PageTitle, Toast } from "./ui";

const ROLE_LABEL = { buyer: "Buyer", seller: "Seller partner", staff: "DGIX staff" } as const;
const PREFS = [
  { key: "email", label: "Email me about approvals and alerts", hint: "Shortlists, offers, milestones and invoices that need you." },
  { key: "weekly", label: "Weekly status summary", hint: "A Monday email with every open project and payment." },
  { key: "product", label: "Product news from DGIX", hint: "New verified products and market updates. Occasional." },
] as const;
type PrefKey = (typeof PREFS)[number]["key"];

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-base text-ink outline-none transition-colors placeholder:text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm disabled:bg-[#F5F8FC] disabled:text-muted";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-primary" : "bg-line")}
    >
      <span className={clsx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

/** Shared "Profile & settings" screen for the buyer, seller and staff portals. */
export function AccountPage() {
  const { user, updateProfile, changePassword, signOut } = useStore();
  const { company } = useLookup();
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  const [form, setForm] = useState({ name: "", title: "", email: "" });
  useEffect(() => {
    if (user) setForm({ name: user.name, title: user.title, email: user.email });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");

  const prefKey = user ? `dgix_prefs_${user.id}` : "";
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({ email: true, weekly: true, product: false });
  useEffect(() => {
    if (!prefKey) return;
    try {
      const raw = localStorage.getItem(prefKey);
      if (raw) setPrefs((p) => ({ ...p, ...JSON.parse(raw) }));
    } catch {}
  }, [prefKey]);
  const setPref = (k: PrefKey, v: boolean) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      localStorage.setItem(prefKey, JSON.stringify(next));
    } catch {}
    flash("Notification preferences saved");
  };

  // Scroll to #profile / #settings when arriving from the account menu
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }, []);

  if (!user) return null;
  const co = company(user.companyId);
  const dirty = form.name !== user.name || form.title !== user.title || form.email !== user.email;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const canSave = dirty && form.name.trim().length > 1 && emailOk;

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    updateProfile({ name: form.name.trim(), title: form.title.trim(), email: form.email.trim() });
    flash("Profile updated");
  };

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pw.next.length < 8) return setPwError("Use at least 8 characters.");
    if (pw.next !== pw.confirm) return setPwError("The new passwords don't match.");
    if (!changePassword(pw.current, pw.next)) return setPwError("Your current password isn't right.");
    setPw({ current: "", next: "", confirm: "" });
    flash("Password changed");
  };

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5">
      <PageTitle kicker="Your account" title="Profile & settings" />

      <section id="profile" className="scroll-mt-6">
        <Card title="Profile" meta={<Chip tone="success">{ROLE_LABEL[user.role]}</Chip>}>
          <form onSubmit={saveProfile} className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar user={{ ...user, name: form.name || user.name }} size={64} />
              <div className="min-w-0">
                <div className="truncate text-[17px] font-semibold text-ink">{form.name || user.name}</div>
                <div className="truncate text-sm text-muted">{co?.name}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" className={inputCls} />
              </Field>
              <Field label="Job title">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoComplete="organization-title" className={inputCls} />
              </Field>
              <Field label="Work email" hint={!emailOk && form.email ? "Enter a valid email address." : undefined}>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" className={inputCls} />
              </Field>
              <Field label="Company" hint="Ask your DGIX advisor to change company details.">
                <input value={co?.name ?? ""} disabled className={inputCls} />
              </Field>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={!dirty} onClick={() => setForm({ name: user.name, title: user.title, email: user.email })}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>Save changes</Button>
            </div>
          </form>
        </Card>
      </section>

      <section id="settings" className="flex scroll-mt-6 flex-col gap-5">
        <Card title="Password">
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Current password">
                <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" className={inputCls} />
              </Field>
              <Field label="New password" hint="At least 8 characters.">
                <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" className={inputCls} />
              </Field>
              <Field label="Confirm new password">
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} autoComplete="new-password" className={inputCls} />
              </Field>
            </div>
            {pwError && <p className="text-sm text-danger">{pwError}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="soft" disabled={!pw.current || !pw.next || !pw.confirm}>Change password</Button>
            </div>
          </form>
        </Card>

        <Card title="Security">
          <div className="flex items-start gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F4EC] text-success"><Icon name="shield" size={18} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-semibold text-ink">Two-factor sign-in</span>
                <Chip tone="success">On</Chip>
              </div>
              <p className="mt-1 text-sm text-muted">A code is required each time you sign in on a new device. Company admins can&apos;t turn this off.</p>
            </div>
          </div>
        </Card>

        <Card title="Notifications">
          <div className="flex flex-col divide-y divide-line">
            {PREFS.map((p) => (
              <div key={p.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <div className="text-[15px] font-medium text-ink">{p.label}</div>
                  <div className="text-sm text-muted">{p.hint}</div>
                </div>
                <Toggle on={prefs[p.key]} onChange={(v) => setPref(p.key, v)} label={p.label} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[15px] font-semibold text-ink">Sign out</div>
              <p className="text-sm text-muted">End your session on this device.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="text-danger hover:border-danger"
            >
              <Icon name="logout" size={16} /> Sign out
            </Button>
          </div>
        </Card>
      </section>

      <Toast show={!!toast}>{toast}</Toast>
    </div>
  );
}
