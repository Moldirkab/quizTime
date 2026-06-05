import { useState, useEffect, useMemo, useCallback } from "react";
import type { Flashcard } from "../types";
import type { useProgressData } from "./useProgressData";

type ProgressRecorder = Pick<
  ReturnType<typeof useProgressData>,
  "recordCardStudied" | "recordTopicCompleted"
>;

export function useFlashcardNavigation(
  initialCards: Flashcard[],
  progress?: ProgressRecorder
) {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("quiztime_cards");
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [user, setUser] = useState<string | null>(() =>
    localStorage.getItem("quiztime_user")
  );

  const [currentView, setCurrentView] = useState<
    "dashboard" | "auth" | "create-deck" | "progress"
  >("dashboard");
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionCardIds, setSessionCardIds] = useState<number[]>([]);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"explore" | "my-decks">("explore");

  // ← NEW
  const [quizMode, setQuizMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("quiztime_cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (user) localStorage.setItem("quiztime_user", user);
    else localStorage.removeItem("quiztime_user");
  }, [user]);

  const displayedSubjects = useMemo(() => {
    const builtIn = ["coding", "french", "world history", "physics", "math"];
    const dynamic = cards.map((c) => c.subject.toLowerCase());
    const unique = Array.from(new Set([...builtIn, ...dynamic]));
    return unique.filter((sub) =>
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cards, searchQuery]);

  const availableTopics = useMemo(() => {
    return Array.from(
      new Set(
        cards.filter((c) => c.subject === currentSubject).map((c) => c.theme)
      )
    );
  }, [cards, currentSubject]);

  const baseTopicCards = useMemo(() => {
    return cards.filter(
      (card) => card.subject === currentSubject && card.theme === currentTopic
    );
  }, [cards, currentSubject, currentTopic]);

  const filteredCards = useMemo(() => {
    return sessionCardIds
      .map((id) => baseTopicCards.find((c) => c.id === id))
      .filter((c): c is Flashcard => !!c);
  }, [sessionCardIds, baseTopicCards]);

  // All cards in current subject (for quiz wrong answer pool)
  const subjectCards = useMemo(() => {
    return cards.filter((c) => c.subject === currentSubject);
  }, [cards, currentSubject]);

  // ← UPDATED: now accepts mode
  const handleSelectTopic = useCallback(
    (topic: string, mode: "flashcard" | "quiz" = "flashcard") => {
      setCurrentTopic(topic);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsSessionFinished(false);
      setQuizMode(mode === "quiz");

      const matchingCards = cards.filter(
        (card) => card.subject === currentSubject && card.theme === topic
      );
      setSessionCardIds(matchingCards.map((c) => c.id));
    },
    [cards, currentSubject]
  );

  const handleNextCard = useCallback(() => {
    setIsFlipped(false);
    if (currentCardIndex >= filteredCards.length - 1) {
      setIsSessionFinished(true);
    } else {
      setCurrentCardIndex((prev) => prev + 1);
    }
  }, [currentCardIndex, filteredCards.length]);

  const handlePrevCard = useCallback(() => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    }
  }, [currentCardIndex]);

  const handleCardEvaluation = useCallback(
    (cardId: number, performance: "hard" | "easy") => {
      progress?.recordCardStudied();

      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id === cardId) {
            const currentStreak = card.difficultyStreak ?? 0;
            return {
              ...card,
              difficultyStreak:
                performance === "easy" ? currentStreak + 1 : 0,
            };
          }
          return card;
        })
      );

      if (performance === "hard") {
        setSessionCardIds((prevIds) => [...prevIds, cardId]);
        setIsFlipped(false);
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        setIsFlipped(false);
        if (currentCardIndex >= filteredCards.length - 1) {
          setIsSessionFinished(true);
        } else {
          setCurrentCardIndex((prev) => prev + 1);
        }
      }
    },
    [currentCardIndex, filteredCards.length, progress]
  );

  const handleResetTopicStreaks = useCallback(() => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.subject === currentSubject && card.theme === currentTopic) {
          return { ...card, difficultyStreak: 0 };
        }
        return card;
      })
    );
    if (currentTopic) handleSelectTopic(currentTopic, "flashcard");
  }, [currentSubject, currentTopic, handleSelectTopic]);

  const handlePublishTopic = useCallback(
    (subject: string, topic: string) => {
      setCards((prev) =>
        prev.map((card) =>
          card.subject === subject && card.theme === topic
            ? { ...card, isPublic: true }
            : card
        )
      );
    },
    []
  );

  useEffect(() => {
    if (isSessionFinished && currentTopic) {
      progress?.recordTopicCompleted(currentTopic);
    }
  }, [isSessionFinished, currentTopic, progress]);

  const resetToHome = useCallback(() => {
    setCurrentView("dashboard");
    setCurrentSubject(null);
    setCurrentTopic(null);
    setSessionCardIds([]);
    setIsSessionFinished(false);
    setQuizMode(false);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    resetToHome();
  }, [resetToHome]);

  return {
    cards,
    setCards,
    user,
    setUser,
    currentView,
    setCurrentView,
    currentSubject,
    setCurrentSubject,
    currentTopic,
    setCurrentTopic,
    currentCardIndex,
    isFlipped,
    setIsFlipped,
    searchQuery,
    setSearchQuery,
    isSessionFinished,
    dashboardTab,
    setDashboardTab,
    displayedSubjects,
    availableTopics,
    filteredCards,
    subjectCards,
    quizMode,
    setQuizMode,
    handleSelectTopic,
    handleNextCard,
    handlePrevCard,
    handleCardEvaluation,
    handleResetTopicStreaks,
    handlePublishTopic,
    resetToHome,
    handleLogout,
  };
}