"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Field, inputCls, PrimaryButton, safeNext } from "./AuthShell";
import { TestAccounts } from "./TestAccounts";
import { portalHome, useStore } from "@/lib/store";
import type { User } from "@/lib/types";

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (u: User) => router.push(safeNext(params.get("next")) ?? portalHome[u.role]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = signIn(email, password);
    if (!u) return setError("That email and password don't match an account.");
    go(u);
  };

  const sso = (p: string) => setNotice(`${p} sign-in isn't connected in this demo. Use email or a test account below.`);

  return (
    <div className="flex w-full max-w-[440px] flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[34px] leading-[42px] md:text-[40px] md:leading-12 font-light tracking-tight text-ink">Sign in</h2>
        <p className="text-[15px] leading-[18px] text-muted">Buyers, partners and DGIX staff use the same sign-in.</p>
      </div>
      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => sso("Microsoft")} className="flex h-[52px] items-center justify-center gap-[10px] rounded-lg border border-line text-[15px] font-medium text-ink hover:bg-mist">
          <svg width="18" height="18" viewBox="0 0 24 24"><rect x="2" y="2" width="9" height="9" fill="#F25022" /><rect x="13" y="2" width="9" height="9" fill="#7FBA00" /><rect x="2" y="13" width="9" height="9" fill="#00A4EF" /><rect x="13" y="13" width="9" height="9" fill="#FFB900" /></svg>
          Continue with Microsoft
        </button>
        <button type="button" onClick={() => sso("Google")} className="flex h-[52px] items-center justify-center gap-[10px] rounded-lg border border-line text-[15px] font-medium text-ink hover:bg-mist">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z" fill="#34A853" /><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 000 9.2L6.4 14z" fill="#FBBC05" /><path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003.1 7.4L6.4 10C7.2 7.7 9.4 5.9 12 5.9z" fill="#EA4335" /></svg>
          Continue with Google
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px grow bg-mist" />
        <span className="text-[13px] leading-4 text-[#9AA2B4]">or with email</span>
        <div className="h-px grow bg-mist" />
      </div>
      <form onSubmit={submit} className="flex flex-col gap-6">
        <Field label="Work email">
          <input type="email" required autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} placeholder="you@company.com" className={inputCls} />
        </Field>
        <Field label="Password" aside={<button type="button" onClick={() => setNotice("Password reset isn't available in this demo. Use a test account below.")} className="underline underline-offset-2">Forgot?</button>}>
          <div className="relative">
            <input type={show ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} className={inputCls + " pr-12"} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{show && <path d="M3 3l18 18" />}</svg>
            </button>
          </div>
        </Field>
        <AnimatePresence>
          {(error || notice) && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={"text-sm " + (error ? "text-danger" : "text-muted")}>
              {error ?? notice}
            </motion.p>
          )}
        </AnimatePresence>
        <PrimaryButton>Sign in</PrimaryButton>
      </form>
      <p className="text-center text-sm leading-[18px] text-muted">
        New to DGIX? <Link href="/create-account" className="font-semibold text-ink underline underline-offset-2">Create an account</Link>
      </p>
      <TestAccounts onSignedIn={go} />
    </div>
  );
}
