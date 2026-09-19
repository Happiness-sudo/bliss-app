import { Link } from "react-router-dom";
import PresenceDot from "./PresenceDot";

const statusColor = {
  assigned: "text-amber",
  in_progress: "text-amber",
  submitted: "text-sage",
  under_review: "text-sage",
  sent_to_client: "text-ink",
  paid: "text-sage",
};

export default function OrderCard({ order, action }) {
  return (
    <div className="flex items-start gap-4 rounded border border-line bg-white/60 p-5">
      <div className="mt-1 h-full w-1 self-stretch rounded-full bg-amber/70" />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/orders/${order.id}`} className="font-display text-lg text-ink hover:text-amber">
            #{order.order_number}
          </Link>
          <span className={`whitespace-nowrap text-sm ${statusColor[order.status] || "text-charcoal/60"}`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-charcoal/60">
          <span>{order.page_count} page(s) &middot; ${order.payment_amount.toFixed(0)}</span>
          {order.bidder_id && (
            <span className="inline-flex items-center gap-1">
              <PresenceDot userId={order.bidder_id} /> Bidder: {order.bidder_name}
            </span>
          )}
          {order.writer_name && (
            <span className="inline-flex items-center gap-1">
              <PresenceDot userId={order.writer_id} /> Writer: {order.writer_name}
            </span>
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/85">{order.instructions}</p>
        <div className="mt-4 flex items-center gap-3">
          <Link to={`/orders/${order.id}`} className="text-xs text-charcoal/50 hover:text-amber">
            View details &rarr;
          </Link>
          {action}
        </div>
      </div>
    </div>
  );
}
