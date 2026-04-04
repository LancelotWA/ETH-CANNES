"use client";

import { useApiQuery } from "@/hooks/useApi";
import type { Contact } from "@ethcannes/types";

interface ContactsListProps {
  userId: string | null;
}

export function ContactsList({ userId }: ContactsListProps) {
  const { data: contacts, isLoading } = useApiQuery<Contact[]>(`/contacts/${userId}`);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse border-b-2 border-white/10 bg-transparent" />
        ))}
      </div>
    );
  }

  const items = contacts ?? [];

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-bold tracking-widest text-white/30 uppercase">NO CONTACTS YET</p>
      </div>
    );
  }

  const regular = items.filter((c) => !c.isGhost);
  const ghosts = items.filter((c) => c.isGhost);

  return (
    <div className="w-full flex flex-col mt-4">
      {regular.length > 0 && (
        <section className="mt-4">
          <ul className="flex flex-col w-full">
            {regular.map((c) => (
              <ContactRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
      {ghosts.length > 0 && (
        <section className="mt-8">
          <ul className="flex flex-col w-full">
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
    <li className="flex flex-row items-center justify-between border-0 border-b-2 border-white/10 py-5 transition-colors hover:bg-white/5 px-2 group">
      <div className="flex flex-col">
        <p className="text-2xl font-black text-white uppercase">{contact.alias}</p>
        <div className="text-sm text-white/50 mt-1 uppercase font-bold tracking-widest flex flex-wrap items-center gap-2">
          {contact.isGhost ? (
            <>
              <span className="text-[#8b5cf6]">PRIVATE</span>
              <span className="text-white/30 sm:inline hidden">GHOST CONNECTION</span>
            </>
          ) : (
            <>
              <span className="text-[#10b981]">PUBLIC</span>
              <span className="text-white/30 sm:inline hidden">ON-CHAIN LINK</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right flex items-center justify-end">
        <div className="text-4xl font-black text-white/10 group-hover:text-white/50 transition-colors">
          {contact.isGhost ? "👻" : (contact.alias[0] ?? "?").toUpperCase()}
        </div>
      </div>
    </li>
  );
}
