import { useEffect, useState } from "react";
import { api } from "../api";
import OrderCard from "../components/OrderCard";
import StatCard from "../components/StatCard";

export default function WriterDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [submittingTo, setSubmittingTo] = useState(null);
  const [text, setText] = useState("");

  async function load() {
    try {
      const d = await api.writerDashboard();
      setData(d);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(orderId) {
    try {
      await api.submitWork(orderId, text);
      setSubmittingTo(null);
      setText("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !data) return <p className="mx-auto max-w-4xl px-6 py-10 text-amber">{error}</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-6 py-10 text-charcoal/60">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl text-ink">Your assignments</h1>
      <p className="mt-1 text-sm text-charcoal/60">Orders assigned to you, and what's left to deliver.</p>

      {error && (
        <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Total" value={data.stats.total} />
        <StatCard label="In progress" value={data.stats.in_progress} />
        <StatCard label="Submitted" value={data.stats.submitted} />
        <StatCard label="Completed" value={data.stats.completed} />
      </div>

      <h2 className="mt-10 font-display text-lg text-ink">Orders</h2>
      <div className="mt-4 space-y-3">
        {data.orders.length === 0 && <p className="text-sm text-charcoal/60">Nothing assigned to you yet.</p>}
        {data.orders.map((o) => (
          <div key={o.id}>
            <OrderCard
              order={o}
              action={
                (o.status === "assigned" || o.status === "in_progress") && (
                  <button
                    onClick={() => setSubmittingTo(submittingTo === o.id ? null : o.id)}
                    className="rounded border border-ink px-3 py-1 text-xs text-ink hover:bg-ink hover:text-paper"
                  >
                    Submit work
                  </button>
                )
              }
            />
            {submittingTo === o.id && (
              <div className="mt-2 rounded border border-line bg-white/60 p-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or write the completed piece here…"
                  rows={6}
                  className="w-full rounded border border-line bg-white/70 p-2 text-sm outline-none focus:border-amber"
                />
                <button
                  onClick={() => handleSubmit(o.id)}
                  className="mt-2 rounded bg-amber px-4 py-1.5 text-sm text-white hover:bg-amber/90"
                >
                  Send to bidder
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
