import { Link, useNavigate } from "react-router-dom";

const dashboardPath = {
  employer: "/employer",
  bidder: "/bidder",
  writer: "/writer",
};

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-xl text-ink">
          BLISS
        </Link>

        {user ? (
          <div className="flex items-center gap-5 text-sm">
            <span className="capitalize text-charcoal/70">
              {user.role} · {user.name}
            </span>
            <Link to={dashboardPath[user.role]} className="text-ink hover:text-amber">
              Dashboard
            </Link>
            {user.role === "employer" && (
              <Link to="/team" className="text-ink hover:text-amber">
                Team
              </Link>
            )}
            <button
              onClick={() => {
                onLogout();
                navigate("/login");
              }}
              className="rounded-md border border-line px-3 py-1.5 text-charcoal hover:border-amber hover:text-amber"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="text-ink hover:text-amber">
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
