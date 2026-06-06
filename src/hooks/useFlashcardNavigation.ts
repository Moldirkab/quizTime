import { useState, useEffect, useMemo, useCallback } from "react";
import type { Flashcard, QuizQuestion, StudyNotes, EditTarget } from "../types";
import type { useProgressData } from "./useProgressData";

type ProgressRecorder = Pick<
  ReturnType<typeof useProgressData>,
  "recordCardStudied" | "recordTopicCompleted"
>;

export function useFlashcardNavigation(
  initialCards: Flashcard[],
  progress?: ProgressRecorder,
  currentUserId: string | null = null
) {
  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("quiztime_cards");
    return saved ? JSON.parse(saved) : initialCards;
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    const saved = localStorage.getItem("quiztime_quiz_questions");
    return saved ? JSON.parse(saved) : [];
  });

  const [studyNotes, setStudyNotes] = useState<StudyNotes[]>(() => {
    const saved = localStorage.getItem("quiztime_study_notes");
    return saved ? JSON.parse(saved) : [];
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
  const [quizMode, setQuizMode] = useState(false);
  const [notesMode, setNotesMode] = useState(false);

  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  useEffect(() => {
    localStorage.setItem("quiztime_cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("quiztime_quiz_questions", JSON.stringify(quizQuestions));
  }, [quizQuestions]);

  useEffect(() => {
    localStorage.setItem("quiztime_study_notes", JSON.stringify(studyNotes));
  }, [studyNotes]);

  useEffect(() => {
    if (user) localStorage.setItem("quiztime_user", user);
    else localStorage.removeItem("quiztime_user");
  }, [user]);

  const displayedSubjects = useMemo(() => {
    const builtIn = ["coding", "french", "world history", "physics", "math"];
    
    const visibleCards = cards.filter(
      (c) => dashboardTab === "my-decks" ? c.ownerId === currentUserId : (c.isPublic || !c.ownerId)
    );
    const visibleQuizzes = quizQuestions.filter(
      (q) => dashboardTab === "my-decks" ? q.ownerId === currentUserId : q.isPublic
    );
    const visibleNotes = studyNotes.filter(
      (n) => dashboardTab === "my-decks" ? n.ownerId === currentUserId : n.isPublic
    );

    const fromCards = visibleCards.map((c) => c.subject.toLowerCase());
    const fromQuizzes = visibleQuizzes.map((q) => q.subject.toLowerCase());
    const fromNotes = visibleNotes.map((n) => n.subject.toLowerCase());
    
    const unique = Array.from(new Set([...builtIn, ...fromCards, ...fromQuizzes, ...fromNotes]));
    return unique.filter((sub) =>
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cards, quizQuestions, studyNotes, searchQuery, dashboardTab, currentUserId]);

  // ✅ Fixed: Case-Insensitive filter for available Flashcard topics
  const availableTopics = useMemo(() => {
    return Array.from(
      new Set(
        cards
          .filter((c) => c.subject.toLowerCase() === currentSubject?.toLowerCase())
          .filter((c) => dashboardTab === "my-decks" ? c.ownerId === currentUserId : (c.isPublic || !c.ownerId))
          .map((c) => c.theme)
      )
    );
  }, [cards, currentSubject, dashboardTab, currentUserId]);

  // ✅ Fixed: Case-Insensitive filter for available Quiz topics
  const availableQuizTopics = useMemo(() => {
    return Array.from(
      new Set(
        quizQuestions
          .filter((q) => q.subject.toLowerCase() === currentSubject?.toLowerCase())
          .filter((q) => dashboardTab === "my-decks" ? q.ownerId === currentUserId : q.isPublic)
          .map((q) => q.theme)
      )
    );
  }, [quizQuestions, currentSubject, dashboardTab, currentUserId]);

  // ✅ Fixed: Case-Insensitive filter for available Study Notes manuals
  const availableNotesTopics = useMemo(() => {
    return Array.from(
      new Set(
        studyNotes
          .filter((n) => n.subject.toLowerCase() === currentSubject?.toLowerCase())
          .filter((n) => dashboardTab === "my-decks" ? n.ownerId === currentUserId : n.isPublic)
          .map((n) => n.theme)
      )
    );
  }, [studyNotes, currentSubject, dashboardTab, currentUserId]);

  // ✅ Fixed: Case-Insensitive layout mapping for base card indexing
  const baseTopicCards = useMemo(() => {
    return cards.filter(
      (card) => card.subject.toLowerCase() === currentSubject?.toLowerCase() && card.theme === currentTopic
    );
  }, [cards, currentSubject, currentTopic]);

  const filteredCards = useMemo(() => {
    return sessionCardIds
      .map((id) => baseTopicCards.find((c) => c.id === id))
      .filter((c): c is Flashcard => !!c);
  }, [sessionCardIds, baseTopicCards]);

  // ✅ Fixed: Case-Insensitive calculation for total subject counts
  const subjectCards = useMemo(() => {
    return cards.filter((c) => c.subject.toLowerCase() === currentSubject?.toLowerCase());
  }, [cards, currentSubject]);

  // ✅ Fixed: Case-Insensitive filter for running Quiz instances
  const currentTopicQuizQuestions = useMemo(() => {
    return quizQuestions.filter(
      (q) => q.subject.toLowerCase() === currentSubject?.toLowerCase() && q.theme === currentTopic
    );
  }, [quizQuestions, currentSubject, currentTopic]);

  // ✅ Fixed: Case-Insensitive lookup for reading target Reference Materials
  const currentTopicNotes = useMemo(() => {
    return studyNotes.find(
      (n) => n.subject.toLowerCase() === currentSubject?.toLowerCase() && n.theme === currentTopic
    ) || null;
  }, [studyNotes, currentSubject, currentTopic]);

  // ✅ Fixed: Case-Insensitive parsing during user card session loads
  const handleSelectTopic = useCallback(
    (topic: string, mode: "flashcard" | "quiz" | "notes" = "flashcard") => {
      setCurrentTopic(topic);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsSessionFinished(false);
      setQuizMode(mode === "quiz");
      setNotesMode(mode === "notes");
      
      const matchingCards = cards.filter(
        (card) => card.subject.toLowerCase() === currentSubject?.toLowerCase() && card.theme === topic
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

  // ✅ Fixed: Case-Insensitive flag match for clear streaks operations
  const handleResetTopicStreaks = useCallback(() => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.subject.toLowerCase() === currentSubject?.toLowerCase() && card.theme === currentTopic) {
          return { ...card, difficultyStreak: 0 };
        }
        return card;
      })
    );
    if (currentTopic) handleSelectTopic(currentTopic, "flashcard");
  }, [currentSubject, currentTopic, handleSelectTopic]);

  // ✅ Fixed: Structural safety updates on data publishers
  const handlePublishTopic = useCallback((subject: string, topic: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.subject.toLowerCase() === subject.toLowerCase() && card.theme === topic
          ? { ...card, isPublic: true }
          : card
      )
    );
  }, []);

  const handlePublishQuizTopic = useCallback((subject: string, topic: string) => {
    setQuizQuestions((prev) =>
      prev.map((q) =>
        q.subject.toLowerCase() === subject.toLowerCase() && q.theme === topic
          ? { ...q, isPublic: true }
          : q
      )
    );
  }, []);

  const handlePublishNotesTopic = useCallback((subject: string, topic: string) => {
    setStudyNotes((prev) =>
      prev.map((n) =>
        n.subject.toLowerCase() === subject.toLowerCase() && n.theme === topic
          ? { ...n, isPublic: true }
          : n
      )
    );
  }, []);

  const handleAddQuizQuestions = useCallback(
    (newQuestions: Omit<QuizQuestion, "id">[]) => {
      const withIds = newQuestions.map((q, i) => ({
        ...q,
        id: Date.now() + i,
        isPublic: false,
      }));
      setQuizQuestions((prev) => [...prev, ...withIds]);
    },
    []
  );

  const handleAddStudyNotes = useCallback(
    (newNotes: Omit<StudyNotes, "id">) => {
      const item: StudyNotes = {
        ...newNotes,
        id: Date.now(),
        isPublic: false,
      };
      setStudyNotes((prev) => [...prev, item]);
    },
    []
  );

  const handleDeleteFlashcardTopic = useCallback(
    (subject: string, topic: string) => {
      setCards((prev) =>
        prev.filter((c) => !(c.subject.toLowerCase() === subject.toLowerCase() && c.theme === topic))
      );
    },
    []
  );

  const handleDeleteFlashcard = useCallback((cardId: number) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const handleDeleteQuizTopic = useCallback(
    (subject: string, topic: string) => {
      setQuizQuestions((prev) =>
        prev.filter((q) => !(q.subject.toLowerCase() === subject.toLowerCase() && q.theme === topic))
      );
    },
    []
  );

  const handleDeleteQuizQuestion = useCallback((questionId: number) => {
    setQuizQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const handleDeleteNotesTopic = useCallback(
    (subject: string, topic: string) => {
      setStudyNotes((prev) =>
        prev.filter((n) => !(n.subject.toLowerCase() === subject.toLowerCase() && n.theme === topic))
      );
    },
    []
  );

  const handleUpdateFlashcardTopic = useCallback(
    (
      oldSubject: string,
      oldTheme: string,
      newSubject: string,
      newTheme: string,
      updatedSlots: { id?: number; question: string; answer: string }[]
    ) => {
      setCards((prev) => {
        const withoutOld = prev.filter(
          (c) => !(c.subject.toLowerCase() === oldSubject.toLowerCase() && c.theme === oldTheme)
        );
        const firstMatch = prev.find(
          (c) => c.subject.toLowerCase() === oldSubject.toLowerCase() && c.theme === oldTheme
        );
        const updated = updatedSlots.map((slot, i) => ({
          id: slot.id ?? Date.now() + i,
          question: slot.question,
          answer: slot.answer,
          subject: newSubject.toLowerCase().trim(),
          theme: newTheme.trim(),
          isPublic: firstMatch?.isPublic ?? false,
          ownerId: firstMatch?.ownerId ?? null,
          ownerName: firstMatch?.ownerName ?? null,
          difficultyStreak: 0,
        }));
        return [...withoutOld, ...updated];
      });
    },
    []
  );

  const handleUpdateQuizTopic = useCallback(
    (
      oldSubject: string,
      oldTheme: string,
      newSubject: string,
      newTheme: string,
      updatedQuestions: Omit<QuizQuestion, "id">[]
    ) => {
      setQuizQuestions((prev) => {
        const firstMatch = prev.find(
          (q) => q.subject.toLowerCase() === oldSubject.toLowerCase() && q.theme === oldTheme
        );
        const withoutOld = prev.filter(
          (q) => !(q.subject.toLowerCase() === oldSubject.toLowerCase() && q.theme === oldTheme)
        );
        const updated = updatedQuestions.map((q, i) => ({
          ...q,
          id: Date.now() + i,
          subject: newSubject.toLowerCase().trim(),
          theme: newTheme.trim(),
          isPublic: firstMatch?.isPublic ?? false,
          ownerId: firstMatch?.ownerId ?? null,
          ownerName: firstMatch?.ownerName ?? null,
        }));
        return [...withoutOld, ...updated];
      });
    },
    []
  );

  const handleUpdateNotesTopic = useCallback(
    (
      oldSubject: string,
      oldTheme: string,
      newSubject: string,
      newTheme: string,
      newContent: string
    ) => {
      setStudyNotes((prev) => {
        const firstMatch = prev.find(
          (n) => n.subject.toLowerCase() === oldSubject.toLowerCase() && n.theme === oldTheme
        );
        const withoutOld = prev.filter(
          (n) => !(n.subject.toLowerCase() === oldSubject.toLowerCase() && n.theme === oldTheme)
        );
        const updated: StudyNotes = {
          id: firstMatch?.id ?? Date.now(),
          content: newContent,
          subject: newSubject.toLowerCase().trim(),
          theme: newTheme.trim(),
          isPublic: firstMatch?.isPublic ?? false,
          ownerId: firstMatch?.ownerId ?? null,
          ownerName: firstMatch?.ownerName ?? null,
        };
        return [...withoutOld, updated];
      });
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
    setNotesMode(false);
    setEditTarget(null);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    resetToHome();
  }, [resetToHome]);

  return {
    cards,
    setCards,
    quizQuestions,
    setQuizQuestions,
    studyNotes,
    setStudyNotes,
    handleAddQuizQuestions,
    handleAddStudyNotes,
    handleDeleteFlashcardTopic,
    handleDeleteFlashcard,
    handleDeleteQuizTopic,
    handleDeleteQuizQuestion,
    handleDeleteNotesTopic,
    handleUpdateFlashcardTopic,
    handleUpdateQuizTopic,
    handleUpdateNotesTopic,
    editTarget,
    setEditTarget,
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
    availableQuizTopics,
    availableNotesTopics,
    filteredCards,
    subjectCards,
    currentTopicQuizQuestions,
    currentTopicNotes,
    quizMode,
    setQuizMode,
    notesMode,
    setNotesMode,
    handleSelectTopic,
    handleNextCard,
    handlePrevCard,
    handleCardEvaluation,
    handleResetTopicStreaks,
    handlePublishTopic,
    handlePublishQuizTopic,
    handlePublishNotesTopic,
    resetToHome,
    handleLogout,
  };
}