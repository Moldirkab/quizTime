import React from "react";
import { useClerk } from "@clerk/clerk-react";

interface NavbarProps {
  user: string | null;
  isAdmin?: boolean;
  onExploreClick: () => void;
  onCreateClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onProgressClick: () => void;
  setCurrentView: (
    view: "dashboard" | "auth" | "create-deck" | "progress",
  ) => void;
}

export default function Navbar({
  user,
  isAdmin = false,
  onExploreClick,
  onCreateClick,
  onLoginClick,
  onLogoutClick,
  onProgressClick,
  setCurrentView,
}: NavbarProps) {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
    onLogoutClick(); // clears local state in the hook
  };

  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-8 py-3 bg-[#93ABD8] shadow-[0_4px_15px_rgba(147,171,216,0.25)]">
      <div
        className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#FAF4CD] cursor-pointer select-none"
        onClick={onExploreClick}
      >
        quizTime<span className="text-[#F3619C]">.</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-[1.2rem]">
        <button
          className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white"
          onClick={onExploreClick}
        >
          Explore
        </button>
        <button
          className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white"
          onClick={onCreateClick}
        >
          + Create Deck
        </button>

        {user && (
          <button
            className="bg-transparent border-none text-[#FAF4CD] text-sm font-semibold cursor-pointer px-2 sm:px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-[rgba(250,244,205,0.15)] hover:text-white"
            onClick={onProgressClick}
          >
            Progress
          </button>
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
          <button
            className="px-4 sm:px-[18px] py-2 text-[13px] font-bold rounded-xl cursor-pointer border-none bg-[#36343D] text-[#FAF4CD] shadow-[0_4px_10px_rgba(54,52,61,0.2)] transition-all duration-200 hover:bg-[#9c75f7] hover:text-white hover:-translate-y-[1px]"
            onClick={onLoginClick}
          >
            Sign In 🔒
          </button>
        )}
      </div>
    </nav>
  );
}
