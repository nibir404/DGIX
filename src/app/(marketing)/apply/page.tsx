import { Suspense } from "react";
import type { Metadata } from "next";
import { UnifiedOnboardingWizard } from "@/components/onboarding/UnifiedOnboardingWizard";

export const metadata: Metadata = {
  title: "Become a partner · Seller Registration",
  description: "Unified AWS Marketplace-style seller registration, KYB verification, and product onboarding for DGIX.",
};

export default function ApplyPage() {
  return (
    <Suspense>
      <section className="mx-auto w-full max-w-[960px] px-4 py-12 md:px-8 md:py-16">
        <UnifiedOnboardingWizard initialMode="sell" />
      </section>
    </Suspense>
  );
}
