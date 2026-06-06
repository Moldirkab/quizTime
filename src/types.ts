export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  theme: string;
  subject: string;
  difficultyStreak?: number;
  isPublic?: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
}

export interface StudyNotes {
  id: number;
  subject: string;
  theme: string;
  content: string;
  isPublic?: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
}

export interface DailyGoal {
  type: "cards" | "topics";
  target: number;
}

export interface DailyProgress {
  date: string;
  cardsStudied: number;
  topicsCompleted: string[];
}

export interface QuizResult {
  questionIndex: number;
  question: string;
  correctAnswers: string[];
  selectedAnswers: string[];
  isCorrect: boolean;
}

export interface QuizChoice {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  choices: QuizChoice[];
  subject: string;
  theme: string;
  isPublic?: boolean;
  ownerId?: string | null;
  ownerName?: string | null;
}

export interface EditTarget {
  type: "flashcard" | "quiz" | "notes";
  subject: string;
  theme: string;
}