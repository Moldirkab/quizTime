export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  theme: string;
  subject: string;
  difficultyStreak?: number;
  isPublic?: boolean;
  ownerId?: string | null;
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
  cardId: number;
  question: string;
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
}