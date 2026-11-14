import { PortalShell } from "@/components/portal/PortalShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalShell role="staff">{children}</PortalShell>;
}
