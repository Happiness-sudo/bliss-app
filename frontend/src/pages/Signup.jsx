import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Signup({ onAuth }) {
  const [name, setName] = useState("");
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
      const data = await api.signup({ name, email, password });
      onAuth(data);
      navigate("/employer");
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
          Build your team, log the orders, and let the work move itself.
        </blockquote>
        <p className="text-sm text-paper/50">
          Sign up as an employer. Add bidders and writers once you are in.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink dark:text-[#e9e4d8]">Create your account</h1>
          <p className="mt-1 text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">
            This creates an Employer account. You will add your Bidders and Writers afterward.
          </p>

          {error && (
            <p className="mt-4 rounded border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
              {error}
            </p>
          )}

          <label className="mt-5 block text-sm text-charcoal/80 dark:text-[#c9c2b0]/80">Your name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />

          <label className="mt-4 block text-sm text-charcoal/80 dark:text-[#c9c2b0]/80">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />

          <label className="mt-4 block text-sm text-charcoal/80 dark:text-[#c9c2b0]/80">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-line dark:border-[#333b47] bg-white/70 dark:bg-[#1e242e]/70 px-3 py-2 text-sm outline-none focus:border-amber"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded bg-ink py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-charcoal/60 dark:text-[#c9c2b0]/60">
            Already have an account?{" "}
            <Link to="/login" className="text-amber hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
