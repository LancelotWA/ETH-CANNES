import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-8 py-10">
      <div className="rounded-3xl border border-emerald-200 bg-white/80 p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">ETH Cannes Pay</p>
        <h1 className="mt-3 text-4xl font-bold">Social crypto payments with ENS identity</h1>
        <p className="mt-3 max-w-2xl text-zinc-600">
          Send private payments from wallet to wallet using human-readable names like alice.eth.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard" className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Open dashboard</Link>
          <Link href="/send" className="rounded-xl border border-zinc-300 px-4 py-2">Quick send</Link>
        </div>
      </div>
    </section>
  );
}
