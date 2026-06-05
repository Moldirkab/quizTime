import { useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import TopicsListView from "./components/TopicsListView";
import StudySessionView from "./components/StudySessionView";
import { QuizSessionView } from "./components/QuizSessionView";
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
  const nav = useFlashcardNavigation(INITIAL_DEFAULT_CARDS, {
    recordCardStudied: progress.recordCardStudied,
    recordTopicCompleted: progress.recordTopicCompleted,
  });

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

  const handleQuizFinish = (results: QuizResult[]) => {
    // results are shown inside QuizSessionView summary screen
    // record topic as completed in progress
    if (nav.currentTopic) {
      progress.recordTopicCompleted(nav.currentTopic);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF4CD] text-[#36343D] font-sans antialiased">
      <Navbar
        user={isSignedIn ? displayUser : null}
        isAdmin={false}
        onExploreClick={nav.resetToHome}
        onCreateClick={() => nav.setCurrentView("create-deck")}
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
              onCancel={() => nav.setCurrentView("dashboard")}
              onPublishDeck={(newCards) => {
                const cardsWithIds = newCards.map((card, index) => ({
                  ...card,
                  id: Date.now() + index,
                }));
                nav.setCards((prev) => [...prev, ...cardsWithIds]);
                nav.setDashboardTab("my-decks");
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
                        Publishing makes these card groups public to everyone on
                        the Explore tab.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {nav.availableTopics.map((topicName) => (
                        <button
                          key={topicName}
                          type="button"
                          onClick={() =>
                            nav.handlePublishTopic(
                              nav.currentSubject!,
                              topicName,
                            )
                          }
                          className="px-4 py-2 text-xs font-bold rounded-xl border-none bg-[#36343D] text-[#FAF4CD] shadow-sm hover:bg-[#F3619C] hover:text-white transition-all cursor-pointer"
                        >
                          Publish "{topicName}" 🚀
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <TopicsListView
                  currentSubject={nav.currentSubject}
                  availableTopics={nav.availableTopics}
                  cards={nav.cards}
                  onBack={() => nav.setCurrentSubject(null)}
                  onSelectTopic={nav.handleSelectTopic}
                />
              </div>
            )}

            {nav.currentSubject !== null &&
              nav.currentTopic !== null &&
              (nav.quizMode ? (
                <QuizSessionView
                  currentSubject={nav.currentSubject}
                  currentTopic={nav.currentTopic}
                  topicCards={nav.filteredCards}
                  allSubjectCards={nav.subjectCards}
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
