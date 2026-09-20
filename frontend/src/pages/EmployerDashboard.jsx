import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import OrderCard from "../components/OrderCard";
import StatCard from "../components/StatCard";

export default function EmployerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.employerDashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error && !data) return <p className="mx-auto max-w-4xl px-6 py-10 text-amber">{error}</p>;
  if (!data) return <p className="mx-auto max-w-4xl px-6 py-10 text-charcoal/60 dark:text-[#c9c2b0]/60">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink dark:text-[#e9e4d8]">Business overview</h1>
          <p className="mt-1 text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">Every order across your whole team.</p>
        </div>
        <Link to="/team" className="rounded bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90">
          Manage team
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Total orders" value={data.stats.total_orders} />
        <StatCard label="Paid" value={data.stats.paid} />
        <StatCard label="Unpaid" value={data.stats.unpaid} />
        <StatCard label="Total revenue" value={`$${data.stats.total_revenue.toFixed(0)}`} />
      </div>

      <h2 className="mt-10 font-display text-lg text-ink dark:text-[#e9e4d8]">All orders</h2>
      <div className="mt-4 space-y-3">
        {data.orders.length === 0 && <p className="text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">No orders yet.</p>}
        {data.orders.map((o) => (
          <div key={o.id}>
            <OrderCard
              order={o}
              action={
                <span className="text-xs text-charcoal/50 dark:text-[#c9c2b0]/50">
                  Bidder: {o.bidder_name}{o.writer_name ? ` · Writer: ${o.writer_name}` : ""}
                </span>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
