import { Suspense } from "react";
import type { Metadata } from "next";
import { PartnerApply } from "@/components/marketing/PartnerApply";

export const metadata: Metadata = {
  title: "Become a partner",
  description: "Apply to sell your software through DGIX: five short steps, about 6 minutes.",
};

export default function ApplyPage() {
  return (
    <Suspense>
      <PartnerApply />
    </Suspense>
  );
}
