"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { CreateAccountForm } from "@/components/auth/CreateAccountForm";

export default function CreateAccountPage() {
  return (
    <AuthShell headline="One account. Verified products from Bangladesh to the world.">
      <CreateAccountForm />
    </AuthShell>
  );
}
