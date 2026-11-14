"use client";

import { Suspense } from "react";
import { SearchResults } from "@/components/marketing/catalogue/SearchResults";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
