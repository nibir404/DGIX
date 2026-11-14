"use client";

import Link from "next/link";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";

const glow = "linear-gradient(180deg, #4C85EE 0%, #1E4FA3 100%)";

export function GlowButton({ href, children, className, onClick, type, big }: { href?: string; children: React.ReactNode; className?: string; onClick?: () => void; type?: "submit" | "button"; big?: boolean }) {
  const cls = clsx(
    "group inline-flex items-center justify-center gap-2 rounded-lg px-[26px] font-semibold text-white transition-transform hover:-translate-y-0.5 shadow-[inset_0_1px_0_#FFFFFF66,0_12px_32px_-8px_#1E4FA3B3]",
    big ? "h-[60px] text-[17px] leading-[22px]" : "h-[56px] text-base leading-5",
    className,
  );
  const inner = (
    <>
      {children}
      <Icon name="arrowRight" size={18} className="transition-transform group-hover:translate-x-0.5" />
    </>
  );
  if (href) return <Link href={href} className={cls} style={{ backgroundImage: glow }}>{inner}</Link>;
  return <button type={type ?? "button"} onClick={onClick} className={cls} style={{ backgroundImage: glow }}>{inner}</button>;
}

export function GhostButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("inline-flex h-[56px] items-center justify-center rounded-lg border border-white/22 bg-white/8 px-6 text-base font-medium leading-5 text-white transition-colors hover:bg-white/14", className)}>
      {children}
    </Link>
  );
}

/** Outer page wrapper: 16px inset like the 1440 artboards. */
export function Section({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={clsx("px-4 md:px-[56px]", className)}>{children}</section>;
}

/** Absolutely-positioned background layer for PageHero variants whose gradient differs from bg-night-hero. */
export function HeroBg({ image }: { image: string }) {
  return <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: image }} />;
}

export const BG = {
  red: "radial-gradient(ellipse 60% 90% at 100% 10%, #E52A2A73 0%, #E52A2A00 60%), radial-gradient(ellipse 60% 90% at 0% 100%, #2C8C9E 0%, #2C8C9E00 70%), linear-gradient(135deg, #08152F 0%, #133A5E 100%)",
  blue: "radial-gradient(ellipse 60% 90% at 100% 0%, #2F6BD8 0%, #2F6BD800 60%), radial-gradient(ellipse 40% 70% at 85% 100%, #F6A11A4D 0%, #F6A11A00 65%), radial-gradient(ellipse 60% 90% at 0% 100%, #163C7E 0%, #163C7E00 70%), linear-gradient(#08152F, #08152F)",
};
