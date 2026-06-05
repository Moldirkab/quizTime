import { useState } from "react";
import type { Flashcard } from "../types";
import { useUser } from "@clerk/clerk-react"; // Imported to capture active session scopes

type Props = {
  addCard: (card: Flashcard) => void;
};

export default function AddFlashcard({ addCard }: Props) {
  const { user } = useUser(); // Pull user identification strings securely
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const allowedSubjects = [
    "coding",
    "french",
    "world history",
    "physics",
    "math",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim() || !theme.trim() || !subject) return;

    // Converted to fully type-compliant parameters mapped cleanly to Flashcard interface
    const newCard: Flashcard = {
      id: Date.now(),
      question: question.trim(),
      answer: answer.trim(),
      theme: theme.trim(),
      subject: subject,
      isPublic: false, // Defaults to private draft status
      ownerId: user?.id || null, // Sets to creator's Clerk user ID (or null for guests)
    };

    addCard(newCard);

    setQuestion("");
    setAnswer("");
    setTheme("");
    setSubject("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full bg-white/40 border border-[#36343D]/10 p-5 rounded-2xl shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#36343D] opacity-80 pl-1">
          Question
        </label>
        <input
          type="text"
          placeholder="Enter Question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#93ABD8] focus:ring-2 focus:ring-[#93ABD8]/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#36343D] opacity-80 pl-1">
          Answer
        </label>
        <input
          type="text"
          placeholder="Enter Answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#93ABD8] focus:ring-2 focus:ring-[#93ABD8]/20"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#36343D] opacity-80 pl-1">
          Choose Subject
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#93ABD8] focus:ring-2 focus:ring-[#93ABD8]/20 appearance-none cursor-pointer"
        >
          <option value="" disabled hidden>
            Choose Subject...
          </option>
          {allowedSubjects.map((sub) => (
            <option key={sub} value={sub} className="capitalize text-[#36343D]">
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold uppercase tracking-wider text-[#36343D] opacity-80 pl-1">
          Topic / Theme
        </label>
        <input
          type="text"
          placeholder="Topic (e.g., WW2, Thermodynamics)"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[#36343D]/15 bg-white text-[#36343D] text-sm outline-none transition-all duration-200 focus:border-[#93ABD8] focus:ring-2 focus:ring-[#93ABD8]/20"
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          className="w-full bg-[#ED7C30] text-white font-bold py-3 px-6 rounded-xl border-none cursor-pointer transition-all duration-200 shadow-md hover:bg-[#dc6a1c] hover:shadow-lg active:scale-[0.99]"
        >
          ⚡ Create Card
        </button>
      </div>
    </form>
  );
}
