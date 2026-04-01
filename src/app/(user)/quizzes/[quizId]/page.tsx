// src/app/(user)/quizzes/[quizId]/page.tsx
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { QuizDetail } from "@/types/quiz";
import QuizSessionClient from "@/components/quizzes/session/QuizSessionClient";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { quizId } = await params;
  try {
    const res = await serverFetch<any>(`/quizzes/${quizId}`);
    const title = res?.data?.title ?? "Quiz";
    return { title: `${title} | WordWise` };
  } catch {
    return { title: "Quiz | WordWise" };
  }
}

async function fetchQuizDetail(quizId: string): Promise<QuizDetail | null> {
  try {
    const res = await serverFetch<any>(`/quizzes/${quizId}`);
    return (res?.data as QuizDetail) ?? null;
  } catch (e) {
    console.error("[QuizDetailPage] fetchQuizDetail error:", e);
    return null;
  }
}

export default async function QuizDetailPage({ params }: PageProps) {
  const { quizId } = await params;
  const quiz = await fetchQuizDetail(quizId);
  if (!quiz) notFound();
  return <QuizSessionClient quiz={quiz} />;
}
