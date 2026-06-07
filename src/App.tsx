import { useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import TopicsListView from "./components/TopicsListView";
import StudySessionView from "./components/StudySessionView";
import QuizSessionView from "./components/QuizSessionView";
import AuthView from "./components/AuthView";
import CreateDeckView from "./components/CreateDeckView";
import ProgressView from "./components/ProgressView";

import { useFlashcardNavigation } from "./hooks/useFlashcardNavigation";
import { useProgressData } from "./hooks/useProgressData";
import { INITIAL_DEFAULT_CARDS } from "./data/cards";
import type { QuizResult } from "./types";

const subjectImages: Record<string, string> = {
  coding: "/src/assets/coding.png",
  french: "/src/assets/french.png",
  "world history": "/src/assets/world_history.png",
  physics: "/src/assets/physics.png",
  math: "/src/assets/math.png",
  Default: "/src/assets/book.png",
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  if (!isSignedIn) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-16 bg-white/40 backdrop-blur-md rounded-2xl border border-[#36343D]/10 px-6 shadow-xl mt-12 animate-[fadeIn_0.2s_ease-out]">
        <span className="text-4xl">🔐</span>
        <h2 className="text-2xl font-extrabold text-[#36343D] tracking-tight mt-4 mb-2">
          Authentication Required
        </h2>
        <p className="text-sm text-[#36343D]/70 font-medium mb-6">
          You must be logged in to create custom card collections or track
          performance analytics.
        </p>
        <button
          type="button"
          onClick={() => navigate("/auth")}
          className="w-full bg-[#F3619C] text-[#EDE986] font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-all duration-200 shadow-md hover:bg-[#B494F8] hover:text-[#DBFA40]"
        >
          Sign In / Register →
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function AppContent() {
  const { user: clerkUser, isSignedIn } = useUser();
  const navigate = useNavigate();

  const progress = useProgressData(clerkUser?.id ?? null);
  const nav = useFlashcardNavigation(
    INITIAL_DEFAULT_CARDS,
    {
      recordCardStudied: progress.recordCardStudied,
      recordTopicCompleted: progress.recordTopicCompleted,
    },
    clerkUser?.id ?? null,
  );

  const displayUser = clerkUser?.firstName || clerkUser?.username || "Learner";

  const editModeProps = useMemo(() => {
    if (!nav.editTarget) return undefined;
    const targetSub = nav.editTarget.subject;
    const targetTheme = nav.editTarget.theme;

    if (nav.editTarget.type === "flashcard") {
      return {
        type: "flashcard" as const,
        subject: targetSub,
        theme: targetTheme,
        existingCards: nav.cards.filter(
          (c) =>
            c.subject.toLowerCase() === targetSub.toLowerCase() &&
            c.theme === targetTheme,
        ),
      };
    } else if (nav.editTarget.type === "quiz") {
      return {
        type: "quiz" as const,
        subject: targetSub,
        theme: targetTheme,
        existingQuestions: nav.quizQuestions.filter(
          (q) =>
            q.subject.toLowerCase() === targetSub.toLowerCase() &&
            q.theme === targetTheme,
        ),
      };
    } else {
      return {
        type: "notes" as const,
        subject: targetSub,
        theme: targetTheme,
        existingContent:
          nav.studyNotes.find(
            (n) =>
              n.subject.toLowerCase() === targetSub.toLowerCase() &&
              n.theme === targetTheme,
          )?.content || "",
      };
    }
  }, [nav.editTarget, nav.cards, nav.quizQuestions, nav.studyNotes]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF4CD] text-[#36343D] font-sans antialiased">
      {/* 🚀 Cleaned Navbar Component interface layout */}
      <Navbar
        user={isSignedIn ? displayUser : null}
        isAdmin={false}
        onLogoutClick={() => {
          nav.handleLogout();
        }}
      />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route
            path="/"
            element={
              /* 🌐 Cleaned DashboardView Props */
              <DashboardView
                searchQuery={nav.searchQuery}
                setSearchQuery={nav.setSearchQuery}
                displayedSubjects={nav.displayedSubjects}
                cards={nav.cards}
                quizQuestions={nav.quizQuestions}
                studyNotes={nav.studyNotes}
                subjectImages={subjectImages}
                currentTab={nav.dashboardTab}
                setCurrentTab={(tab) => {
                  if (tab === "my-decks" && !isSignedIn) {
                    navigate("/auth");
                  } else {
                    nav.setDashboardTab(tab);
                  }
                }}
              />
            }
          />

          <Route
            path="/auth"
            element={isSignedIn ? <Navigate to="/" replace /> : <AuthView />}
          />

          <Route
            path="/create-deck"
            element={
              <ProtectedRoute>
                <CreateDeckView
                  onCancel={() => {
                    nav.setEditTarget(null);
                    navigate("/");
                  }}
                  onPublishDeck={(newCards) => {
                    const cardsWithIds = newCards.map((card, index) => ({
                      ...card,
                      id: Date.now() + index,
                    }));
                    nav.setCards((prev) => [...prev, ...cardsWithIds]);
                    nav.setDashboardTab("my-decks");
                    navigate("/");
                  }}
                  onPublishQuiz={(newQuestions) => {
                    nav.handleAddQuizQuestions(newQuestions);
                    nav.setDashboardTab("my-decks");
                    navigate("/");
                  }}
                  onPublishNotes={(newNotes) => {
                    nav.handleAddStudyNotes({
                      ...newNotes,
                      ownerId: clerkUser?.id ?? null,
                      ownerName: displayUser,
                    });
                    nav.setDashboardTab("my-decks");
                    navigate("/");
                  }}
                  editMode={editModeProps}
                  onUpdateDeck={(oldSub, oldTheme, newSub, newTheme, slots) => {
                    nav.handleUpdateFlashcardTopic(
                      oldSub,
                      oldTheme,
                      newSub,
                      newTheme,
                      slots,
                    );
                    nav.setEditTarget(null);
                    navigate("/");
                  }}
                  onUpdateQuiz={(
                    oldSub,
                    oldTheme,
                    newSub,
                    newTheme,
                    questions,
                  ) => {
                    nav.handleUpdateQuizTopic(
                      oldSub,
                      oldTheme,
                      newSub,
                      newTheme,
                      questions,
                    );
                    nav.setEditTarget(null);
                    navigate("/");
                  }}
                  onUpdateNotes={(
                    oldSub,
                    oldTheme,
                    newSub,
                    newTheme,
                    content,
                  ) => {
                    nav.handleUpdateNotesTopic(
                      oldSub,
                      oldTheme,
                      newSub,
                      newTheme,
                      content,
                    );
                    nav.setEditTarget(null);
                    navigate("/");
                  }}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressView
                  user={displayUser}
                  cards={nav.cards}
                  goal={progress.goal}
                  setGoal={progress.setGoal}
                  todayProgress={progress.todayProgress}
                  streak={progress.streak}
                  last7Days={progress.last7Days}
                  goalCurrent={progress.goalCurrent}
                  goalPercent={progress.goalPercent}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/subject/:subjectName"
            element={
              <SubjectHubWrapper
                nav={nav}
                clerkUserId={clerkUser?.id ?? null}
              />
            }
          />

          <Route
            path="/subject/:subjectName/:topicName/flashcards"
            element={<FlashcardSessionWrapper nav={nav} />}
          />
          <Route
            path="/subject/:subjectName/:topicName/quiz"
            element={<QuizSessionWrapper nav={nav} progress={progress} />}
          />
          <Route
            path="/subject/:subjectName/:topicName/notes"
            element={<NotesSessionWrapper nav={nav} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function SubjectHubWrapper({
  nav,
  clerkUserId,
}: {
  nav: any;
  clerkUserId: string | null;
}) {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  const currentSubNormalized = subjectName || "";

  const availableTopics = useMemo(
    () =>
      Array.from(
        new Set(
          nav.cards
            .filter(
              (c: any) =>
                c.subject.toLowerCase() === currentSubNormalized.toLowerCase(),
            )
            .map((c: any) => c.theme as string),
        ),
      ),
    [nav.cards, currentSubNormalized],
  );

  const availableQuizTopics = useMemo(
    () =>
      Array.from(
        new Set(
          nav.quizQuestions
            .filter(
              (q: any) =>
                q.subject.toLowerCase() === currentSubNormalized.toLowerCase(),
            )
            .map((q: any) => q.theme as string),
        ),
      ),
    [nav.quizQuestions, currentSubNormalized],
  );

  const availableNotesTopics = useMemo(
    () =>
      Array.from(
        new Set(
          nav.studyNotes
            .filter(
              (n: any) =>
                n.subject.toLowerCase() === currentSubNormalized.toLowerCase(),
            )
            .map((n: any) => n.theme as string),
        ),
      ),
    [nav.studyNotes, currentSubNormalized],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {nav.dashboardTab === "my-decks" && (
        <div className="w-full bg-white/50 backdrop-blur-sm border border-[#36343D]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="m-0 text-sm font-extrabold text-[#36343D]">
              Deploy Decks Electronically
            </h4>
            <p className="m-0 text-xs font-medium text-[#36343D]/70">
              Publishing makes these content groups public to the Explore
              dashboard tab view.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(availableTopics as string[]).map((t: string) => (
              <button
                key={`pub-c-${t}`}
                type="button"
                onClick={() => nav.handlePublishTopic(currentSubNormalized, t)}
                className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#36343D] text-[#FAF4CD] shadow-sm hover:bg-[#F3619C] hover:text-white transition-all cursor-pointer"
              >
                🃏 Publish "{t}" 🚀
              </button>
            ))}
            {(availableQuizTopics as string[])
              .filter((t: string) =>
                nav.quizQuestions.some(
                  (q: any) =>
                    q.subject.toLowerCase() ===
                      currentSubNormalized.toLowerCase() &&
                    q.theme === t &&
                    !q.isPublic,
                ),
              )
              .map((t: string) => (
                <button
                  key={`pub-q-${t}`}
                  type="button"
                  onClick={() =>
                    nav.handlePublishQuizTopic(currentSubNormalized, t)
                  }
                  className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#F3619C] text-[#EDE986] shadow-sm hover:bg-[#B494F8] hover:text-[#DBFA40] transition-all cursor-pointer"
                >
                  🧠 Publish Quiz "{t}" 🚀
                </button>
              ))}
            {(availableNotesTopics as string[])
              .filter((t: string) =>
                nav.studyNotes.some(
                  (n: any) =>
                    n.subject.toLowerCase() ===
                      currentSubNormalized.toLowerCase() &&
                    n.theme === t &&
                    !n.isPublic,
                ),
              )
              .map((t: string) => (
                <button
                  key={`pub-n-${t}`}
                  type="button"
                  onClick={() =>
                    nav.handlePublishNotesTopic(currentSubNormalized, t)
                  }
                  className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#B494F8] text-white shadow-sm hover:bg-[#F3619C] transition-all cursor-pointer"
                >
                  📝 Publish Manual "{t}" 🚀
                </button>
              ))}
          </div>
        </div>
      )}

      <TopicsListView
        currentSubject={currentSubNormalized}
        availableTopics={availableTopics as string[]}
        availableQuizTopics={availableQuizTopics as string[]}
        availableNotesTopics={availableNotesTopics as string[]}
        cards={nav.cards}
        quizQuestions={nav.quizQuestions}
        studyNotes={nav.studyNotes}
        currentUserId={clerkUserId}
        onBack={() => navigate("/")}
        onSelectTopic={(topic, mode) =>
          navigate(
            `/subject/${currentSubNormalized}/${topic}/${mode === "notes" ? "notes" : mode === "quiz" ? "quiz" : "flashcards"}`,
          )
        }
        onEditFlashcardTopic={(subject, topic) => {
          nav.setEditTarget({ type: "flashcard", subject, theme: topic });
          navigate("/create-deck");
        }}
        onEditQuizTopic={(subject, topic) => {
          nav.setEditTarget({ type: "quiz", subject, theme: topic });
          navigate("/create-deck");
        }}
        onEditNotesTopic={(subject, topic) => {
          nav.setEditTarget({ type: "notes", subject, theme: topic });
          navigate("/create-deck");
        }}
        onDeleteFlashcardTopic={nav.handleDeleteFlashcardTopic}
        onDeleteQuizTopic={nav.handleDeleteQuizTopic}
        onDeleteNotesTopic={nav.handleDeleteNotesTopic}
      />
    </div>
  );
}

function FlashcardSessionWrapper({ nav }: { nav: any }) {
  const { subjectName, topicName } = useParams();
  const navigate = useNavigate();

  const baseTopicCards = useMemo(() => {
    return nav.cards.filter(
      (c: any) =>
        c.subject.toLowerCase() === subjectName?.toLowerCase() &&
        c.theme === topicName,
    );
  }, [nav.cards, subjectName, topicName]);

  useMemo(() => {
    if (subjectName && topicName) {
      nav.handleSelectTopicDirectly(subjectName, topicName);
    }
  }, [subjectName, topicName]);

  return (
    <StudySessionView
      currentSubject={subjectName || ""}
      currentTopic={topicName || ""}
      filteredCards={
        nav.filteredCards.length > 0 ? nav.filteredCards : baseTopicCards
      }
      currentCardIndex={nav.currentCardIndex}
      isFlipped={nav.isFlipped}
      setIsFlipped={nav.setIsFlipped}
      isSessionFinished={nav.isSessionFinished}
      onBack={() => navigate(`/subject/${subjectName}`)}
      onNext={() => {
        const total =
          nav.filteredCards.length > 0
            ? nav.filteredCards.length
            : baseTopicCards.length;
        if (nav.currentCardIndex >= total - 1) nav.setIsSessionFinished(true);
        else nav.setCurrentCardIndex((p: number) => p + 1);
      }}
      onPrev={() => {
        if (nav.currentCardIndex > 0)
          nav.setCurrentCardIndex((p: number) => p - 1);
      }}
      onEvaluateCard={(id, perf) => {
        const total =
          nav.filteredCards.length > 0
            ? nav.filteredCards.length
            : baseTopicCards.length;
        nav.handleCardEvaluation(id, perf, total);
      }}
      onResetStreaks={() =>
        nav.handleResetTopicStreaksDirectly(subjectName, topicName)
      }
    />
  );
}

function QuizSessionWrapper({ nav, progress }: { nav: any; progress: any }) {
  const { subjectName, topicName } = useParams();
  const navigate = useNavigate();

  const currentTopicQuizQuestions = useMemo(() => {
    return nav.quizQuestions.filter(
      (q: any) =>
        q.subject.toLowerCase() === subjectName?.toLowerCase() &&
        q.theme === topicName,
    );
  }, [nav.quizQuestions, subjectName, topicName]);

  const handleQuizFinish = (_results: QuizResult[]) => {
    if (topicName) {
      progress.recordTopicCompleted(topicName);
    }
    navigate(`/subject/${subjectName}`);
  };

  return (
    <QuizSessionView
      currentSubject={subjectName || ""}
      currentTopic={topicName || ""}
      questions={currentTopicQuizQuestions}
      onBack={() => navigate(`/subject/${subjectName}`)}
      onFinish={handleQuizFinish}
    />
  );
}

function NotesSessionWrapper({ nav }: { nav: any }) {
  const { subjectName, topicName } = useParams();
  const navigate = useNavigate();

  const currentTopicNotes = useMemo(() => {
    return (
      nav.studyNotes.find(
        (n: any) =>
          n.subject.toLowerCase() === subjectName?.toLowerCase() &&
          n.theme === topicName,
      ) || null
    );
  }, [nav.studyNotes, subjectName, topicName]);

  return (
    <div className="w-full max-w-[700px] mx-auto flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex items-center justify-between border-b border-[#36343D]/10 pb-3">
        <button
          className="text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={() => navigate(`/subject/${subjectName}`)}
        >
          ← Back to Topics
        </button>
        <span className="text-sm font-bold text-[#B494F8] bg-[#B494F8]/10 px-3 py-1 rounded-full capitalize">
          {subjectName}
        </span>
      </div>

      <div className="mb-2">
        <h2 className="text-2xl font-extrabold text-[#36343D] m-0">
          {topicName} Reference Manual
        </h2>
        <p className="text-xs font-semibold text-[#36343D]/50 uppercase tracking-wider mt-1">
          Review Summaries & Core Definitions
        </p>
      </div>

      <div className="bg-white border border-[#36343D]/10 rounded-2xl p-6 shadow-sm min-h-[200px]">
        {currentTopicNotes ? (
          <div className="prose text-sm font-medium text-[#36343D]/80 leading-relaxed whitespace-pre-wrap">
            {currentTopicNotes.content}
          </div>
        ) : (
          <div className="text-sm italic text-gray-400 py-4">
            No written summary content found for this topic. Use the editor to
            add material!
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
