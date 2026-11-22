"use client";

import { UnifiedOnboardingWizard } from "@/components/onboarding/UnifiedOnboardingWizard";

export function CreateAccountForm() {
  return <UnifiedOnboardingWizard initialMode="buy" embedded />;
}
