import { useState, useMemo } from "react";
import type { QuizQuestion, QuizResult } from "../types";

interface QuizSessionViewProps {
  currentSubject: string;
  currentTopic: string;
  questions: QuizQuestion[];
  onBack: () => void;
  onFinish: (results: QuizResult[]) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizSessionView({
  currentSubject,
  currentTopic,
  questions,
  onBack,
  onFinish,
}: QuizSessionViewProps) {
  const shuffledQuestions = useMemo(() => shuffle(questions), [questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const activeQuestion = shuffledQuestions[currentIndex];
  const correctAnswers =
    activeQuestion?.choices.filter((c) => c.isCorrect).map((c) => c.text) ?? [];
  const isMultipleCorrect = correctAnswers.length > 1;

  const shuffledChoices = useMemo(
    () => (activeQuestion ? shuffle(activeQuestion.choices) : []),
    [activeQuestion],
  );

  const toggleAnswer = (text: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) =>
      prev.includes(text) ? prev.filter((a) => a !== text) : [...prev, text],
    );
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;
    setIsSubmitted(true);

    const isCorrect =
      correctAnswers.length === selectedAnswers.length &&
      correctAnswers.every((a) => selectedAnswers.includes(a));

    const result: QuizResult = {
      questionIndex: currentIndex,
      question: activeQuestion.question,
      correctAnswers,
      selectedAnswers: [...selectedAnswers],
      isCorrect,
    };
    setResults((prev) => [...prev, result]);
  };

  const handleNext = () => {
    if (currentIndex >= shuffledQuestions.length - 1) {
      setIsFinished(true);
      onFinish([...results]);
    } else {
      setSelectedAnswers([]);
      setIsSubmitted(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setIsSubmitted(false);
    setResults([]);
    setIsFinished(false);
  };

  // ── Summary screen ───────────────────────────────────────────
  if (isFinished) {
    const score = results.filter((r) => r.isCorrect).length;
    const pct = Math.round((score / shuffledQuestions.length) * 100);
    const emoji =
      pct === 100 ? "🏆" : pct >= 70 ? "🎉" : pct >= 40 ? "📚" : "💪";
    const message =
      pct === 100
        ? "Perfect score! Flawless."
        : pct >= 70
          ? "Great job! Almost perfect."
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
            {score} / {shuffledQuestions.length}
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

        {/* Per-question breakdown */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#36343D]/60">
            Question Breakdown
          </h3>
          {results.map((r, i) => (
            <div
              key={i}
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
                  ✓ {r.correctAnswers.join(", ")}
                </span>
              ) : (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-red-500">
                    ✗ Your answer: {r.selectedAnswers.join(", ")}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    ✓ Correct: {r.correctAnswers.join(", ")}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Active question screen ───────────────────────────────────
  const progressPct = (currentIndex / shuffledQuestions.length) * 100;
  const isAnswerCorrect =
    isSubmitted &&
    correctAnswers.length === selectedAnswers.length &&
    correctAnswers.every((a) => selectedAnswers.includes(a));

  return (
    <div className="w-full max-w-[650px] mx-auto flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#36343D]/10 pb-3">
        <button
          className="text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Topics
        </button>
        <span className="text-sm font-bold text-[#F3619C] bg-[#F3619C]/10 px-3 py-1 rounded-full">
          {currentIndex + 1} / {shuffledQuestions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-[#36343D]/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#F3619C] rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Topic label */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#36343D] m-0">
          {currentTopic}
        </h2>
        <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]/50">
          Subject:{" "}
          <span className="capitalize text-[#36343D]">{currentSubject}</span>
        </span>
      </div>

      {/* Question card */}
      <div className="w-full bg-[#B494F8] rounded-2xl p-6 shadow-md flex flex-col gap-2 min-h-[120px]">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBFA40]/70">
          Question
        </span>
        <p className="text-lg md:text-xl font-bold text-[#FAF4CD] leading-relaxed">
          {activeQuestion?.question}
        </p>
        {isMultipleCorrect && (
          <span className="text-xs font-bold text-[#DBFA40]/80 mt-1">
            ✦ Select all correct answers
          </span>
        )}
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-2">
        {shuffledChoices.map((choice, i) => {
          const isSelected = selectedAnswers.includes(choice.text);
          const isCorrectChoice = choice.isCorrect;

          let style =
            "bg-white border border-[#36343D]/10 text-[#36343D] hover:border-[#B494F8] hover:bg-[#B494F8]/10";

          if (isSubmitted) {
            if (isCorrectChoice) {
              style = "bg-emerald-500 border-emerald-500 text-white";
            } else if (isSelected && !isCorrectChoice) {
              style = "bg-red-500 border-red-500 text-white";
            } else {
              style = "bg-white border border-[#36343D]/10 text-[#36343D]/40";
            }
          } else if (isSelected) {
            style = "bg-[#B494F8] border-[#B494F8] text-white";
          }

          return (
            <button
              key={choice.text}
              type="button"
              onClick={() => toggleAnswer(choice.text)}
              disabled={isSubmitted}
              className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 border cursor-pointer disabled:cursor-default flex items-center gap-3 ${style}`}
            >
              <span
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 text-xs transition-all
                  ${
                    isSelected && !isSubmitted
                      ? "bg-white/30 border-white"
                      : "border-current opacity-40"
                  }`}
              >
                {isSelected ? "✓" : ""}
              </span>
              <span>
                <span className="opacity-40 mr-1 text-xs">
                  {["A", "B", "C", "D"][i]}.
                </span>
                {choice.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submit / feedback / next */}
      {!isSubmitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selectedAnswers.length === 0}
          className="w-full bg-[#36343D] text-[#FAF4CD] font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-[#F3619C] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      ) : (
        <div className="flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-bold ${
              isAnswerCorrect
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {isAnswerCorrect
              ? "✓ Correct!"
              : `✗ Correct answer${correctAnswers.length > 1 ? "s" : ""}: ${correctAnswers.join(", ")}`}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-[#36343D] text-[#FAF4CD] font-bold py-3 rounded-xl border-none cursor-pointer hover:bg-[#F3619C] hover:text-white transition-all"
          >
            {currentIndex >= shuffledQuestions.length - 1
              ? "See Results →"
              : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}
