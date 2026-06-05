import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import type { Flashcard } from "../types";

interface CreateDeckViewProps {
  onPublishDeck: (newCards: Omit<Flashcard, "id">[]) => void;
  onCancel: () => void;
}

interface LocalCardItem {
  question: string;
  answer: string;
}

export default function CreateDeckView({
  onPublishDeck,
  onCancel,
}: CreateDeckViewProps) {
  const { isSignedIn, user } = useUser();
  const [subject, setSubject] = useState<string>("");
  const [theme, setTheme] = useState<string>("");

  const [slots, setSlots] = useState<LocalCardItem[]>([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);

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

  const handleAddSlot = () => {
    setSlots((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      alert("Your session has expired. Please log in to create collections.");
      return;
    }

    if (!subject || !theme) {
      alert("Please designate both a Subject Category and a Topic Name.");
      return;
    }

    const validSlots = slots.filter(
      (s) => s.question.trim() && s.answer.trim(),
    );
    if (validSlots.length === 0) {
      alert(
        "Please fill out at least one item containing a valid Question and Answer pair.",
      );
      return;
    }

    // MAPS NEW FIELDS: Built initially as draft cards (isPublic: false) tied to their ownerId
    const formattedCards = validSlots.map((slot) => ({
      question: slot.question,
      answer: slot.answer,
      subject: subject.toLowerCase().trim(),
      theme: theme.trim(),
      isPublic: false,
      ownerId: user?.id || null,
    }));

    onPublishDeck(formattedCards);
  };

  return (
    <div className="w-full max-w-[850px] mx-auto animate-[fadeIn_0.25s_ease-out]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* STICKY CONTROL HEADER */}
        <div className="sticky top-[60px] z-40 bg-[#FAF4CD] py-4 border-b border-[#36343D]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#36343D] tracking-tight">
              Create a New Private Deck
            </h1>
            <p className="text-xs md:text-sm text-[#36343D]/70 font-medium">
              Saves to your private deck area. You can deploy it to public
              Explore loops whenever you want.
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
              className="px-5 py-2 text-sm font-bold rounded-xl border-none bg-[#36343D] text-[#FAF4CD] shadow-sm transition-all hover:bg-[#F3619C] hover:text-white active:scale-95 cursor-pointer"
            >
              Save to "My Decks"
            </button>
          </div>
        </div>

        <div className="w-full bg-white/40 border border-[#36343D]/10 p-5 rounded-2xl shadow-sm backdrop-blur-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#36343D] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ED7C30]"></span> Deck
            Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="deck-subject"
                className="text-xs font-bold text-[#36343D]/80 pl-1"
              >
                Subject Category (Type anything to create brand new subject!)
              </label>
              <input
                id="deck-subject"
                type="text"
                placeholder="e.g., Coding, French, Biology, My Custom Subject..."
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
                placeholder="e.g., React Basics, Geometry, WW2..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/20"
              />
            </div>
          </div>
        </div>

        {/* CARDS LIST LOOP SLOTS */}
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
                    title="Remove this card slot"
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
                    placeholder="Type study evaluation prompt text query here..."
                    value={slot.question}
                    onChange={(e) =>
                      handleUpdateSlot(index, "question", e.target.value)
                    }
                    required
                    rows={3}
                    className="w-full p-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none resize-none transition-all focus:border-[#B494F8] focus:ring-2 focus:ring-[#B494F8]/10"
                  />
                </div>

                <div className="p-4 flex flex-col gap-1.5 bg-[#36343D]/[0.01]">
                  <label className="text-xs font-bold text-[#36343D]/70 pl-0.5">
                    Back Context (Answer Key)
                  </label>
                  <textarea
                    placeholder="Type definitive correct target verification answer response here..."
                    value={slot.answer}
                    onChange={(e) =>
                      handleUpdateSlot(index, "answer", e.target.value)
                    }
                    required
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
    </div>
  );
}
