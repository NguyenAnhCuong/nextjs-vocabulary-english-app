// src/app/page.tsx
import DashBoardPage from "@/components/home/DashBoard";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/auth.options";
import {
  fetchLevelGroups,
  fetchProgressStats,
} from "@/services/vocabulary.service";
import { serverFetch } from "@/lib/api";

export default async function HomePage() {
  const [levelGroups, session, progressStats, dashStats] = await Promise.all([
    fetchLevelGroups(),
    getServerSession(authOptions),
    fetchProgressStats(),
    serverFetch<any>("/study-sessions/dashboard").catch(() => null),
  ]);

  return (
    <DashBoardPage
      levelGroups={levelGroups}
      session={session}
      progressStats={progressStats}
      dashStats={dashStats}
    />
  );
}
