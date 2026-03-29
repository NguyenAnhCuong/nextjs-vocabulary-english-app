// src/types/quiz.ts

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type QuestionType = "pronunciation" | "vocabulary" | "reading_blank";

// ── Quiz list ──────────────────────────────────────────────────────────────────
export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  level: CefrLevel;
  durationMinutes: number;
  totalQuestions: number;
  attemptCount: number;
  avgScore: number | null; // null = chưa có lượt làm
  tags: string[];
  createdAt: string; // ISO date string
  isPublished: boolean;
}

// ── Questions ──────────────────────────────────────────────────────────────────

/** Câu phát âm: chọn từ phát âm KHÁC với các từ còn lại */
export interface PronunciationQuestion {
  id: string;
  type: "pronunciation";
  order: number;
  question: string; // "Từ nào có cách phát âm KHÁC với các từ còn lại?"
  options: string[]; // 4 từ
  answer: string; // từ phát âm khác
  explanation: string;
  phonetics?: string[]; // IPA tương ứng (optional)
}

/** Câu từ vựng: MCQ 4 đáp án */
export interface VocabularyQuestion {
  id: string;
  type: "vocabulary";
  order: number;
  question: string;
  options: string[]; // 4 đáp án
  answer: string;
  explanation: string;
}

/** Chỗ trống trong bài đọc */
export interface ReadingBlank {
  id: string; // "b1", "b2", ...
  label: string; // "BLANK1"
  options: string[]; // 4 lựa chọn
  answer: string;
}

/** Câu đọc hiểu: 1 đoạn văn + nhiều chỗ trống */
export interface ReadingQuestion {
  id: string;
  type: "reading_blank";
  order: number;
  title: string; // "Bài đọc: AI in Education"
  passage: string; // văn bản có [BLANK1], [BLANK2]...
  blanks: ReadingBlank[];
}

export type AnyQuestion =
  | PronunciationQuestion
  | VocabularyQuestion
  | ReadingQuestion;

// ── Full quiz detail ───────────────────────────────────────────────────────────
export interface QuizDetail {
  id: string;
  title: string;
  description: string;
  level: CefrLevel;
  durationMinutes: number;
  totalQuestions: number;
  tags: string[];
  pronunciationQuestions: PronunciationQuestion[]; // luôn 5 câu
  vocabularyQuestions: VocabularyQuestion[]; // 1-15 câu
  readingQuestion: ReadingQuestion; // luôn 1 bài
}

// ── User answers ───────────────────────────────────────────────────────────────
/** Map: questionId hoặc blankId → giá trị chọn */
export type AnswerMap = Record<string, string>;

// ── Quiz result / score ────────────────────────────────────────────────────────
export interface SectionScore {
  label: string;
  icon: string;
  correct: number;
  total: number;
}

export interface QuizScore {
  totalCorrect: number;
  totalQuestions: number;
  percentScore: number;
  grade: "S" | "A" | "B" | "C" | "F";
  gradeLabel: string;
  sections: SectionScore[];
  timeTakenSeconds: number;
}

// ── Attempt (submitted quiz) ───────────────────────────────────────────────────
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: AnswerMap;
  score: QuizScore;
  submittedAt: string;
}

// ── Create / Edit DTO ─────────────────────────────────────────────────────────
export interface CreateQuizDto {
  title: string;
  description: string;
  level: CefrLevel;
  durationMinutes: number;
  tags: string[];
  pronunciationQuestions: Omit<PronunciationQuestion, "id">[];
  vocabularyQuestions: Omit<VocabularyQuestion, "id">[];
  readingQuestion: Omit<ReadingQuestion, "id">;
}
