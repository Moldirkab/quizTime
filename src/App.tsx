import { useEffect } from "react";
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
import { useUser } from "@clerk/clerk-react";
import type { QuizResult } from "./types";

const subjectImages: Record<string, string> = {
  coding: "./src/assets/coding.png",
  french: "./src/assets/french.png",
  "world history": "./src/assets/world_history.png",
  physics: "./src/assets/physics.png",
  math: "./src/assets/math.png",
  Default: "./src/assets/book.png",
};

export default function App() {
  const { user: clerkUser, isSignedIn } = useUser();
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

  useEffect(() => {
    if (isSignedIn && nav.currentView === "auth") {
      nav.resetToHome();
    }
  }, [isSignedIn, nav.currentView, nav]);

  const renderProtectedView = (component: React.ReactNode) => {
    if (isSignedIn) return component;
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
          onClick={() => nav.setCurrentView("auth")}
          className="w-full bg-[#F3619C] text-[#EDE986] font-bold py-3.5 px-6 rounded-xl border-none cursor-pointer transition-all duration-200 shadow-md hover:bg-[#B494F8] hover:text-[#DBFA40]"
        >
          Sign In / Register →
        </button>
      </div>
    );
  };

  const handleQuizFinish = (_results: QuizResult[]) => {
    if (nav.currentTopic) {
      progress.recordTopicCompleted(nav.currentTopic);
    }
  };

  const editModeProps = nav.editTarget
    ? nav.editTarget.type === "flashcard"
      ? {
          type: "flashcard" as const,
          subject: nav.editTarget.subject,
          theme: nav.editTarget.theme,
          existingCards: nav.cards.filter(
            (c) =>
              c.subject.toLowerCase() ===
                nav.editTarget!.subject.toLowerCase() &&
              c.theme === nav.editTarget!.theme,
          ),
        }
      : nav.editTarget.type === "quiz"
        ? {
            type: "quiz" as const,
            subject: nav.editTarget.subject,
            theme: nav.editTarget.theme,
            existingQuestions: nav.quizQuestions.filter(
              (q) =>
                q.subject.toLowerCase() ===
                  nav.editTarget!.subject.toLowerCase() &&
                q.theme === nav.editTarget!.theme,
            ),
          }
        : {
            type: "notes" as const,
            subject: nav.editTarget.subject,
            theme: nav.editTarget.theme,
            existingContent:
              nav.studyNotes.find(
                (n) =>
                  n.subject.toLowerCase() ===
                    nav.editTarget!.subject.toLowerCase() &&
                  n.theme === nav.editTarget!.theme,
              )?.content || "",
          }
    : undefined;

  const handleTopicSelectionWithNotes = (
    topic: string,
    mode: "flashcard" | "quiz" | "notes",
  ) => {
    if (mode === "notes") {
      nav.setCurrentTopic(topic);
      nav.setQuizMode(false);
      nav.setNotesMode(true);
    } else {
      nav.setNotesMode(false);
      nav.handleSelectTopic(topic, mode);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF4CD] text-[#36343D] font-sans antialiased">
      <Navbar
        user={isSignedIn ? displayUser : null}
        isAdmin={false}
        onExploreClick={nav.resetToHome}
        onCreateClick={() => {
          nav.setEditTarget(null);
          nav.setCurrentView("create-deck");
        }}
        onLoginClick={() => nav.setCurrentView("auth")}
        onLogoutClick={nav.handleLogout}
        onProgressClick={() => nav.setCurrentView("progress")}
        setCurrentView={nav.setCurrentView}
      />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {nav.currentView === "auth" && !isSignedIn ? (
          <AuthView />
        ) : nav.currentView === "create-deck" ? (
          renderProtectedView(
            <CreateDeckView
              onCancel={() => {
                nav.setEditTarget(null);
                nav.setCurrentView("dashboard");
              }}
              onPublishDeck={(newCards) => {
                const cardsWithIds = newCards.map((card, index) => ({
                  ...card,
                  id: Date.now() + index,
                }));
                nav.setCards((prev) => [...prev, ...cardsWithIds]);
                nav.setDashboardTab("my-decks");
                nav.setCurrentView("dashboard");
              }}
              onPublishQuiz={(newQuestions) => {
                nav.handleAddQuizQuestions(newQuestions);
                nav.setDashboardTab("my-decks");
                nav.setCurrentView("dashboard");
              }}
              onPublishNotes={(newNotes) => {
                nav.handleAddStudyNotes({
                  ...newNotes,
                  ownerId: clerkUser?.id ?? null,
                  ownerName: displayUser,
                });
                nav.setDashboardTab("my-decks");
                nav.setCurrentView("dashboard");
              }}
              editMode={editModeProps}
              onUpdateDeck={(
                oldSubject,
                oldTheme,
                newSubject,
                newTheme,
                slots,
              ) => {
                nav.handleUpdateFlashcardTopic(
                  oldSubject,
                  oldTheme,
                  newSubject,
                  newTheme,
                  slots,
                );
                nav.setEditTarget(null);
                nav.setCurrentView("dashboard");
              }}
              onUpdateQuiz={(
                oldSubject,
                oldTheme,
                newSubject,
                newTheme,
                questions,
              ) => {
                nav.handleUpdateQuizTopic(
                  oldSubject,
                  oldTheme,
                  newSubject,
                  newTheme,
                  questions,
                );
                nav.setEditTarget(null);
                nav.setCurrentView("dashboard");
              }}
              onUpdateNotes={(
                oldSubject,
                oldTheme,
                newSubject,
                newTheme,
                content,
              ) => {
                nav.handleUpdateNotesTopic(
                  oldSubject,
                  oldTheme,
                  newSubject,
                  newTheme,
                  content,
                );
                nav.setEditTarget(null);
                nav.setCurrentView("dashboard");
              }}
            />,
          )
        ) : nav.currentView === "progress" ? (
          renderProtectedView(
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
            />,
          )
        ) : (
          <div className="w-full">
            {nav.currentSubject === null && (
              <DashboardView
                searchQuery={nav.searchQuery}
                setSearchQuery={nav.setSearchQuery}
                displayedSubjects={nav.displayedSubjects}
                cards={nav.cards}
                quizQuestions={nav.quizQuestions}
                studyNotes={nav.studyNotes}
                subjectImages={subjectImages}
                onSelectSubject={(sub) => nav.setCurrentSubject(sub)}
                currentTab={nav.dashboardTab}
                setCurrentTab={(tab) => {
                  if (tab === "my-decks" && !isSignedIn) {
                    nav.setCurrentView("auth");
                  } else {
                    nav.setDashboardTab(tab);
                  }
                }}
              />
            )}

            {nav.currentSubject !== null && nav.currentTopic === null && (
              <div className="w-full flex flex-col gap-4">
                {nav.dashboardTab === "my-decks" && (
                  <div className="w-full bg-white/50 backdrop-blur-sm border border-[#36343D]/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <h4 className="m-0 text-sm font-extrabold text-[#36343D]">
                        Deploy Decks Electronically
                      </h4>
                      <p className="m-0 text-xs font-medium text-[#36343D]/70">
                        Publishing makes these card groups, summaries, and
                        quizzes public to everyone on the Explore tab.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nav.availableTopics.map((topicName) => (
                        <button
                          key={`deck-${topicName}`}
                          type="button"
                          onClick={() =>
                            nav.handlePublishTopic(
                              nav.currentSubject!,
                              topicName,
                            )
                          }
                          className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#36343D] text-[#FAF4CD] shadow-sm hover:bg-[#F3619C] hover:text-white transition-all cursor-pointer"
                        >
                          🃏 Publish "{topicName}" 🚀
                        </button>
                      ))}
                      {nav.availableQuizTopics
                        .filter((topicName) =>
                          nav.quizQuestions.some(
                            (q) =>
                              q.subject.toLowerCase() ===
                                nav.currentSubject?.toLowerCase() &&
                              q.theme === topicName &&
                              !q.isPublic,
                          ),
                        )
                        .map((topicName) => (
                          <button
                            key={`quiz-${topicName}`}
                            type="button"
                            onClick={() =>
                              nav.handlePublishQuizTopic(
                                nav.currentSubject!,
                                topicName,
                              )
                            }
                            className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#F3619C] text-[#EDE986] shadow-sm hover:bg-[#B494F8] hover:text-[#DBFA40] transition-all cursor-pointer"
                          >
                            🧠 Publish Quiz "{topicName}" 🚀
                          </button>
                        ))}
                      {nav.availableNotesTopics
                        .filter((topicName) =>
                          nav.studyNotes.some(
                            (n) =>
                              n.subject.toLowerCase() ===
                                nav.currentSubject?.toLowerCase() &&
                              n.theme === topicName &&
                              !n.isPublic,
                          ),
                        )
                        .map((topicName) => (
                          <button
                            key={`notes-${topicName}`}
                            type="button"
                            onClick={() =>
                              nav.handlePublishNotesTopic(
                                nav.currentSubject!,
                                topicName,
                              )
                            }
                            className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#B494F8] text-white shadow-sm hover:bg-[#F3619C] transition-all cursor-pointer"
                          >
                            📝 Publish Manual "{topicName}" 🚀
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <TopicsListView
                  currentSubject={nav.currentSubject}
                  availableTopics={nav.availableTopics}
                  availableQuizTopics={nav.availableQuizTopics}
                  availableNotesTopics={nav.availableNotesTopics}
                  cards={nav.cards}
                  quizQuestions={nav.quizQuestions}
                  studyNotes={nav.studyNotes}
                  currentUserId={clerkUser?.id ?? null}
                  onBack={() => nav.setCurrentSubject(null)}
                  onSelectTopic={handleTopicSelectionWithNotes}
                  onEditFlashcardTopic={(subject, topic) => {
                    nav.setEditTarget({
                      type: "flashcard",
                      subject,
                      theme: topic,
                    });
                    nav.setCurrentView("create-deck");
                  }}
                  onEditQuizTopic={(subject, topic) => {
                    nav.setEditTarget({ type: "quiz", subject, theme: topic });
                    nav.setCurrentView("create-deck");
                  }}
                  onEditNotesTopic={(subject, topic) => {
                    nav.setEditTarget({ type: "notes", subject, theme: topic });
                    nav.setCurrentView("create-deck");
                  }}
                  onDeleteFlashcardTopic={nav.handleDeleteFlashcardTopic}
                  onDeleteQuizTopic={nav.handleDeleteQuizTopic}
                  onDeleteNotesTopic={nav.handleDeleteNotesTopic}
                />
              </div>
            )}

            {nav.currentSubject !== null &&
              nav.currentTopic !== null &&
              (nav.notesMode ? (
                <div className="w-full max-w-[700px] mx-auto flex flex-col gap-5 animate-[fadeIn_0.25s_ease-out]">
                  <div className="flex items-center justify-between border-b border-[#36343D]/10 pb-3">
                    <button
                      className="text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
                      onClick={() => {
                        nav.setNotesMode(false);
                        nav.setCurrentTopic(null);
                      }}
                    >
                      ← Back to Topics
                    </button>
                    <span className="text-sm font-bold text-[#B494F8] bg-[#B494F8]/10 px-3 py-1 rounded-full capitalize">
                      {nav.currentSubject}
                    </span>
                  </div>

                  <div className="mb-2">
                    <h2 className="text-2xl font-extrabold text-[#36343D] m-0">
                      {nav.currentTopic} Reference Manual
                    </h2>
                    <p className="text-xs font-semibold text-[#36343D]/50 uppercase tracking-wider mt-1">
                      Review Summaries & Core Definitions
                    </p>
                  </div>

                  <div className="bg-white border border-[#36343D]/10 rounded-2xl p-6 shadow-sm min-h-[200px]">
                    {nav.currentTopicNotes ? (
                      <div className="prose text-sm font-medium text-[#36343D]/80 leading-relaxed whitespace-pre-wrap">
                        {nav.currentTopicNotes.content}
                      </div>
                    ) : (
                      <div className="text-sm italic text-gray-400 py-4">
                        No written summary content found for this topic. Use the
                        editor to add material!
                      </div>
                    )}
                  </div>
                </div>
              ) : nav.quizMode ? (
                <QuizSessionView
                  currentSubject={nav.currentSubject}
                  currentTopic={nav.currentTopic}
                  questions={nav.currentTopicQuizQuestions}
                  onBack={() => nav.setCurrentTopic(null)}
                  onFinish={handleQuizFinish}
                />
              ) : (
                <StudySessionView
                  currentSubject={nav.currentSubject}
                  currentTopic={nav.currentTopic}
                  filteredCards={nav.filteredCards}
                  currentCardIndex={nav.currentCardIndex}
                  isFlipped={nav.isFlipped}
                  setIsFlipped={nav.setIsFlipped}
                  isSessionFinished={nav.isSessionFinished}
                  onBack={() => nav.setCurrentTopic(null)}
                  onNext={nav.handleNextCard}
                  onPrev={nav.handlePrevCard}
                  onEvaluateCard={nav.handleCardEvaluation}
                  onResetStreaks={nav.handleResetTopicStreaks}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
