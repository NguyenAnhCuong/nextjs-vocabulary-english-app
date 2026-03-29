// src/app/(user)/quizzes/page.tsx
// Server Component — fetch quiz list, check role, pass to client

import { authOptions } from "@/app/api/auth/auth.options";
import QuizListClient from "@/components/quizzes/list/QuizListClient";
import { MOCK_QUIZ_SUMMARIES } from "@/data/mockQuizzes";
import { Box } from "@mui/material";
import { getServerSession } from "next-auth";

// TODO: Replace with real session check
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/auth.options";

export const metadata = {
  title: "Câu đố | WordWise",
  description: "Kiểm tra kiến thức từ vựng với các bài quiz phong phú",
};

export default async function QuizzesPage() {
  // TODO: replace with real API call
  const [session] = await Promise.all([getServerSession(authOptions)]);

  const quizzes = MOCK_QUIZ_SUMMARIES;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <QuizListClient quizzes={quizzes} isAdmin={isAdmin} />
    </Box>
  );
}
