"use client";

import { useApiQuery } from "@/hooks/useApi";
import type { Contact } from "@ethcannes/types";

interface ContactsListProps {
  userId: string;
}

export function ContactsList({ userId }: ContactsListProps) {
  const { data: contacts, isLoading } = useApiQuery<Contact[]>(`/contacts/${userId}`);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl glass-card bg-surface/50" />
        ))}
      </div>
    );
  }

  const items = contacts ?? [];

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-2xl border-dashed py-16 text-center">
        <p className="text-sm text-text font-medium mb-1">No contacts yet.</p>
        <p className="mt-1 text-xs text-text-muted">
          Contacts are added automatically when you send payments.
        </p>
      </div>
    );
  }

  const regular = items.filter((c) => !c.isGhost);
  const ghosts = items.filter((c) => c.isGhost);

  return (
    <div className="space-y-8 mt-4">
      {regular.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-muted/80 pb-2 border-b border-border">Connections</h3>
          <ul className="space-y-3">
            {regular.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
      {ghosts.length > 0 && (
        <section>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-private/80 pb-2 border-b border-border">
            Ghost contacts
            <span className="ml-2 font-normal normal-case text-private-dim/80 hidden sm:inline">(private payments only)</span>
          </h3>
          <ul className="space-y-3">
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
    <li className="flex items-center gap-4 rounded-xl border border-white/5 bg-surface p-4 shadow-sm transition-transform hover:scale-[1.01]">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] ${
          contact.isGhost
            ? "bg-private-dim text-private border border-private/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]"
            : "bg-public-dim text-public border border-public/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
        }`}
      >
        {contact.isGhost ? "👻" : (contact.alias[0] ?? "?").toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-base font-bold text-white tracking-wide">{contact.alias}</p>
        {contact.isGhost ? (
          <p className="text-xs font-medium text-private/80 mt-0.5">No on-chain link · Private connection</p>
        ) : (
          <p className="text-xs font-medium text-public/80 mt-0.5">Public connection</p>
        )}
      </div>
    </li>
  );
}
