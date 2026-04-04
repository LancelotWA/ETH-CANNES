"use client";

import { Suspense } from "react";
import { ContactsList } from "@/components/contacts/contacts-list";
import { useAppStore } from "@/store/useAppStore";

export default function ContactsPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <Suspense fallback={<p className="text-zinc-500 animate-pulse">Chargement...</p>}>
        <div className="mx-auto max-w-xl">
          <ContactsList userId={activeUserId} />
        </div>
      </Suspense>
    </div>
  );
}
