import { useState, useEffect } from "react";
import type { Flashcard, DailyGoal } from "../types";

interface ProgressViewProps {
  user: string;
  cards: Flashcard[];
  goal: DailyGoal;
  setGoal: (g: DailyGoal) => void;
  todayProgress: { cardsStudied: number; topicsCompleted: string[] };
  streak: number;
  last7Days: {
    date: string;
    cardsStudied: number;
    topicsCompleted: string[];
    goalMet: boolean;
  }[];
  goalCurrent: number;
  goalPercent: number;
}

const CARD_OPTIONS = [10, 20, 30, 50];
const TOPIC_OPTIONS = [1, 2, 3, 5];

function getDayLabel(dateStr: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [year, month, day] = dateStr.split("-").map(Number);
  return days[new Date(year, month - 1, day).getDay()];
}

export default function ProgressView({
  user,
  cards,
  goal,
  setGoal,
  streak,
  last7Days,
  goalCurrent,
  goalPercent,
}: ProgressViewProps) {
  const [goalType, setGoalType] = useState<"cards" | "topics">(goal.type);
  const [goalTarget, setGoalTarget] = useState<number>(goal.target);

  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    setGoalType(goal.type);
    setGoalTarget(goal.target);
  }, [goal.type, goal.target]);

  const handleSaveGoal = () => {
    setGoal({ type: goalType, target: goalTarget });

    setShowToast(true);
  };

  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(timer);
  }, [showToast]);

  const masteredCards = cards.filter((c) => (c.difficultyStreak ?? 0) >= 3);
  const learningCards = cards.filter(
    (c) => (c.difficultyStreak ?? 0) > 0 && (c.difficultyStreak ?? 0) < 3,
  );
  const unstudiedCards = cards.filter((c) => (c.difficultyStreak ?? 0) === 0);

  const masteredPct =
    Math.round((masteredCards.length / cards.length) * 100) || 0;
  const learningPct =
    Math.round((learningCards.length / cards.length) * 100) || 0;
  const unstudiedPct =
    Math.round((unstudiedCards.length / cards.length) * 100) || 0;

  return (
    <div className="relative w-full max-w-[900px] mx-auto flex flex-col gap-8 animate-[fadeIn_0.25s_ease-out]">
      {/* GLOBAL TOAST POPUP NOTIFICATION MODAL LAYER */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#36343D] text-[#DBFA40] font-bold rounded-2xl shadow-xl border border-[#DBFA40]/20 animate-[slideUp_0.2s_ease-out]">
          <span className="text-base">✨</span>
          <span className="text-sm tracking-wide">
            Settings saved successfully!
          </span>
        </div>
      )}

      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#36343D] tracking-tight mb-1">
          Your Progress
        </h1>
        <p className="text-sm text-[#36343D]/60 font-medium">
          Welcome back, <span className="text-[#F3619C] font-bold">{user}</span>
          . Keep it up!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Streak */}
        <div className="bg-[#F3619C] rounded-2xl p-6 flex flex-col justify-between shadow-md min-h-[160px]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EDE986]/80">
            Study Streak
          </span>
          <div className="flex items-end gap-3 mt-4">
            <span className="text-6xl font-extrabold text-[#EDE986] leading-none">
              {streak}
            </span>
            <span className="text-lg font-bold text-[#EDE986]/80 mb-1">
              {streak === 1 ? "day" : "days"}
            </span>
          </div>
          <p className="text-xs text-[#FAF4CD]/80 mt-3">
            {streak === 0
              ? "Study today to start your streak! 🔥"
              : streak >= 7
                ? "Incredible! You're on fire 🔥"
                : "Great consistency — keep going!"}
          </p>
        </div>

        <div className="bg-[#B494F8] rounded-2xl p-6 flex flex-col justify-between shadow-md min-h-[160px]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#DBFA40]/80">
            Today's Goal
          </span>
          <div className="flex items-center gap-5 mt-2">
            <svg width="80" height="80" className="shrink-0 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="rgba(219,250,64,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#DBFA40"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(goalPercent / 100) * (2 * Math.PI * 32)} ${2 * Math.PI * 32}`}
                className="transition-all duration-700"
              />
            </svg>
            <div>
              <p className="text-3xl font-extrabold text-[#DBFA40] leading-none">
                {goalPercent}%
              </p>
              <p className="text-xs text-[#FAF4CD]/80 mt-1 font-medium">
                {goalCurrent} / {goal.target}{" "}
                {goal.type === "cards" ? "cards" : "topics"}
              </p>
            </div>
          </div>
          {goalPercent >= 100 && (
            <p className="text-xs text-[#DBFA40] font-bold mt-2">
              🎉 Goal complete for today!
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#93ABD8] rounded-2xl p-6 shadow-md">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#FAF4CD]/80 mb-5">
          Last 7 Days
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day, i) => {
            const isToday = i === 6;
            const hasActivity =
              day.cardsStudied > 0 || day.topicsCompleted.length > 0;
            return (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[#FAF4CD]/70 uppercase">
                  {getDayLabel(day.date)}
                </span>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all
                    ${
                      day.goalMet
                        ? "bg-[#DBFA40] text-[#36343D]"
                        : hasActivity
                          ? "bg-[#FAF4CD]/40 text-[#36343D]"
                          : "bg-[#FAF4CD]/10 text-[#FAF4CD]/30"
                    }
                    ${
                      isToday
                        ? "ring-2 ring-[#FAF4CD] ring-offset-1 ring-offset-[#93ABD8]"
                        : ""
                    }
                  `}
                  title={
                    day.goalMet
                      ? "Goal met!"
                      : hasActivity
                        ? `${day.cardsStudied} cards, ${day.topicsCompleted.length} topics`
                        : "No activity"
                  }
                >
                  {day.goalMet ? "✓" : hasActivity ? day.cardsStudied : "·"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-[10px] font-bold text-[#FAF4CD]/60">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#DBFA40] inline-block" /> Goal
            met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FAF4CD]/40 inline-block" />{" "}
            Some activity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#FAF4CD]/10 inline-block" /> No
            activity
          </span>
        </div>
      </div>
      <div className="bg-[#F8EDAD] rounded-2xl p-6 shadow-md">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#ED7C30] mb-5">
          Cards Mastery — {cards.length} total
        </h2>
        <div className="flex flex-col gap-4">
          {[
            {
              label: "Mastered",
              sublabel: "streak ≥ 3",
              count: masteredCards.length,
              pct: masteredPct,
              color: "bg-[#ED7C30]",
              text: "text-[#ED7C30]",
            },
            {
              label: "Learning",
              sublabel: "streak 1–2",
              count: learningCards.length,
              pct: learningPct,
              color: "bg-[#F3619C]",
              text: "text-[#F3619C]",
            },
            {
              label: "Unstudied",
              sublabel: "not yet seen",
              count: unstudiedCards.length,
              pct: unstudiedPct,
              color: "bg-[#93ABD8]",
              text: "text-[#93ABD8]",
            },
          ].map((row) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm font-bold text-[#36343D]">
                <span>
                  {row.label}{" "}
                  <span className="text-xs font-medium text-[#36343D]/50">
                    ({row.sublabel})
                  </span>
                </span>
                <span className={row.text}>
                  {row.count} cards · {row.pct}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#36343D]/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${row.color} transition-all duration-700`}
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#E7BEF8] rounded-2xl p-6 shadow-md">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#FB4645] mb-5">
          Set Daily Goal
        </h2>

        <div className="flex gap-2 mb-5">
          {(["cards", "topics"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setGoalType(t);
                setGoalTarget(t === "cards" ? 20 : 2);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-none cursor-pointer transition-all
                ${
                  goalType === t
                    ? "bg-[#FB4645] text-white shadow-md"
                    : "bg-white/50 text-[#36343D]/70 hover:bg-white/80"
                }`}
            >
              {t === "cards" ? "🃏 Cards Studied" : "📚 Topics Completed"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-5">
          {(goalType === "cards" ? CARD_OPTIONS : TOPIC_OPTIONS).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setGoalTarget(n)}
              className={`px-5 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all
                ${
                  goalTarget === n
                    ? "bg-[#FB4645] text-white shadow-md"
                    : "bg-white/50 text-[#36343D]/70 hover:bg-white/80"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleSaveGoal}
          className="w-full py-3 bg-[#FB4645] text-white font-bold rounded-xl border-none cursor-pointer transition-all hover:brightness-110 hover:-translate-y-0.5 shadow-md active:scale-[0.99]"
        >
          Save Goal →
        </button>
      </div>
    </div>
  );
}
