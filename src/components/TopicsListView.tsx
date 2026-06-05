import { useState } from "react";
import type { Flashcard } from "../types";

interface TopicsListViewProps {
  currentSubject: string;
  availableTopics: string[];
  cards: Flashcard[];
  onBack: () => void;
  onSelectTopic: (topic: string, mode: "flashcard" | "quiz") => void;
}

export default function TopicsListView({
  currentSubject,
  availableTopics,
  cards,
  onBack,
  onSelectTopic,
}: TopicsListViewProps) {
  const [topicModes, setTopicModes] = useState<
    Record<string, "flashcard" | "quiz">
  >({});

  const getMode = (topic: string): "flashcard" | "quiz" =>
    topicModes[topic] ?? "flashcard";

  const toggleMode = (topic: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopicModes((prev) => ({
      ...prev,
      [topic]: prev[topic] === "quiz" ? "flashcard" : "quiz",
    }));
  };

  return (
    <div className="w-full max-w-[850px] mx-auto flex flex-col gap-6 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-col gap-2 border-b border-[#36343D]/10 pb-4">
        <button
          className="self-start text-sm font-bold bg-transparent text-[#36343D] opacity-70 hover:opacity-100 transition-all border-none cursor-pointer"
          onClick={onBack}
        >
          ← Back to Subjects
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#36343D] tracking-tight capitalize m-0">
          {currentSubject} Topics
        </h1>
      </div>

      {availableTopics.length > 0 ? (
        <div className="flex flex-col gap-3.5 w-full">
          {availableTopics.map((topic) => {
            const topicCardCount = cards.filter(
              (c) => c.subject === currentSubject && c.theme === topic,
            ).length;
            const mode = getMode(topic);

            return (
              <div
                key={topic}
                className="w-full bg-white border border-[#36343D]/10 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md hover:border-[#93ABD8]"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="m-0 text-lg font-bold text-[#36343D] tracking-tight">
                    {topic}
                  </h3>
                  <span className="text-xs font-semibold text-[#ED7C30] bg-[#ED7C30]/10 px-2.5 py-1 rounded-md self-start">
                    {topicCardCount} flashcards ready
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  {/* Mode toggle switch */}
                  <div
                    className="flex items-center rounded-xl overflow-hidden border border-[#36343D]/10 shrink-0 cursor-pointer"
                    onClick={(e) => toggleMode(topic, e)}
                  >
                    <span
                      className={`px-3 py-2 text-xs font-bold transition-all duration-200 select-none
                        ${
                          mode === "flashcard"
                            ? "bg-[#93ABD8] text-[#FAF4CD]"
                            : "bg-white text-[#36343D]/40"
                        }`}
                    >
                      🃏 Flashcard
                    </span>
                    <span
                      className={`px-3 py-2 text-xs font-bold transition-all duration-200 select-none
                        ${
                          mode === "quiz"
                            ? "bg-[#F3619C] text-[#EDE986]"
                            : "bg-white text-[#36343D]/40"
                        }`}
                    >
                      🧠 Quiz
                    </span>
                  </div>

                  {/* Start button */}
                  <button
                    type="button"
                    className={`w-full sm:w-auto font-bold text-sm px-5 py-2.5 rounded-xl border-none cursor-pointer transition-all shrink-0 text-center
                      ${
                        mode === "quiz"
                          ? "bg-[#F3619C] text-[#EDE986] hover:bg-[#B494F8] hover:text-[#DBFA40]"
                          : "bg-[#36343D] text-[#FAF4CD] hover:bg-[#F3619C] hover:text-white"
                      }`}
                    onClick={() => onSelectTopic(topic, mode)}
                  >
                    {mode === "quiz" ? "Start Quiz 🧠" : "Study Deck ⚡"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full text-center py-12 bg-white/40 border-2 border-dashed border-[#36343D]/10 rounded-2xl text-[#36343D] opacity-60 italic text-sm">
          No topics built inside this category yet.
        </div>
      )}
    </div>
  );
}
