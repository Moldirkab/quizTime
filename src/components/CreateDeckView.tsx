import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import type { Flashcard, QuizQuestion, QuizChoice } from "../types";

interface CreateDeckViewProps {
  onPublishDeck: (newCards: Omit<Flashcard, "id">[]) => void;
  onPublishQuiz: (newQuestions: Omit<QuizQuestion, "id">[]) => void;
  onPublishNotes?: (notes: {
    subject: string;
    theme: string;
    content: string;
    ownerId: string | null;
    ownerName: string;
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
  editMode?: {
    type: "flashcard" | "quiz" | "notes";
    subject: string;
    theme: string;
    existingCards?: Flashcard[];
    existingQuestions?: QuizQuestion[];
    existingContent?: string;
  };
  onUpdateDeck?: (
    oldSubject: string,
    oldTheme: string,
    newSubject: string,
    newTheme: string,
    slots: { id?: number; question: string; answer: string }[],
  ) => void;
  onUpdateQuiz?: (
    oldSubject: string,
    oldTheme: string,
    newSubject: string,
    newTheme: string,
    questions: Omit<QuizQuestion, "id">[],
  ) => void;
  onUpdateNotes?: (
    oldSubject: string,
    oldTheme: string,
    newSubject: string,
    newTheme: string,
    content: string,
  ) => void;
}

interface LocalCardItem {
  id?: number;
  question: string;
  answer: string;
}

interface LocalQuizQuestion {
  question: string;
  choices: { text: string; isCorrect: boolean }[];
}

const emptyChoice = () => ({ text: "", isCorrect: false });
const emptyQuizQuestion = (): LocalQuizQuestion => ({
  question: "",
  choices: [emptyChoice(), emptyChoice(), emptyChoice(), emptyChoice()],
});

export default function CreateDeckView({
  onPublishDeck,
  onPublishQuiz,
  onPublishNotes,
  onCancel,
  editMode,
  onUpdateDeck,
  onUpdateQuiz,
  onUpdateNotes,
}: CreateDeckViewProps) {
  const { isSignedIn, user } = useUser();
  const isEditing = !!editMode;

  const [activeTab, setActiveTab] = useState<"flashcard" | "quiz" | "notes">(
    editMode?.type ?? "flashcard",
  );
  const [subject, setSubject] = useState(editMode?.subject ?? "");
  const [theme, setTheme] = useState(editMode?.theme ?? "");
  const [notesContent, setNotesContent] = useState(
    editMode?.existingContent ?? "",
  );

  const [slots, setSlots] = useState<LocalCardItem[]>(() => {
    if (editMode?.existingCards && editMode.existingCards.length > 0) {
      return editMode.existingCards.map((c) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
      }));
    }
    return [
      { question: "", answer: "" },
      { question: "", answer: "" },
    ];
  });

  const [quizQuestions, setQuizQuestions] = useState<LocalQuizQuestion[]>(
    () => {
      if (
        editMode?.existingQuestions &&
        editMode.existingQuestions.length > 0
      ) {
        return editMode.existingQuestions.map((q) => ({
          question: q.question,
          choices:
            q.choices.length === 4
              ? q.choices
              : [
                  ...q.choices,
                  ...Array(4 - q.choices.length)
                    .fill(null)
                    .map(emptyChoice),
                ],
        }));
      }
      return [emptyQuizQuestion()];
    },
  );

  const handleUpdateSlot = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setSlots((prev) =>
      prev.map((slot, idx) =>
        idx === index ? { ...slot, [field]: value } : slot,
      ),
    );
  };

  const handleAddSlot = () =>
    setSlots((prev) => [...prev, { question: "", answer: "" }]);

  const handleRemoveSlot = (index: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateQuizQuestion = (index: number, value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q)),
    );
  };

  const handleUpdateChoice = (
    qIndex: number,
    cIndex: number,
    field: "text" | "isCorrect",
    value: string | boolean,
  ) => {
    setQuizQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newChoices = q.choices.map((c, ci) =>
          ci === cIndex ? { ...c, [field]: value } : c,
        );
        return { ...q, choices: newChoices };
      }),
    );
  };

  const handleAddQuizQuestion = () =>
    setQuizQuestions((prev) => [...prev, emptyQuizQuestion()]);

  const handleRemoveQuizQuestion = (index: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFlashcards = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return alert("Session expired. Please log in.");
    if (!subject || !theme)
      return alert("Please fill in both Subject and Topic.");

    const validSlots = slots.filter(
      (s) => s.question.trim() && s.answer.trim(),
    );
    if (validSlots.length === 0)
      return alert("Please fill out at least one card.");

    if (isEditing && onUpdateDeck) {
      onUpdateDeck(
        editMode!.subject,
        editMode!.theme,
        subject.toLowerCase().trim(),
        theme.trim(),
        validSlots,
      );
    } else {
      const ownerName =
        user?.firstName ||
        user?.username ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "quizTime";
      onPublishDeck(
        validSlots.map((slot) => ({
          question: slot.question,
          answer: slot.answer,
          subject: subject.toLowerCase().trim(),
          theme: theme.trim(),
          isPublic: false,
          ownerId: user?.id || null,
          ownerName,
        })),
      );
    }
  };

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return alert("Session expired. Please log in.");
    if (!subject || !theme)
      return alert("Please fill in both Subject and Topic.");

    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i];
      if (!q.question.trim())
        return alert(`Question ${i + 1} is missing text.`);
      if (q.choices.filter((c) => c.text.trim()).length < 2)
        return alert(`Question ${i + 1} needs at least 2 choices.`);
      if (!q.choices.some((c) => c.isCorrect && c.text.trim()))
        return alert(`Question ${i + 1} needs at least one correct answer.`);
    }

    const formatted = quizQuestions.map((q) => ({
      question: q.question,
      choices: q.choices.filter((c) => c.text.trim()) as QuizChoice[],
      subject: subject.toLowerCase().trim(),
      theme: theme.trim(),
      isPublic: false,
      ownerId: user?.id || null,
      ownerName:
        user?.firstName ||
        user?.username ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "quizTime",
    }));

    if (isEditing && onUpdateQuiz) {
      onUpdateQuiz(
        editMode!.subject,
        editMode!.theme,
        subject.toLowerCase().trim(),
        theme.trim(),
        formatted,
      );
    } else {
      onPublishQuiz(formatted);
    }
  };

  const handleSubmitNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return alert("Session expired. Please log in.");
    if (!subject || !theme)
      return alert("Please fill in both Subject and Topic.");
    if (!notesContent.trim())
      return alert("Please add some content to your Study Notes.");

    if (isEditing && onUpdateNotes) {
      onUpdateNotes(
        editMode!.subject,
        editMode!.theme,
        subject.toLowerCase().trim(),
        theme.trim(),
        notesContent,
      );
    } else if (onPublishNotes) {
      const ownerName =
        user?.firstName ||
        user?.username ||
        user?.emailAddresses?.[0]?.emailAddress ||
        "quizTime";
      onPublishNotes({
        subject: subject.toLowerCase().trim(),
        theme: theme.trim(),
        content: notesContent,
        ownerId: user?.id || null,
        ownerName,
        isPublic: false,
      });
    }
  };

  const CategoryPanel = (
    <div className="w-full bg-white/40 border border-[#36343D]/10 p-5 rounded-2xl shadow-sm backdrop-blur-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[#36343D] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#ED7C30]" /> Deck Categories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deck-subject"
            className="text-xs font-bold text-[#36343D]/80 pl-1"
          >
            Subject Category
          </label>
          <input
            id="deck-subject"
            type="text"
            placeholder="e.g., Coding, French, Biology..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="deck-theme"
            className="text-xs font-bold text-[#36343D]/80 pl-1"
          >
            Topic / Deck Name
          </label>
          <input
            id="deck-theme"
            type="text"
            placeholder="e.g., React Basics, WW2..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/20"
          />
        </div>
      </div>
    </div>
  );

  const getFormId = () => {
    if (activeTab === "quiz") return "quiz-form";
    if (activeTab === "notes") return "notes-form";
    return "flashcard-form";
  };

  return (
    <div className="w-full max-w-[850px] mx-auto animate-[fadeIn_0.25s_ease-out]">
      <div className="sticky top-[60px] z-40 bg-[#FAF4CD] py-4 border-b border-[#36343D]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#36343D] tracking-tight">
            {isEditing
              ? `Edit ${activeTab === "quiz" ? "Quiz" : activeTab === "notes" ? "Notes" : "Deck"}: ${editMode!.theme}`
              : `Create New Private ${activeTab === "quiz" ? "Quiz" : activeTab === "notes" ? "Study Notes" : "Deck"}`}
          </h1>
          <p className="text-xs md:text-sm text-[#36343D]/70 font-medium">
            {isEditing
              ? "Changes save immediately. Subject and topic name can be renamed."
              : "Saves privately. You can publish to Explore whenever you want."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="px-4 py-2 text-sm font-bold rounded-xl border border-[#36343D]/20 bg-white text-[#36343D] transition-all hover:bg-gray-50 active:scale-95"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            form={getFormId()}
            className="px-5 py-2 text-sm font-bold rounded-xl border-none bg-[#36343D] text-[#FAF4CD] shadow-sm transition-all hover:bg-[#F3619C] hover:text-white active:scale-95 cursor-pointer"
          >
            {isEditing
              ? "Save Changes ✓"
              : `Save to "My ${activeTab === "quiz" ? "Quizzes" : activeTab === "notes" ? "Notes" : "Decks"}"`}
          </button>
        </div>
      </div>

      <div className="flex rounded-2xl overflow-hidden border border-[#36343D]/10 mb-6 bg-white/40">
        <button
          type="button"
          onClick={() => !isEditing && setActiveTab("flashcard")}
          className={`flex-1 py-3 text-sm font-bold transition-all border-none cursor-pointer ${activeTab === "flashcard" ? "bg-[#93ABD8] text-[#FAF4CD]" : "bg-transparent text-[#36343D]/50 hover:text-[#36343D]"} ${isEditing ? "cursor-default" : ""}`}
        >
          🃏 Flashcard Deck
        </button>
        <button
          type="button"
          onClick={() => !isEditing && setActiveTab("quiz")}
          className={`flex-1 py-3 text-sm font-bold transition-all border-none cursor-pointer ${activeTab === "quiz" ? "bg-[#F3619C] text-[#EDE986]" : "bg-transparent text-[#36343D]/50 hover:text-[#36343D]"} ${isEditing ? "cursor-default" : ""}`}
        >
          🧠 Quiz
        </button>
        <button
          type="button"
          onClick={() => !isEditing && setActiveTab("notes")}
          className={`flex-1 py-3 text-sm font-bold transition-all border-none cursor-pointer ${activeTab === "notes" ? "bg-[#B494F8] text-[#FAF4CD]" : "bg-transparent text-[#36343D]/50 hover:text-[#36343D]"} ${isEditing ? "cursor-default" : ""}`}
        >
          📝 Study Notes
        </button>
      </div>

      {activeTab === "flashcard" && (
        <form
          id="flashcard-form"
          onSubmit={handleSubmitFlashcards}
          className="flex flex-col gap-6"
        >
          {CategoryPanel}
          <div className="flex flex-col gap-5">
            {slots.map((slot, index) => (
              <div
                key={index}
                className="w-full bg-white border border-[#36343D]/10 rounded-2xl shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]"
              >
                <div className="bg-[#36343D]/5 border-b border-[#36343D]/10 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-[#36343D] rounded-lg">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]">
                      Flashcard Properties
                    </span>
                  </div>
                  {slots.length > 1 && (
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-sm bg-transparent border-none opacity-60 hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer"
                      onClick={() => handleRemoveSlot(index)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 flex flex-col gap-1.5 border-b md:border-b-0 md:border-r border-[#36343D]/10">
                    <label className="text-xs font-bold text-[#36343D]/70 pl-0.5">
                      Front Context (Question)
                    </label>
                    <textarea
                      placeholder="Type question here..."
                      value={slot.question}
                      onChange={(e) =>
                        handleUpdateSlot(index, "question", e.target.value)
                      }
                      rows={3}
                      className="w-full p-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none resize-none transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/10"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-1.5 bg-[#36343D]/[0.01]">
                    <label className="text-xs font-bold text-[#36343D]/70 pl-0.5">
                      Back Context (Answer Key)
                    </label>
                    <textarea
                      placeholder="Type answer here..."
                      value={slot.answer}
                      onChange={(e) =>
                        handleUpdateSlot(index, "answer", e.target.value)
                      }
                      rows={3}
                      className="w-full p-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none resize-none transition-all focus:border-[#9c75f7] focus:ring-2 focus:ring-[#9c75f7]/10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full py-4 border-2 border-dashed border-[#36343D]/20 hover:border-[#93ABD8] rounded-2xl bg-white/40 text-sm font-bold text-[#36343D] flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white active:scale-[0.99]"
            onClick={handleAddSlot}
          >
            <span className="text-lg text-[#ED7C30] font-extrabold">+</span> Add
            New Card Slot
          </button>
        </form>
      )}

      {activeTab === "quiz" && (
        <form
          id="quiz-form"
          onSubmit={handleSubmitQuiz}
          className="flex flex-col gap-6"
        >
          {CategoryPanel}
          <div className="flex flex-col gap-6">
            {quizQuestions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="w-full bg-white border border-[#36343D]/10 rounded-2xl shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]"
              >
                <div className="bg-[#F3619C]/10 border-b border-[#36343D]/10 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-[#F3619C] rounded-lg">
                      {qIndex + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]">
                      Quiz Question
                    </span>
                  </div>
                  {quizQuestions.length > 1 && (
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-sm bg-transparent border-none opacity-60 hover:opacity-100 hover:bg-red-50 transition-all cursor-pointer"
                      onClick={() => handleRemoveQuizQuestion(qIndex)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#36343D]/70">
                      Question Text
                    </label>
                    <textarea
                      placeholder="e.g., Which of the following are React hooks?"
                      value={q.question}
                      onChange={(e) =>
                        handleUpdateQuizQuestion(qIndex, e.target.value)
                      }
                      rows={2}
                      className="w-full p-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none resize-none transition-all focus:border-[#F3619C] focus:ring-2 focus:ring-[#F3619C]/10"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#36343D]/70">
                      Answer Choices{" "}
                      <span className="font-normal opacity-60">
                        — tick all correct answers
                      </span>
                    </label>
                    {q.choices.map((choice, cIndex) => (
                      <div
                        key={cIndex}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${choice.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-[#36343D]/10 bg-[#36343D]/[0.02]"}`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateChoice(
                              qIndex,
                              cIndex,
                              "isCorrect",
                              !choice.isCorrect,
                            )
                          }
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${choice.isCorrect ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-[#36343D]/20 text-transparent"}`}
                        >
                          ✓
                        </button>
                        <span className="text-xs font-bold text-[#36343D]/40 w-4 shrink-0">
                          {["A", "B", "C", "D"][cIndex]}
                        </span>
                        <input
                          type="text"
                          placeholder={`Choice ${["A", "B", "C", "D"][cIndex]}...`}
                          value={choice.text}
                          onChange={(e) =>
                            handleUpdateChoice(
                              qIndex,
                              cIndex,
                              "text",
                              e.target.value,
                            )
                          }
                          className="flex-1 bg-transparent border-none outline-none text-sm text-[#36343D] placeholder:text-[#36343D]/30 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                  {q.choices.some((c) => c.isCorrect && c.text.trim()) && (
                    <p className="text-xs text-emerald-600 font-bold">
                      ✓ Correct:{" "}
                      {q.choices
                        .filter((c) => c.isCorrect && c.text.trim())
                        .map((c) => c.text)
                        .join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="w-full py-4 border-2 border-dashed border-[#36343D]/20 hover:border-[#F3619C] rounded-2xl bg-white/40 text-sm font-bold text-[#36343D] flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white active:scale-[0.99]"
            onClick={handleAddQuizQuestion}
          >
            <span className="text-lg text-[#F3619C] font-extrabold">+</span> Add
            New Question
          </button>
        </form>
      )}

      {activeTab === "notes" && (
        <form
          id="notes-form"
          onSubmit={handleSubmitNotes}
          className="flex flex-col gap-6"
        >
          {CategoryPanel}
          <div className="w-full bg-white border border-[#36343D]/10 rounded-2xl shadow-sm overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#B494F8]/10 border-b border-[#36343D]/10 px-4 py-3 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-[#B494F8] rounded-lg">
                📝
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#36343D]">
                Study Notes Reference Content
              </span>
            </div>
            <div className="p-5 flex flex-col gap-2">
              <label
                htmlFor="notes-textarea"
                className="text-xs font-bold text-[#36343D]/70"
              >
                Summary Sheet Text
              </label>
              <textarea
                id="notes-textarea"
                placeholder="Write down core documentation definitions, review notes, formulas, or general reference summaries here..."
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                rows={16}
                required
                className="w-full p-4 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm font-medium outline-none resize-y leading-relaxed transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/10"
              />
              <p className="text-[11px] font-semibold text-[#36343D]/40 m-0">
                💡 Tip: Use separate paragraphs or bullet layouts to keep text
                highly scannable on the display dashboard view.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
