export default function StatCard({ label, value }) {
  return (
    <div className="rounded border border-line dark:border-[#333b47] bg-white/60 dark:bg-[#1e242e]/60 px-5 py-4">
      <p className="font-display text-2xl text-ink dark:text-[#e9e4d8]">{value}</p>
      <p className="mt-1 text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">{label}</p>
    </div>
  );
}
