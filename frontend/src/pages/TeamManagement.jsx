import { useEffect, useState } from "react";
import { api } from "../api";
import PresenceDot from "../components/PresenceDot";

const emptyForm = { name: "", email: "", password: "", role: "bidder" };

export default function TeamManagement() {
  const [team, setTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const data = await api.listTeam();
      setTeam(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.addTeamMember(form);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(userId) {
    try {
      await api.removeTeamMember(userId);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !team) return <p className="mx-auto max-w-4xl px-6 py-10 text-amber">{error}</p>;
  if (!team) return <p className="mx-auto max-w-4xl px-6 py-10 text-charcoal/60 dark:text-[#c9c2b0]/60">Loading...</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl text-ink dark:text-[#e9e4d8]">Your team</h1>
      <p className="mt-1 text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">
        Add bidders to find and log client orders, and writers to complete them.
      </p>

      {error && (
        <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded border border-line dark:border-[#333b47] bg-white/60 dark:bg-[#1e242e]/60 p-5">
        <div className="grid grid-cols-2 gap-2 rounded border border-line dark:border-[#333b47] p-1 text-sm w-fit">
          {["bidder", "writer"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`rounded px-4 py-1.5 capitalize transition ${
                form.role === r ? "bg-ink text-paper" : "text-charcoal/70 dark:text-[#c9c2b0]/70 hover:text-ink dark:text-[#e9e4d8]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Temporary password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-amber px-4 py-2 text-sm text-white hover:bg-amber/90 disabled:opacity-60"
        >
          {loading ? "Adding..." : `Add ${form.role}`}
        </button>
      </form>

      <h2 className="mt-10 font-display text-lg text-ink dark:text-[#e9e4d8]">Bidders</h2>
      <div className="mt-4 space-y-2">
        {team.bidders.length === 0 && <p className="text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">No bidders yet.</p>}
        {team.bidders.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded border border-line dark:border-[#333b47] bg-white/60 dark:bg-[#1e242e]/60 px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 text-ink dark:text-[#e9e4d8]">
              <PresenceDot userId={b.id} />
              {b.name} <span className="text-charcoal/50 dark:text-[#c9c2b0]/50">&middot; {b.email}</span>
            </span>
            <button onClick={() => handleRemove(b.id)} className="text-xs text-charcoal/50 dark:text-[#c9c2b0]/50 hover:text-amber">
              Remove
            </button>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-display text-lg text-ink dark:text-[#e9e4d8]">Writers</h2>
      <div className="mt-4 space-y-2">
        {team.writers.length === 0 && <p className="text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">No writers yet.</p>}
        {team.writers.map((w) => (
          <div key={w.id} className="flex items-center justify-between rounded border border-line dark:border-[#333b47] bg-white/60 dark:bg-[#1e242e]/60 px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 text-ink dark:text-[#e9e4d8]">
              <PresenceDot userId={w.id} />
              {w.name} <span className="text-charcoal/50 dark:text-[#c9c2b0]/50">&middot; {w.email}</span>
            </span>
            <button onClick={() => handleRemove(w.id)} className="text-xs text-charcoal/50 dark:text-[#c9c2b0]/50 hover:text-amber">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
