import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployerDashboard from "./pages/EmployerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import WriterDashboard from "./pages/WriterDashboard";
import TeamManagement from "./pages/TeamManagement";

function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="font-display text-4xl leading-tight text-ink">
        Run your writing operation from one place
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-charcoal/70">
        Employers manage the team. Bidders log orders won from clients.
        Writers get clear instructions and deliver the work. BLISS keeps
        every order moving.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/signup" className="rounded bg-ink px-6 py-2.5 text-sm text-paper hover:bg-ink/90">
          Get started
        </Link>
        <Link to="/login" className="rounded border border-line px-6 py-2.5 text-sm text-ink hover:border-amber">
          Log in
        </Link>
      </div>
    </div>
  );
}

function Protected({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("bliss_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  function handleAuth({ token, user }) {
    localStorage.setItem("bliss_token", token);
    localStorage.setItem("bliss_user", JSON.stringify(user));
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem("bliss_token");
    localStorage.removeItem("bliss_user");
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route path="/signup" element={<Signup onAuth={handleAuth} />} />
        <Route
          path="/employer"
          element={
            <Protected user={user} role="employer">
              <EmployerDashboard />
            </Protected>
          }
        />
        <Route
          path="/team"
          element={
            <Protected user={user} role="employer">
              <TeamManagement />
            </Protected>
          }
        />
        <Route
          path="/bidder"
          element={
            <Protected user={user} role="bidder">
              <BidderDashboard />
            </Protected>
          }
        />
        <Route
          path="/writer"
          element={
            <Protected user={user} role="writer">
              <WriterDashboard />
            </Protected>
          }
        />
      </Routes>
    </div>
  );
}
