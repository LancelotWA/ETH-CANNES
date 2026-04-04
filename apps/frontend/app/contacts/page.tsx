"use client";

import { useAccount } from "wagmi";

import { ContactsList } from "@/components/contacts/contacts-list";

export default function ContactsPage() {
  const { address } = useAccount();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Contacts</h1>
      {address && <ContactsList address={address} />}
    </div>
  );
}
