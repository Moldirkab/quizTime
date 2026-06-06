import { useState, useMemo } from "react";
import type { Flashcard, QuizQuestion, StudyNotes } from "../types";

type ViewMode = "flashcard" | "quiz" | "notes";

interface TopicsListViewProps {
  currentSubject: string;
  availableTopics: string[];
  availableQuizTopics: string[];
  availableNotesTopics: string[];
  cards: Flashcard[];
  quizQuestions: QuizQuestion[];
  studyNotes: StudyNotes[];
  currentUserId?: string | null;
  onBack: () => void;
  onSelectTopic: (topic: string, mode: "flashcard" | "quiz" | "notes") => void;
  onEditFlashcardTopic: (subject: string, topic: string) => void;
  onEditQuizTopic: (subject: string, topic: string) => void;
  onEditNotesTopic: (subject: string, topic: string) => void;
  onDeleteFlashcardTopic: (subject: string, topic: string) => void;
  onDeleteQuizTopic: (subject: string, topic: string) => void;
  onDeleteNotesTopic: (subject: string, topic: string) => void;
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-[#93ABD8] text-[#FAF4CD]",
    "bg-[#F3619C] text-[#EDE986]",
    "bg-[#B494F8] text-[#DBFA40]",
    "bg-[#ED7C30] text-white",
    "bg-[#36343D] text-[#FAF4CD]",
  ];
  const colorIndex =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;

  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${colors[colorIndex]}`}
      title={name}
    >
      {initials}
    </div>
  );
}

export default function TopicsListView({
  currentSubject,
  availableTopics,
  availableQuizTopics,
  availableNotesTopics,
  cards,
  quizQuestions,
  studyNotes,
  currentUserId,
  onBack,
  onSelectTopic,
  onEditFlashcardTopic,
  onEditQuizTopic,
  onEditNotesTopic,
  onDeleteFlashcardTopic,
  onDeleteQuizTopic,
  onDeleteNotesTopic,
}: TopicsListViewProps) {
  const [globalMode, setGlobalMode] = useState<ViewMode>("flashcard");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const confirmDeleteTopic = (
    type: "flashcard" | "quiz" | "notes",
    subject: string,
    topic: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setActiveDropdown(null);
    if (
      window.confirm(
        `Delete entire "${topic}" ${type} topic? This cannot be undone.`,
      )
    ) {
      if (type === "flashcard") onDeleteFlashcardTopic(subject, topic);
      else if (type === "quiz") onDeleteQuizTopic(subject, topic);
      else onDeleteNotesTopic(subject, topic);
    }
  };

  const getFlashcardOwner = (topic: string) => {
    const card = cards.find(
      (c) => c.subject === currentSubject && c.theme === topic,
    );
    return {
      ownerId: card?.ownerId ?? null,
      ownerName: card?.ownerName ?? "quizTime",
    };
  };

  const getQuizOwner = (topic: string) => {
    const q = quizQuestions.find(
      (q) => q.subject === currentSubject && q.theme === topic,
    );
    return {
      ownerId: q?.ownerId ?? null,
      ownerName: q?.ownerName ?? "quizTime",
    };
  };

  const getNotesOwner = (topic: string) => {
    const n = studyNotes.find(
      (n) => n.subject === currentSubject && n.theme === topic,
    );
    return {
      ownerId: n?.ownerId ?? null,
      ownerName: n?.ownerName ?? "quizTime",
    };
  };

  // Base topics container setup depending safely on chosen workspace tab filter layout
  const filteredTopics = useMemo(() => {
    if (globalMode === "quiz") return availableQuizTopics;
    if (globalMode === "notes") return availableNotesTopics;
    return availableTopics;
  }, [globalMode, availableTopics, availableQuizTopics, availableNotesTopics]);

  return (
    <div className="w-full max-w-[850px] mx-auto flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
      {activeDropdown && (
        <div
          className="fixed inset-0 z-10 bg-transparent cursor-default"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Header section */}
      <div className="flex flex-col gap-4 border-b border-[#36343D]/10 pb-5">
        <div className="flex flex-col gap-2">
          <button
            className="self-start text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
            onClick={onBack}
          >
            ← Back to Subjects
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#36343D] tracking-tight capitalize m-0">
            {currentSubject} Hub
          </h1>
        </div>

        {/* Unified Navigation Mode Tabs */}
        <div className="flex bg-[#36343D]/5 p-1.5 rounded-2xl border border-[#36343D]/10 self-start w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setGlobalMode("flashcard");
              setActiveDropdown(null);
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-none cursor-pointer select-none whitespace-nowrap
              ${
                globalMode === "flashcard"
                  ? "bg-[#93ABD8] text-[#FAF4CD] shadow-sm"
                  : "bg-transparent text-[#36343D]/60 hover:text-[#36343D] hover:bg-[#36343D]/5"
              }`}
          >
            🃏 Flashcards
          </button>

          <button
            type="button"
            onClick={() => {
              setGlobalMode("quiz");
              setActiveDropdown(null);
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-none cursor-pointer select-none whitespace-nowrap
              ${
                globalMode === "quiz"
                  ? "bg-[#F3619C] text-[#EDE986] shadow-sm"
                  : "bg-transparent text-[#36343D]/60 hover:text-[#36343D] hover:bg-[#36343D]/5"
              }`}
          >
            🧠 Quizzes
          </button>

          <button
            type="button"
            onClick={() => {
              setGlobalMode("notes");
              setActiveDropdown(null);
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border-none cursor-pointer select-none whitespace-nowrap
              ${
                globalMode === "notes"
                  ? "bg-[#B494F8] text-[#FAF4CD] shadow-sm"
                  : "bg-transparent text-[#36343D]/60 hover:text-[#36343D] hover:bg-[#36343D]/5"
              }`}
          >
            📝 Study Notes
          </button>
        </div>
      </div>

      {/* Dynamic Grid */}
      {filteredTopics.length > 0 ? (
        <div className="flex flex-col gap-3.5 w-full">
          {filteredTopics.map((topic) => {
            const topicCardCount = cards.filter(
              (c) => c.subject === currentSubject && c.theme === topic,
            ).length;
            const hasQuiz = availableQuizTopics.includes(topic);
            const hasNotes = availableNotesTopics.includes(topic);

            const flashcardOwner = getFlashcardOwner(topic);
            const quizOwner = hasQuiz ? getQuizOwner(topic) : null;
            const notesOwner = hasNotes ? getNotesOwner(topic) : null;

            const canEditFlashcard = flashcardOwner.ownerId === currentUserId;
            const canEditQuiz = quizOwner?.ownerId === currentUserId;
            const canEditNotes = notesOwner?.ownerId === currentUserId;

            const hasAnyPermissions =
              (globalMode === "quiz" && canEditQuiz) ||
              (globalMode === "notes" && canEditNotes) ||
              (globalMode === "flashcard" && canEditFlashcard);

            return (
              <div
                key={topic}
                className="w-full bg-white border border-[#36343D]/10 rounded-xl shadow-sm transition-all duration-200 hover:border-[#93ABD8] overflow-visible relative"
              >
                <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="m-0 text-lg font-bold text-[#36343D] tracking-tight">
                        {topic}
                      </h3>
                      {globalMode !== "quiz" && hasQuiz && (
                        <span className="text-[10px] font-bold bg-[#F3619C]/15 text-[#F3619C] px-2 py-0.5 rounded-full">
                          🧠 Quiz Ready
                        </span>
                      )}
                      {globalMode !== "notes" && hasNotes && (
                        <span className="text-[10px] font-bold bg-[#B494F8]/15 text-[#B494F8] px-2 py-0.5 rounded-full">
                          📝 Notes Available
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-[#ED7C30] bg-[#ED7C30]/10 px-2.5 py-1 rounded-md self-start">
                      {globalMode === "quiz"
                        ? "Interactive Session Setup"
                        : globalMode === "notes"
                          ? "Summary Reference Sheet"
                          : `${topicCardCount} flashcards ready`}
                    </span>

                    {/* Dynamic Creator Profile Info */}
                    <div className="flex flex-col gap-1 mt-1">
                      {globalMode === "flashcard" && (
                        <div className="flex items-center gap-1.5">
                          <InitialsAvatar
                            name={flashcardOwner.ownerName ?? "quizTime"}
                          />
                          <span className="text-xs text-[#36343D]/50 font-medium">
                            {flashcardOwner.ownerName ?? "quizTime"}
                            <span className="ml-1 opacity-60">· author</span>
                          </span>
                        </div>
                      )}
                      {globalMode === "quiz" && quizOwner && (
                        <div className="flex items-center gap-1.5">
                          <InitialsAvatar
                            name={quizOwner.ownerName ?? "quizTime"}
                          />
                          <span className="text-xs text-[#36343D]/50 font-medium">
                            {quizOwner.ownerName ?? "quizTime"}
                            <span className="ml-1 opacity-60">
                              · quiz controller
                            </span>
                          </span>
                        </div>
                      )}
                      {globalMode === "notes" && notesOwner && (
                        <div className="flex items-center gap-1.5">
                          <InitialsAvatar
                            name={notesOwner.ownerName ?? "quizTime"}
                          />
                          <span className="text-xs text-[#36343D]/50 font-medium">
                            {notesOwner.ownerName ?? "quizTime"}
                            <span className="ml-1 opacity-60">
                              · notes author
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Execution Launcher Column */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      type="button"
                      className={`w-full sm:w-auto font-bold text-sm px-6 py-2.5 rounded-xl border-none cursor-pointer transition-all shrink-0 text-center
                        ${
                          globalMode === "quiz"
                            ? "bg-[#F3619C] text-[#EDE986] hover:bg-[#B494F8] hover:text-[#DBFA40]"
                            : globalMode === "notes"
                              ? "bg-[#B494F8] text-[#DBFA40] hover:bg-[#36343D] hover:text-[#FAF4CD]"
                              : "bg-[#36343D] text-[#FAF4CD] hover:bg-[#93ABD8] hover:text-[#FAF4CD]"
                        }`}
                      onClick={() => onSelectTopic(topic, globalMode)}
                    >
                      {globalMode === "quiz"
                        ? "Start Quiz 🧠"
                        : globalMode === "notes"
                          ? "Open Notes 📝"
                          : "Study Deck ⚡"}
                    </button>

                    {/* Settings Action Hub */}
                    {hasAnyPermissions && (
                      <div className="relative shrink-0 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === topic ? null : topic,
                            );
                          }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold bg-gray-50 border border-[#36343D]/10 text-[#36343D] cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          ⋮
                        </button>

                        {activeDropdown === topic && (
                          <div className="absolute right-0 mt-2 w-56 bg-white border border-[#36343D]/10 rounded-xl shadow-lg py-1.5 z-30 animate-[fadeIn_0.15s_ease-out]">
                            {globalMode === "flashcard" && canEditFlashcard && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    onEditFlashcardTopic(currentSubject, topic);
                                  }}
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-[#36343D] bg-transparent border-none cursor-pointer hover:bg-[#93ABD8]/10 transition-colors flex items-center gap-2"
                                >
                                  ✏️ Edit Topic Content
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    confirmDeleteTopic(
                                      "flashcard",
                                      currentSubject,
                                      topic,
                                      e,
                                    )
                                  }
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-red-500 bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  🗑️ Delete Entire Deck
                                </button>
                              </>
                            )}

                            {globalMode === "quiz" && canEditQuiz && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    onEditQuizTopic(currentSubject, topic);
                                  }}
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-[#36343D] bg-transparent border-none cursor-pointer hover:bg-[#F3619C]/10 transition-colors flex items-center gap-2"
                                >
                                  ✏️ Edit Quiz Structure
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    confirmDeleteTopic(
                                      "quiz",
                                      currentSubject,
                                      topic,
                                      e,
                                    )
                                  }
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-red-500 bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  🗑️ Delete Target Quiz
                                </button>
                              </>
                            )}

                            {globalMode === "notes" && canEditNotes && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(null);
                                    onEditNotesTopic(currentSubject, topic);
                                  }}
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-[#36343D] bg-transparent border-none cursor-pointer hover:bg-[#B494F8]/10 transition-colors flex items-center gap-2"
                                >
                                  ✏️ Edit Notes Content
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    confirmDeleteTopic(
                                      "notes",
                                      currentSubject,
                                      topic,
                                      e,
                                    )
                                  }
                                  className="w-full text-left font-bold text-xs px-4 py-2.5 text-red-500 bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  🗑️ Delete Study Notes
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-12 bg-white/40 border-2 border-dashed border-[#36343D]/10 rounded-2xl text-[#36343D] opacity-60 italic text-sm">
          No topics available for{" "}
          {globalMode === "quiz"
            ? "quizzes"
            : globalMode === "notes"
              ? "notes"
              : "flashcards"}{" "}
          right now.
        </div>
      )}
    </div>
  );
}
