// src/app/(user)/quizzes/create/page.tsx
// Server Component — admin guard + render create form

import CreateQuizClient from "@/components/quizzes/admin/CreateQuizClient";
import { redirect } from "next/navigation";

export const metadata = { title: "Tạo Quiz | WordWise Admin" };

export default async function CreateQuizPage() {
  // TODO: real admin check
  // const session = await getServerSession(authOptions);
  // if ((session?.user as any)?.role !== "ADMIN") redirect("/quizzes");
  const isAdmin = true;
  if (!isAdmin) redirect("/quizzes");

  return <CreateQuizClient />;
}
