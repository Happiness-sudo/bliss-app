import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployerDashboard from "./pages/EmployerDashboard";
import BidderDashboard from "./pages/BidderDashboard";
import WriterDashboard from "./pages/WriterDashboard";
import TeamManagement from "./pages/TeamManagement";
import OrderDetail from "./pages/OrderDetail";
import { connectSocket, disconnectSocket } from "./socket";

function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="font-display text-4xl leading-tight text-ink dark:text-[#e9e4d8]">
        Run your writing operation from one place
      </h1>

      <svg viewBox="0 0 400 220" className="mx-auto mt-10 h-48 w-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="90" y="70" width="160" height="120" rx="6" fill="#F7F3EA" stroke="#D8D2C2" strokeWidth="2" transform="rotate(-6 170 130)" />
        <rect x="120" y="60" width="160" height="120" rx="6" fill="#F7F3EA" stroke="#D8D2C2" strokeWidth="2" transform="rotate(3 200 120)" />
        <rect x="105" y="55" width="160" height="120" rx="6" fill="#FFFFFF" stroke="#D8D2C2" strokeWidth="2" />
        <line x1="125" y1="80" x2="225" y2="80" stroke="#D8D2C2" strokeWidth="3" strokeLinecap="round" />
        <line x1="125" y1="98" x2="245" y2="98" stroke="#D8D2C2" strokeWidth="3" strokeLinecap="round" />
        <line x1="125" y1="116" x2="205" y2="116" stroke="#D8D2C2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="230" cy="150" r="18" fill="#6E7F6B" />
        <path d="M222 150 l6 6 l12 -14" stroke="#F7F3EA" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <g transform="translate(260 40) rotate(35)">
          <rect x="0" y="0" width="10" height="90" rx="3" fill="#C9862B" />
          <path d="M0 90 L10 90 L5 108 Z" fill="#1B2430" />
          <rect x="0" y="-10" width="10" height="12" rx="2" fill="#1B2430" />
        </g>
      </svg>

      <div className="mt-8 flex justify-center gap-3">
        <Link to="/signup" className="rounded bg-ink px-6 py-2.5 text-sm text-paper hover:bg-ink/90">
          Get started
        </Link>
        <Link to="/login" className="rounded border border-line dark:border-[#333b47] px-6 py-2.5 text-sm text-ink dark:text-[#e9e4d8] hover:border-amber">
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
    if (stored) {
      setUser(JSON.parse(stored));
      connectSocket();
    }
    return () => disconnectSocket();
  }, []);

  function handleAuth({ token, user }) {
    localStorage.setItem("bliss_token", token);
    localStorage.setItem("bliss_user", JSON.stringify(user));
    setUser(user);
    connectSocket();
  }

  function handleLogout() {
    disconnectSocket();
    localStorage.removeItem("bliss_token");
    localStorage.removeItem("bliss_user");
    setUser(null);
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-[#14181f]">
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
        <Route
          path="/orders/:orderId"
          element={
            <Protected user={user}>
              <OrderDetail />
            </Protected>
          }
        />
      </Routes>
    </div>
  );
}
