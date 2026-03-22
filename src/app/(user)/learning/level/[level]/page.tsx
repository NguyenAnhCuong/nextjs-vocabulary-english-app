// src/app/(user)/learning/level/[level]/page.tsx

import { notFound } from "next/navigation";
import { fetchCardsByLevel } from "@/services/flashcard.service";
import { LEVEL_META } from "@/types/vocabulary";
import type { CefrLevel } from "@/types/vocabulary";
import LearnPageClient from "@/components/vocabulary/flashcard/LearnPageClient";

interface PageProps {
  params: Promise<{ level: string }>; // ← Promise
}

const VALID_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default async function LearnLevelPage({ params }: PageProps) {
  const { level: rawLevel } = await params; // ← await
  const level = rawLevel.toUpperCase() as CefrLevel;

  if (!VALID_LEVELS.includes(level as any)) notFound();

  const meta = LEVEL_META[level];
  const cards = await fetchCardsByLevel(level).catch(() => []);

  return (
    <LearnPageClient
      cards={cards}
      source={{
        type: "level",
        level,
        levelName: `${meta.nameVi} — ${meta.nameEn}`,
      }}
    />
  );
}
