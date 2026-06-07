import { useNavigate } from "react-router-dom";
import type { QuizQuestion, StudyNotes } from "../types";

interface DashboardViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  displayedSubjects: string[];
  cards: any[];
  quizQuestions: QuizQuestion[];
  studyNotes?: StudyNotes[];
  subjectImages: Record<string, string>;
  currentTab: "explore" | "my-decks";
  setCurrentTab: (tab: "explore" | "my-decks") => void;
}

const CARD_THEMES = [
  {
    bg: "bg-[#93ABD8]",
    title: "text-[#FAF4CD]",
    count: "text-[#FAF4CD]/80",
    button: "bg-[#FAF4CD] text-[#93ABD8] hover:bg-white",
  },
  {
    bg: "bg-[#F3619C]",
    title: "text-[#EDE986]",
    count: "text-[#FAF4CD]/80",
    button: "bg-[#EDE986] text-[#F3619C] hover:bg-white",
  },
  {
    bg: "bg-[#E7BEF8]",
    title: "text-[#FB4645]",
    count: "text-[#36343D]/70",
    button: "bg-[#FB4645] text-white hover:bg-[#e03534]",
  },
  {
    bg: "bg-[#F8EDAD]",
    title: "text-[#ED7C30]",
    count: "text-[#36343D]/70",
    button: "bg-[#ED7C30] text-white hover:bg-[#d96e28]",
  },
  {
    bg: "bg-[#B494F8]",
    title: "text-[#DBFA40]",
    count: "text-[#FAF4CD]/80",
    button: "bg-[#DBFA40] text-[#B494F8] hover:bg-white",
  },
];

export default function DashboardView({
  searchQuery,
  setSearchQuery,
  displayedSubjects,
  cards,
  quizQuestions,
  studyNotes = [],
  subjectImages,
  currentTab,
  setCurrentTab,
}: DashboardViewProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full block animate-[fadeIn_0.2s_ease-out]">
      <h1 className="text-center font-bold mb-4 text-[#36343D] text-2xl md:text-3xl lg:text-4xl">
        {currentTab === "explore" ? "Explore Subjects" : "My Private Drafts"}
      </h1>

      {/* Tab switcher */}
      <div className="flex bg-[#36343D]/5 p-1 rounded-2xl w-full max-w-[400px] mx-auto mb-8 border border-[#36343D]/5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setCurrentTab("explore")}
          className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all border-none cursor-pointer ${
            currentTab === "explore"
              ? "bg-[#36343D] text-[#FAF4CD] shadow-md"
              : "text-[#36343D]/60 hover:text-[#36343D]"
          }`}
        >
          🌐 Explore Public
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab("my-decks")}
          className={`flex-1 py-2.5 text-sm font-extrabold rounded-xl transition-all border-none cursor-pointer ${
            currentTab === "my-decks"
              ? "bg-[#36343D] text-[#FAF4CD] shadow-md"
              : "text-[#36343D]/60 hover:text-[#36343D]"
          }`}
        >
          🔒 Personal
        </button>
      </div>

      {/* Search */}
      <div className="w-full bg-[#93ABD8]/25 border border-[#36343D]/10 p-5 rounded-2xl mb-8">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="search"
            className="text-xs font-bold uppercase tracking-wider text-[#36343D] opacity-80"
          >
            Search Categories
          </label>
          <input
            id="search"
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/20"
            placeholder={
              currentTab === "explore"
                ? "Type to search global subjects..."
                : "Type to search your personal subjects..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {displayedSubjects.length === 0 ? (
        <div className="w-full text-center p-12 bg-white/40 border border-[#36343D]/10 rounded-2xl text-[#36343D] opacity-70 italic shadow-sm backdrop-blur-sm">
          {currentTab === "explore"
            ? "No public subjects found matching your criteria."
            : "No private deck drafts built yet. Click 'Create Deck' above to add yours!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {displayedSubjects.map((subject, index) => {
            const cardTheme = CARD_THEMES[index % CARD_THEMES.length];

            const matchingCards = cards.filter((c) =>
              currentTab === "explore"
                ? c.subject === subject && c.isPublic
                : c.subject === subject && !c.isPublic,
            );

            const matchingQuizzes = quizQuestions.filter((q) =>
              currentTab === "explore"
                ? q.subject === subject && q.isPublic
                : q.subject === subject && !q.isPublic,
            );

            const matchingNotes = studyNotes.filter((n) =>
              currentTab === "explore"
                ? n.subject === subject && n.isPublic
                : n.subject === subject && !n.isPublic,
            );

            const uniqueTopics = Array.from(
              new Set([
                ...matchingCards.map((c) => c.theme),
                ...matchingQuizzes.map((q) => q.theme),
                ...matchingNotes.map((n) => n.theme),
              ]),
            );

            // Fix: Enforce lowercase lookup to line up exactly with your App.tsx keys
            const bgImage =
              subjectImages[subject.toLowerCase()] || subjectImages.Default;

            if (uniqueTopics.length === 0) return null;

            return (
              <div
                key={subject}
                className={`flex flex-col ${cardTheme.bg} border border-black/5 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl group`}
                onClick={() =>
                  navigate(
                    `/subject/${encodeURIComponent(subject.toLowerCase())}`,
                  )
                }
              >
                <div
                  className="w-full h-40 bg-contain bg-center shrink-0 bg-no-repeat mt-4 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="p-5 flex flex-col flex-grow justify-between gap-4">
                  <div>
                    <h3
                      className={`m-0 text-xl font-bold tracking-wide ${cardTheme.title}`}
                    >
                      {subject.toUpperCase()}
                    </h3>
                    <div
                      className={`mt-2 flex flex-col gap-0.5 ${cardTheme.count}`}
                    >
                      <p className="m-0 text-xs font-semibold">
                        {uniqueTopics.length} topic
                        {uniqueTopics.length !== 1 ? "s" : ""}
                        {matchingQuizzes.length > 0 && (
                          <span className="ml-1 opacity-70">· 🧠 quiz</span>
                        )}
                        {matchingNotes.length > 0 && (
                          <span className="ml-1 opacity-70">· 📝 notes</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`w-full border-none py-2.5 rounded-xl font-bold transition-colors duration-200 shrink-0 cursor-pointer ${cardTheme.button}`}
                  >
                    {currentTab === "explore" ? "Study Deck →" : "Review →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
