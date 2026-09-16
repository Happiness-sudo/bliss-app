import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const dashboardPath = {
  employer: "/employer",
  bidder: "/bidder",
  writer: "/writer",
};

export default function Login({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      onAuth(data);
      navigate(dashboardPath[data.user.role] || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink px-12 py-14 text-paper md:flex">
        <span className="font-display text-xl">BLISS</span>
        <blockquote className="font-display text-3xl italic leading-snug">
          Every order has a name behind it, from the client to the writer who delivers it.
        </blockquote>
        <p className="text-sm text-paper/50">
          Employers, bidders, and writers - one place to run the work.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-charcoal/60">Log in to your BLISS account.</p>

          {error && (
            <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
              {error}
            </p>
          )}

          <label className="mt-6 block text-sm text-charcoal/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />

          <label className="mt-4 block text-sm text-charcoal/80">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-line bg-white/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="mt-6 text-center text-sm text-charcoal/60">
            New employer?{" "}
            <Link to="/signup" className="text-amber hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-charcoal/40">
            Bidders and writers: ask your employer to add you from Team settings.
          </p>
        </form>
      </div>
    </div>
  );
}

