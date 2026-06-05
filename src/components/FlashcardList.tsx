import type { Flashcard } from "../types";
import FlashcardComponent from "./Flashcard";

type Props = {
  cards: Flashcard[];
  deleteCard: (id: number) => void;
};

export default function FlashcardList({ cards, deleteCard }: Props) {
  return (
    <div className="w-full animate-[fadeIn_0.3s_ease-out]">
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-[#36343D]/10 rounded-3xl bg-white/30 text-[#36343D]/50">
          <p className="text-lg font-medium italic">
            Your deck is currently empty.
          </p>
          <p className="text-sm">Start by adding a new card above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="w-full">
              <FlashcardComponent card={card} deleteCard={deleteCard} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
