import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import type { Flashcard } from "../types";

type Props = {
  card: Flashcard;
  deleteCard: (id: number) => void;
};

export default function Flashcard({ card, deleteCard }: Props) {
  const { user } = useUser();
  const [flipped, setFlipped] = useState<boolean>(false);

  // Derive administrative clearance level directly from Clerk metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div
      className="w-full h-48 [perspective:1000px] cursor-pointer group select-none"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* FRONT CARD PANEL */}
        <div className="absolute inset-0 w-full h-full bg-[#93ABD8] border border-[#36343D]/10 rounded-2xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] shadow-md group-hover:shadow-lg transition-shadow duration-200">
          <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-[#36343D]/50">
            {card.theme || card.subject}
          </span>
          <h3 className="m-0 text-center text-base md:text-lg font-bold text-[#36343D] leading-snug px-2">
            {card.question}
          </h3>
        </div>

        {/* BACK CARD PANEL */}
        <div className="absolute inset-0 w-full h-full bg-[#36343D] border border-[#36343D]/10 rounded-2xl p-6 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md group-hover:shadow-lg transition-shadow duration-200">
          <span className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-[#FAF4CD]/40">
            Answer Key
          </span>
          <h3 className="m-0 text-center text-base md:text-lg font-bold text-[#DBFA40] leading-snug px-2">
            {card.answer}
          </h3>
        </div>

        {/* DEFENSIVE ACTION DESTRUCTION CTA */}
        {isAdmin && (
          <button
            className="absolute top-3 right-3 z-50 w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white border-none text-xs font-bold backdrop-blur-sm transition-all duration-200 hover:bg-[#F3619C] hover:text-white [backface-visibility:hidden] group-hover:scale-105"
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering card flip state loop
              deleteCard(card.id);
            }}
            title="Delete flashcard"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
