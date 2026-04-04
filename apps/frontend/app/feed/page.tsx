"use client";

import { Suspense } from "react";
import { FeedList } from "@/components/feed/feed-list";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Public Feed</h1>
      <Suspense fallback={<p className="text-zinc-500 animate-pulse">Chargement...</p>}>
        <div className="mx-auto max-w-xl">
          <FeedList />
        </div>
      </Suspense>
    </div>
  );
}
