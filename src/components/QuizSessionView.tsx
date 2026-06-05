import { useState, useMemo, useEffect } from "react";
import type { Flashcard, QuizResult } from "../types";

interface QuizSessionViewProps {
  currentSubject: string;
  currentTopic: string;
  topicCards: Flashcard[];
  allSubjectCards: Flashcard[];
  onBack: () => void;
  onFinish: (results: QuizResult[]) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getAnswerShape(text: string): string {
  const clean = text.trim();
  if (/^\d{4}$/.test(clean)) return "year";
  if (/^-?\d+(\.\d+)?%?$/.test(clean)) return "numeric";
  if (/[\=\+\-\*\/]/.test(clean)) return "equation";
  if (clean.split(/\s+/).length <= 2) return "short-phrase";
  return "sentence";
}

function buildChoices(
  correct: Flashcard,
  allSubjectCards: Flashcard[],
  topicCards: Flashcard[],
): string[] {
  const targetShape = getAnswerShape(correct.answer);

  const matchingShapePool = allSubjectCards
    .filter(
      (c) =>
        c.id !== correct.id &&
        c.subject === correct.subject &&
        getAnswerShape(c.answer) === targetShape,
    )
    .map((c) => c.answer);

  const crossTopicPool = allSubjectCards
    .filter(
      (c) => c.id !== correct.id && !topicCards.find((t) => t.id === c.id),
    )
    .map((c) => c.answer);

  const localDeckPool = topicCards
    .filter((c) => c.id !== correct.id)
    .map((c) => c.answer);

  const uniqueWrong = Array.from(
    new Set([...matchingShapePool, ...crossTopicPool, ...localDeckPool]),
  );

  const wrong = shuffle(uniqueWrong).slice(0, 3);

  return shuffle([correct.answer, ...wrong]);
}

// Added explicit typing parameter assignment to resolve compilation dropouts
export function QuizSessionView({
  currentSubject,
  currentTopic,
  topicCards,
  allSubjectCards,
  onBack,
  onFinish,
}: QuizSessionViewProps) {
  const questions = useMemo(() => shuffle(topicCards), [topicCards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const activeCard = questions[currentIndex];

  const choices = useMemo(
    () =>
      activeCard ? buildChoices(activeCard, allSubjectCards, topicCards) : [],
    [activeCard, allSubjectCards, topicCards],
  );

  const handleSelect = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);

    const isCorrect = choice === activeCard.answer;
    const result: QuizResult = {
      cardId: activeCard.id,
      question: activeCard.question,
      correctAnswer: activeCard.answer,
      selectedAnswer: choice,
      isCorrect,
    };
    setResults((prev) => [...prev, result]);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
      onFinish([...results]);
    } else {
      setSelected(null);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelected(null);
    setResults([]);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isFinished || selected !== null) return;
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
      };
      if (map[e.code] !== undefined && choices[map[e.code]]) {
        handleSelect(choices[map[e.code]]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [choices, selected, isFinished]);

  if (isFinished) {
    const score = results.filter((r) => r.isCorrect).length;
    const pct = Math.round((score / questions.length) * 100);

    const emoji =
      pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "📚" : "💪";

    const message =
      pct === 100
        ? "Perfect score! You nailed it."
        : pct >= 70
          ? "Great job! Almost there."
          : pct >= 40
            ? "Good effort — review and retry!"
            : "Keep practicing — you've got this!";

    return (
      <div className="w-full max-w-[650px] mx-auto flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
        <button
          className="self-start text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Topics
        </button>

        <div className="bg-[#F3619C] rounded-2xl p-8 text-center shadow-md">
          <div className="text-5xl mb-3">{emoji}</div>
          <h2 className="text-3xl font-extrabold text-[#EDE986] mb-1">
            {score} / {questions.length}
          </h2>
          <p className="text-[#FAF4CD]/90 font-medium text-sm mb-1">
            {pct}% correct
          </p>
          <p className="text-[#FAF4CD]/70 text-xs">{message}</p>

          <div className="flex gap-3 justify-center mt-6">
            <button
              type="button"
              onClick={handleRestart}
              className="bg-[#EDE986] text-[#F3619C] font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-white transition-all"
            >
              🔄 Retry Quiz
            </button>
            <button
              type="button"
              onClick={onBack}
              className="bg-white/20 text-[#FAF4CD] font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer hover:bg-white/30 transition-all"
            >
              Back to Topics
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#36343D]/60">
            Question Breakdown
          </h3>
          {results.map((r, i) => (
            <div
              key={r.cardId}
              className={`rounded-xl p-4 border ${
                r.isCorrect
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p className="text-xs font-bold text-[#36343D]/50 mb-1">
                Q{i + 1}
              </p>
              <p className="text-sm font-bold text-[#36343D] mb-2">
                {r.question}
              </p>
              {r.isCorrect ? (
                <span className="text-xs font-bold text-emerald-600">
                  ✓ {r.correctAnswer}
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-red-500">
                    ✗ Your answer: {r.selectedAnswer}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    ✓ Correct: {r.correctAnswer}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const progress = (currentIndex / questions.length) * 100;

  return (
    <div className="w-full max-w-[650px] mx-auto flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex items-center justify-between border-b border-[#36343D]/10 pb-3">
        <button
          className="text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Topics
        </button>
        <span className="text-sm font-bold text-[#F3619C] bg-[#F3619C]/10 px-3 py-1 rounded-full">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full h-2 bg-[#36343D]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F3619C] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#36343D] m-0">
          {currentTopic}
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]/50">
          Subject:{" "}
          <span className="capitalize text-[#36343D]">{currentSubject}</span>
        </span>
      </div>

      <div className="w-full bg-[#B494F8] rounded-2xl p-6 shadow-md flex flex-col items-center justify-center min-h-[140px] text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBFA40]/70 mb-3">
          Question
        </span>
        <p className="text-lg md:text-xl font-bold text-[#FAF4CD] leading-relaxed">
          {activeCard?.question}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {choices.map((choice, i) => {
          const isSelected = selected === choice;
          const isCorrect = choice === activeCard?.answer;
          const revealed = selected !== null;

          let style =
            "bg-white border border-[#36343D]/10 text-[#36343D] hover:border-[#B494F8] hover:bg-[#B494F8]/10";

          if (revealed) {
            if (isCorrect) {
              style = "bg-emerald-500 border-emerald-500 text-white";
            } else if (isSelected && !isCorrect) {
              style = "bg-red-500 border-red-500 text-white";
            } else {
              style = "bg-white border border-[#36343D]/10 text-[#36343D]/40";
            }
          }

          return (
            <button
              key={choice}
              type="button"
              onClick={() => handleSelect(choice)}
              disabled={revealed}
              className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 border cursor-pointer disabled:cursor-default ${style}`}
            >
              <span className="opacity-50 mr-2 text-xs">{i + 1}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              selected === activeCard?.answer
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {selected === activeCard?.answer
              ? "✓ Correct!"
              : `✗ The correct answer was: ${activeCard?.answer}`}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-[#36343D] text-[#FAF4CD] font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-[#F3619C] hover:text-white transition-all"
          >
            {currentIndex >= questions.length - 1
              ? "See Results →"
              : "Next Question →"}
          </button>
        </div>
      )}

      {selected === null && (
        <p className="text-center text-xs text-[#36343D]/40 font-medium">
          Press{" "}
          <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#36343D]/10 font-bold">
            1
          </kbd>{" "}
          <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#36343D]/10 font-bold">
            2
          </kbd>{" "}
          <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#36343D]/10 font-bold">
            3
          </kbd>{" "}
          <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#36343D]/10 font-bold">
            4
          </kbd>{" "}
          to select an answer
        </p>
      )}
    </div>
  );
}
