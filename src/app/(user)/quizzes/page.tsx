// src/app/(user)/quizzes/page.tsx
import { Box } from "@mui/material";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.options";
import { serverFetch } from "@/lib/api";
import type { QuizSummary } from "@/types/quiz";
import QuizListClient from "@/components/quizzes/list/QuizListClient";

export const metadata = {
  title: "Câu đố | WordWise",
  description: "Kiểm tra kiến thức từ vựng với các bài quiz phong phú",
};

async function fetchQuizzes(): Promise<QuizSummary[]> {
  try {
    const res = await serverFetch<any>(
      "/quizzes?current=1&pageSize=100&isPublished=true",
    );
    return res?.data?.result ?? [];
  } catch (e) {
    console.error("[QuizzesPage] fetchQuizzes error:", e);
    return [];
  }
}

export default async function QuizzesPage() {
  const [quizzes, session] = await Promise.all([
    fetchQuizzes(),
    getServerSession(authOptions),
  ]);

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isLoggedIn = !!session?.user;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <QuizListClient
        quizzes={quizzes}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
      />
    </Box>
  );
}
