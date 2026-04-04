"use client";

import { useEffect, useState } from "react";

import { getJson } from "@/lib/api";
import type { Contact } from "@ethcannes/types";

interface ContactsListProps {
  userId: string;
}

export function ContactsList({ userId }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJson<Contact[]>(`/contacts/${userId}`)
      .then(setContacts)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-2xl bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
        <p className="text-sm text-zinc-400">No contacts yet.</p>
        <p className="mt-1 text-xs text-zinc-300">
          Contacts are added automatically when you send payments.
        </p>
      </div>
    );
  }

  const regular = contacts.filter((c) => !c.isGhost);
  const ghosts = contacts.filter((c) => c.isGhost);

  return (
    <div className="space-y-6">
      {regular.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Contacts</h3>
          <ul className="space-y-2">
            {regular.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
      {ghosts.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Ghost contacts
            <span className="ml-1 font-normal normal-case text-zinc-300">(private payments only)</span>
          </h3>
          <ul className="space-y-2">
            {ghosts.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          contact.isGhost
            ? "bg-violet-100 text-violet-600"
            : "bg-zinc-100 text-zinc-600"
        ].join(" ")}
      >
        {contact.isGhost ? "👻" : (contact.alias[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-zinc-800">{contact.alias}</p>
        {contact.isGhost && (
          <p className="text-xs text-violet-400">No on-chain link · private contact</p>
        )}
      </div>
    </li>
  );
}
