"use client";

import { AppProviders } from "@/components/providers/app-providers";
import { ContactsList } from "@/components/contacts/contacts-list";
import { useAppStore } from "@/store/useAppStore";

export default function ContactsPage() {
  const activeUserId = useAppStore((state) => state.activeUserId) ?? "de305d54-75b4-431b-adb2-eb6b9e546014";

  return (
    <AppProviders>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-bold">Contacts</h1>
        <ContactsList userId={activeUserId} />
      </div>
    </AppProviders>
  );
}
