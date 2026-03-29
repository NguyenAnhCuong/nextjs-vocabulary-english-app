// src/app/(user)/quizzes/[quizId]/page.tsx
// Server Component — fetch quiz detail, render session client

import { notFound } from "next/navigation";

import type { QuizDetail } from "@/types/quiz";
import { MOCK_QUIZ_DETAIL, MOCK_QUIZ_SUMMARIES } from "@/data/mockQuizzes";
import QuizSessionClient from "@/components/quizzes/session/QuizSessionClient";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

// Generate static params for known quizzes (optional, for SSG)
export async function generateStaticParams() {
  return MOCK_QUIZ_SUMMARIES.map((q) => ({ quizId: q.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { quizId } = await params;
  const quiz = MOCK_QUIZ_SUMMARIES.find((q) => q.id === quizId);
  return {
    title: quiz ? `${quiz.title} | WordWise Quiz` : "Quiz | WordWise",
  };
}

async function fetchQuizDetail(quizId: string): Promise<QuizDetail | null> {
  // TODO: replace with real API call
  // return serverFetch<ApiResponse<QuizDetail>>(`/quizzes/${quizId}`).then(r => r.data).catch(() => null);
  if (quizId === "q1") return MOCK_QUIZ_DETAIL;

  // For other quizzes, generate mock data based on q1 template
  const summary = MOCK_QUIZ_SUMMARIES.find((q) => q.id === quizId);
  if (!summary) return null;
  return {
    ...MOCK_QUIZ_DETAIL,
    id: quizId,
    title: summary.title,
    level: summary.level,
  };
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { quizId } = await params;
  const quiz = await fetchQuizDetail(quizId);

  if (!quiz) notFound();

  return <QuizSessionClient quiz={quiz} />;
}
