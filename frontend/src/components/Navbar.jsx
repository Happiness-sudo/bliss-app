import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const dashboardPath = {
  employer: "/employer",
  bidder: "/bidder",
  writer: "/writer",
};

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-line dark:border-[#333b47] bg-paper dark:bg-[#14181f]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl text-ink dark:text-[#e9e4d8]">
          BLISS
        </Link>

        {user ? (
          <div className="flex items-center gap-5 text-sm">
            <span className="capitalize text-charcoal/70 dark:text-[#c9c2b0]/70">
              {user.role} · {user.name}
            </span>
            <Link to={dashboardPath[user.role]} className="text-ink dark:text-[#e9e4d8] hover:text-amber">
              Dashboard
            </Link>
            {user.role === "employer" && (
              <Link to="/team" className="text-ink dark:text-[#e9e4d8] hover:text-amber">
                Team
              </Link>
            )}
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="rounded-md border border-line dark:border-[#333b47] px-3 py-1.5 text-charcoal dark:text-[#c9c2b0] hover:border-amber hover:text-amber"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <ThemeToggle />
            <Link to="/login" className="text-ink dark:text-[#e9e4d8] hover:text-amber">
              Log in
            </Link>
            <Link to="/signup" className="rounded-md bg-ink px-4 py-2 text-paper hover:bg-ink/90">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
