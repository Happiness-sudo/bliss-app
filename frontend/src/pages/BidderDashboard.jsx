import { useEffect, useState } from "react";
import { api } from "../api";
import OrderCard from "../components/OrderCard";
import StatCard from "../components/StatCard";

const emptyForm = { order_number: "", instructions: "", word_count: "", payment_amount: "", writer_id: "" };

export default function BidderDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [reassigning, setReassigning] = useState(null);

  async function load() {
    try {
      const d = await api.bidderDashboard();
      setData(d);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateOrder(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createOrder({
        ...form,
        word_count: parseInt(form.word_count) || 0,
        payment_amount: parseFloat(form.payment_amount) || 0,
        writer_id: form.writer_id || null,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAssign(orderId, writerId) {
    try {
      await api.assignWriter(orderId, writerId);
      setReassigning(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function markReviewed(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !data) return <p className="mx-auto max-w-4xl px-6 py-10 text-amber">{error}</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-6 py-10 text-charcoal/60">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Your orders</h1>
          <p className="mt-1 text-sm text-charcoal/60">Log orders won from clients and assign writers.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
        >
          {showForm ? "Cancel" : "Log a new order"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">{error}</p>
      )}

      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Total orders" value={data.stats.total_orders} />
        <StatCard label="Awaiting review" value={data.stats.awaiting_review} />
        <StatCard label="Paid" value={data.stats.paid} />
        <StatCard label="Total earned" value={`$${data.stats.total_earned.toFixed(0)}`} />
      </div>

      {showForm && (
        <form onSubmit={handleCreateOrder} className="mt-8 space-y-3 rounded border border-line bg-white/60 p-5">
          <input
            required
            placeholder="Order number (client reference)"
            value={form.order_number}
            onChange={(e) => setForm({ ...form, order_number: e.target.value })}
            className="w-full rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />
          <textarea
            required
            placeholder="Instructions for the writer…"
            rows={3}
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Word count"
              value={form.word_count}
              onChange={(e) => setForm({ ...form, word_count: e.target.value })}
              className="rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
            />
            <input
              type="number"
              placeholder="Payment ($)"
              value={form.payment_amount}
              onChange={(e) => setForm({ ...form, payment_amount: e.target.value })}
              className="rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
            />
            <select
              value={form.writer_id}
              onChange={(e) => setForm({ ...form, writer_id: e.target.value })}
              className="rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
            >
              <option value="">Assign writer later</option>
              {data.writers.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded bg-amber px-4 py-2 text-sm text-white hover:bg-amber/90">
            Create order
          </button>
        </form>
      )}

      <h2 className="mt-10 font-display text-lg text-ink">Orders</h2>
      <div className="mt-4 space-y-3">
        {data.orders.length === 0 && <p className="text-sm text-charcoal/60">No orders logged yet.</p>}
        {data.orders.map((o) => (
          <div key={o.id}>
            <OrderCard
              order={o}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  {!o.writer_id && (
                    <button
                      onClick={() => setReassigning(reassigning === o.id ? null : o.id)}
                      className="rounded border border-ink px-3 py-1 text-xs text-ink hover:bg-ink hover:text-paper"
                    >
                      Assign writer
                    </button>
                  )}
                  {o.status === "submitted" && (
                    <>
                      <button
                        onClick={() => markReviewed(o.id, "sent_to_client")}
                        className="rounded border border-sage px-3 py-1 text-xs text-sage hover:bg-sage hover:text-white"
                      >
                        Mark sent to client
                      </button>
                    </>
                  )}
                  {o.status === "sent_to_client" && (
                    <button
                      onClick={() => markReviewed(o.id, "paid")}
                      className="rounded border border-sage px-3 py-1 text-xs text-sage hover:bg-sage hover:text-white"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              }
            />
            {reassigning === o.id && (
              <div className="mt-2 flex gap-2 rounded border border-line bg-white/60 p-3">
                <select
                  onChange={(e) => e.target.value && handleAssign(o.id, e.target.value)}
                  defaultValue=""
                  className="flex-1 rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
                >
                  <option value="" disabled>Choose a writer…</option>
                  {data.writers.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
            {o.submission_text && o.status !== "assigned" && (
              <div className="mt-2 rounded border border-line bg-white/40 p-4 text-sm text-charcoal/80">
                <p className="mb-1 text-xs uppercase tracking-wide text-charcoal/50">Writer's submission</p>
                {o.submission_text}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
