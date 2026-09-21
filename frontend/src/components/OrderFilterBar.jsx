const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "sent_to_client", label: "Sent to client" },
  { value: "paid", label: "Paid" },
];

export default function OrderFilterBar({ status, onStatusChange, search, onSearchChange }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search order number or instructions..."
        className="flex-1 min-w-[200px] rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm text-charcoal dark:text-[#c9c2b0] outline-none focus:border-amber"
      />
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm text-charcoal dark:text-[#c9c2b0] outline-none focus:border-amber"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function filterOrders(orders, status, search) {
  return orders.filter((o) => {
    const matchesStatus = status === "all" || o.status === status;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      o.order_number.toLowerCase().includes(q) ||
      o.instructions.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
}
