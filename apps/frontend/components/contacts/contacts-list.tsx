"use client";

interface ContactsListProps {
  address: `0x${string}`;
}

export function ContactsList({ address }: ContactsListProps) {
  // Phase 2: derive contacts from onchain tx history
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center">
      <p className="text-sm text-zinc-400">No contacts yet.</p>
      <p className="mt-1 text-xs text-zinc-300 font-mono">{address}</p>
      <p className="mt-2 text-xs text-zinc-300">
        Contacts are derived from onchain tx history — wired in Phase 2.
      </p>
    </div>
  );
}
