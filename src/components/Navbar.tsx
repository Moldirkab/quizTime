import { Link, useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

interface NavbarProps {
  user: string | null;
  isAdmin?: boolean;
  onLogoutClick: () => void;
}

export default function Navbar({
  user,
  isAdmin = false,
  onLogoutClick,
}: NavbarProps) {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    onLogoutClick();
    navigate("/"); // Redirect home after logging out
  };

  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-8 py-3 bg-[#93ABD8] shadow-[0_4px_15px_rgba(147,171,216,0.25)]">
      {/* Brand logo linked to dashboard root */}
      <Link
        to="/"
        className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF4CD] cursor-pointer select-none no-underline"
      >
        quizTime<span className="text-[#F3619C]">.</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-[1.2rem]">
        <Link
          to="/"
          className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white no-underline"
        >
          Explore
        </Link>
        <Link
          to="/create-deck"
          className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white no-underline"
        >
          + Create
        </Link>

        {user && (
          <Link
            to="/progress"
            className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white no-underline"
          >
            Progress
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-bold text-[#36343D] bg-[#FAF4CD] px-3.5 py-1.5 rounded-[20px] shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
              {isAdmin && <span title="Admin">👑</span>}
              {user}
            </span>
            <button
              className="px-3 sm:px-[18px] py-2 text-[13px] font-bold rounded-xl cursor-pointer transition-all duration-200 bg-[rgba(54,52,61,0.1)] text-[#36343D] border border-[rgba(54,52,61,0.2)] hover:bg-[#F3619C] hover:text-white hover:border-transparent hover:-translate-y-[1px]"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="px-4 sm:px-[18px] py-2 text-[13px] font-bold rounded-xl cursor-pointer border-none bg-[#36343D] text-[#FAF4CD] shadow-[0_4px_10px_rgba(54,52,61,0.2)] transition-all duration-200 hover:bg-[#9c75f7] hover:text-white hover:-translate-y-[1px] no-underline"
          >
            Sign In 🔒
          </Link>
        )}
      </div>
    </nav>
  );
}
