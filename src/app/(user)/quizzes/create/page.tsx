// src/app/(user)/quizzes/create/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.options";
import CreateQuizClient from "@/components/quizzes/admin/CreateQuizClient";

export const metadata = { title: "Tạo Quiz | WordWise Admin" };

export default async function CreateQuizPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  if (!isAdmin) redirect("/quizzes");
  return <CreateQuizClient />;
}
