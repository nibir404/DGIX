"use client";

import { Suspense } from "react";
import { Catalogue } from "@/components/marketing/catalogue/Catalogue";

export default function SolutionsPage() {
  return (
    <Suspense>
      <Catalogue />
    </Suspense>
  );
}
