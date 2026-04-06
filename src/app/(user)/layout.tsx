import HomeShell from "@/components/home/HomeShell";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.options";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }
  return <HomeShell>{children}</HomeShell>;
}
