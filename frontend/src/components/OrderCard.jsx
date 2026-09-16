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
          <h3 className="font-display text-lg text-ink">#{order.order_number}</h3>
          <span className={`whitespace-nowrap text-sm ${statusColor[order.status] || "text-charcoal/60"}`}>
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
        <p className="mt-1 text-sm text-charcoal/60">
          {order.word_count} words · ${order.payment_amount.toFixed(0)}
          {order.writer_name ? ` · Writer: ${order.writer_name}` : ""}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/85">{order.instructions}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
