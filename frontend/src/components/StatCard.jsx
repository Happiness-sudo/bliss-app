export default function StatCard({ label, value }) {
  return (
    <div className="rounded border border-line bg-white/60 px-5 py-4">
      <p className="font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-charcoal/60">{label}</p>
    </div>
  );
}
