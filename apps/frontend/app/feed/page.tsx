"use client";

import { AppProviders } from "@/components/providers/app-providers";
import { FeedList } from "@/components/feed/feed-list";

export default function FeedPage() {
  return (
    <AppProviders>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-bold">Public feed</h1>
        <FeedList />
      </div>
    </AppProviders>
  );
}
