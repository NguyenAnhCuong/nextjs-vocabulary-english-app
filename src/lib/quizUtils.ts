// src/lib/quizUtils.ts
import type {
  QuizDetail,
  AnswerMap,
  QuizScore,
  SectionScore,
} from "@/types/quiz";

export const LEVEL_META: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  A1: { bg: "#d1fae5", color: "#065f46", label: "A1 · Beginner" },
  A2: { bg: "#dbeafe", color: "#1e40af", label: "A2 · Elementary" },
  B1: { bg: "#fef9c3", color: "#854d0e", label: "B1 · Intermediate" },
  B2: { bg: "#fce7f3", color: "#9d174d", label: "B2 · Upper-Int" },
  C1: { bg: "#ede9fe", color: "#5b21b6", label: "C1 · Advanced" },
  C2: { bg: "#fee2e2", color: "#991b1b", label: "C2 · Proficiency" },
};

export function computeScore(
  quiz: QuizDetail,
  answers: AnswerMap,
  timeTakenSeconds: number,
): QuizScore {
  let pronCorrect = 0,
    vocabCorrect = 0,
    readingCorrect = 0;

  quiz.pronunciationQuestions.forEach((q) => {
    if (answers[q.id] === q.answer) pronCorrect++;
  });
  quiz.vocabularyQuestions.forEach((q) => {
    if (answers[q.id] === q.answer) vocabCorrect++;
  });
  quiz.readingQuestion.blanks.forEach((b) => {
    if (answers[b.id] === b.answer) readingCorrect++;
  });

  const totalCorrect = pronCorrect + vocabCorrect + readingCorrect;
  const totalQuestions =
    quiz.pronunciationQuestions.length +
    quiz.vocabularyQuestions.length +
    quiz.readingQuestion.blanks.length;

  const percentScore = Math.round((totalCorrect / totalQuestions) * 100);

  const grade =
    percentScore >= 90
      ? "S"
      : percentScore >= 80
        ? "A"
        : percentScore >= 65
          ? "B"
          : percentScore >= 50
            ? "C"
            : "F";

  const gradeLabel =
    grade === "S"
      ? "Xuất sắc 🏆"
      : grade === "A"
        ? "Giỏi 🎉"
        : grade === "B"
          ? "Khá tốt 👍"
          : grade === "C"
            ? "Trung bình 🙂"
            : "Cần cố gắng 💪";

  const sections: SectionScore[] = [
    {
      label: "Phát âm",
      icon: "🔊",
      correct: pronCorrect,
      total: quiz.pronunciationQuestions.length,
    },
    {
      label: "Từ vựng",
      icon: "📖",
      correct: vocabCorrect,
      total: quiz.vocabularyQuestions.length,
    },
    {
      label: "Đọc hiểu",
      icon: "📰",
      correct: readingCorrect,
      total: quiz.readingQuestion.blanks.length,
    },
  ];

  return {
    totalCorrect,
    totalQuestions,
    percentScore,
    grade,
    gradeLabel,
    sections,
    timeTakenSeconds,
  };
}

export function gradeColor(grade: QuizScore["grade"]) {
  return grade === "S"
    ? "#7c3aed"
    : grade === "A"
      ? "#16a34a"
      : grade === "B"
        ? "#2563eb"
        : grade === "C"
          ? "#d97706"
          : "#dc2626";
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export const OPTION_LABELS = ["A", "B", "C", "D"] as const;
