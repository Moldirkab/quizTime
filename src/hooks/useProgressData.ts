import { useState, useEffect, useCallback } from "react";
import type { DailyGoal, DailyProgress } from "../types";

function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function loadGoal(prefix: string): DailyGoal {
  const saved = localStorage.getItem(`${prefix}_goal`);
  return saved ? JSON.parse(saved) : { type: "cards", target: 20 };
}

function loadProgressLog(prefix: string): Record<string, DailyProgress> {
  const saved = localStorage.getItem(`${prefix}_progressLog`);
  return saved ? JSON.parse(saved) : {};
}

export function useProgressData(userId: string | null) {
  const prefix = userId ? `quiztime_${userId}` : "quiztime_guest";

  const [goal, setGoalState] = useState<DailyGoal>(() => loadGoal(prefix));
  const [progressLog, setProgressLog] = useState<Record<string, DailyProgress>>(
    () => loadProgressLog(prefix)
  );

  // ← KEY FIX: when userId loads async, reload everything from the correct key
  useEffect(() => {
    setGoalState(loadGoal(prefix));
    setProgressLog(loadProgressLog(prefix));
  }, [prefix]);

  // Persist progressLog whenever it changes
  useEffect(() => {
    localStorage.setItem(`${prefix}_progressLog`, JSON.stringify(progressLog));
  }, [progressLog, prefix]);

  const setGoal = useCallback(
    (g: DailyGoal) => {
      setGoalState(g);
      localStorage.setItem(`${prefix}_goal`, JSON.stringify(g));
    },
    [prefix]
  );

  const todayKey = getTodayKey();

  const todayProgress: DailyProgress = progressLog[todayKey] ?? {
    date: todayKey,
    cardsStudied: 0,
    topicsCompleted: [],
  };

  const recordCardStudied = useCallback(() => {
    setProgressLog((prev) => {
      const today = prev[todayKey] ?? {
        date: todayKey,
        cardsStudied: 0,
        topicsCompleted: [],
      };
      return {
        ...prev,
        [todayKey]: { ...today, cardsStudied: today.cardsStudied + 1 },
      };
    });
  }, [todayKey]);

  const recordTopicCompleted = useCallback(
    (topic: string) => {
      setProgressLog((prev) => {
        const today = prev[todayKey] ?? {
          date: todayKey,
          cardsStudied: 0,
          topicsCompleted: [],
        };
        if (today.topicsCompleted.includes(topic)) return prev;
        return {
          ...prev,
          [todayKey]: {
            ...today,
            topicsCompleted: [...today.topicsCompleted, topic],
          },
        };
      });
    },
    [todayKey]
  );

  const streak = (() => {
    let count = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;
      const entry = progressLog[key];
      const wasActive =
        entry && (entry.cardsStudied > 0 || entry.topicsCompleted.length > 0);
      if (wasActive) count++;
      else if (i > 0) break;
    }
    return count;
  })();

  const last7Days = getLast7Days().map((dateKey) => {
    const entry = progressLog[dateKey];
    const goalMet = entry
      ? goal.type === "cards"
        ? entry.cardsStudied >= goal.target
        : entry.topicsCompleted.length >= goal.target
      : false;
    return {
      date: dateKey,
      cardsStudied: entry?.cardsStudied ?? 0,
      topicsCompleted: entry?.topicsCompleted ?? [],
      goalMet,
    };
  });

  const goalCurrent =
    goal.type === "cards"
      ? todayProgress.cardsStudied
      : todayProgress.topicsCompleted.length;

  const goalPercent = Math.min(
    100,
    Math.round((goalCurrent / goal.target) * 100)
  );

  return {
    goal,
    setGoal,
    todayProgress,
    streak,
    last7Days,
    goalCurrent,
    goalPercent,
    recordCardStudied,
    recordTopicCompleted,
  };
}