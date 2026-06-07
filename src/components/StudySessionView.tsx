import { useEffect } from "react";

interface StudySessionViewProps {
  currentSubject: string;
  currentTopic: string;
  filteredCards: any[];
  currentCardIndex: number;
  isFlipped: boolean;
  setIsFlipped: (flipped: boolean) => void;
  isSessionFinished: boolean;
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEvaluateCard: (id: number, rating: "hard" | "easy") => void;
  onResetStreaks: () => void;
}

export default function StudySessionView({
  currentSubject,
  currentTopic,
  filteredCards,
  currentCardIndex,
  isFlipped,
  setIsFlipped,
  isSessionFinished,
  onBack,
  onNext,
  onPrev,
  onEvaluateCard,
  onResetStreaks,
}: StudySessionViewProps) {
  const activeCard = filteredCards[currentCardIndex];

  useEffect(() => {
    if (isSessionFinished || !activeCard) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "Space":
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case "ArrowLeft":
        case "Digit1":
          onEvaluateCard(activeCard.id, "hard");
          break;
        case "ArrowRight":
        case "Digit2":
          onEvaluateCard(activeCard.id, "easy");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFlipped, activeCard, isSessionFinished, setIsFlipped, onEvaluateCard]);

  if (isSessionFinished || filteredCards.length === 0) {
    return (
      <div className="w-full max-w-[650px] mx-auto flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
        <button
          className="self-start text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Decks
        </button>

        <div className="w-full bg-white border border-[#36343D]/10 rounded-3xl p-8 text-center shadow-md flex flex-col items-center justify-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-[#36343D] mb-2">
            Session Complete!
          </h2>
          <p className="text-sm md:text-base text-[#36343D]/80 max-w-[400px]">
            You checked off every item in your{" "}
            <strong className="font-bold text-[#ED7C30]">{currentTopic}</strong>{" "}
            cycle.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-6 w-full max-w-[420px]">
            <button
              className="flex-1 min-w-[140px] bg-[#36343D] text-[#FAF4CD] font-bold py-3 px-5 rounded-xl border-none cursor-pointer shadow-sm transition-all hover:bg-black active:scale-[0.98]"
              onClick={onResetStreaks}
            >
              🔄 Study Again
            </button>
            <button
              className="flex-1 min-w-[140px] bg-[#93ABD8] text-[#36343D] font-bold py-3 px-5 rounded-xl border border-[rgba(54,52,61,0.1)] cursor-pointer shadow-sm transition-all hover:brightness-105 active:scale-[0.98]"
              onClick={onBack}
            >
              Explore Subjects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cardsRemaining = filteredCards.length - currentCardIndex;

  return (
    <div className="w-full max-w-[650px] mx-auto flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex items-center justify-between w-full border-b border-[#36343D]/10 pb-3">
        <button
          className="text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Topics
        </button>
        <span className="text-sm font-bold text-[#ED7C30] bg-[#ED7C30]/10 px-3 py-1 rounded-full">
          {cardsRemaining} {cardsRemaining === 1 ? "card" : "cards"} left
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#36343D] m-0">
          {currentTopic}
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]/60">
          Subject:{" "}
          <span className="text-[#36343D] capitalize">{currentSubject}</span>
        </span>
      </div>

      <div className="w-full h-72 [perspective:1200px] cursor-pointer select-none">
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute inset-0 w-full h-full bg-[#93ABD8] border border-[#36343D]/10 rounded-2xl p-6 flex flex-col justify-between items-center [backface-visibility:hidden] shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#36343D]/50 bg-[#FAF4CD]/30 px-2.5 py-1 rounded-md">
              QUESTION
            </span>
            <p className="text-center text-lg md:text-xl font-bold text-[#36343D] leading-relaxed max-w-[90%] overflow-y-auto">
              {activeCard?.question}
            </p>
            <span className="text-[11px] font-medium text-[#36343D]/60 flex items-center gap-1">
              👉 Click or press{" "}
              <kbd className="bg-white/40 px-1.5 py-0.5 rounded border border-black/10 font-sans font-bold">
                Space
              </kbd>{" "}
              to flip
            </span>
          </div>

          <div className="absolute inset-0 w-full h-full bg-[#36343D] border border-[#36343D]/10 rounded-2xl p-6 flex flex-col justify-between items-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBFA40]/40 bg-white/5 px-2.5 py-1 rounded-md">
              ANSWER KEY
            </span>
            <p className="text-center text-lg md:text-xl font-bold text-[#DBFA40] leading-relaxed max-w-[90%] overflow-y-auto">
              {activeCard?.answer}
            </p>
            <span className="text-[11px] font-medium text-[#FAF4CD]/40 flex items-center gap-1">
              👉 Click or press{" "}
              <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10 font-sans font-bold">
                Space
              </kbd>{" "}
              to flip
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mt-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm md:text-base rounded-xl border-none shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          onClick={(e) => {
            e.stopPropagation();
            onEvaluateCard(activeCard.id, "hard");
          }}
        >
          ✕ Hard{" "}
          <span className="hidden sm:inline-block text-xs opacity-60 font-normal ml-1">
            (Key: 1)
          </span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm md:text-base rounded-xl border-none shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          onClick={(e) => {
            e.stopPropagation();
            onEvaluateCard(activeCard.id, "easy");
          }}
        >
          ✓ Easy{" "}
          <span className="hidden sm:inline-block text-xs opacity-60 font-normal ml-1">
            (Key: 2)
          </span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-[#36343D]/10 shadow-sm text-sm text-[#36343D] font-bold cursor-pointer transition-all hover:bg-gray-50 hover:border-[#36343D]/20 active:scale-95"
          onClick={onPrev}
        >
          ◀
        </button>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-[#36343D]/10 shadow-sm text-sm text-[#36343D] font-bold cursor-pointer transition-all hover:bg-gray-50 hover:border-[#36343D]/20 active:scale-95"
          onClick={onNext}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
