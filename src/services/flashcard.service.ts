// src/services/flashcard.service.ts
// Fetch words cho flashcard session theo topic hoặc level

import { serverFetch, ApiResponse, PaginatedData } from "@/lib/api";
import type { FlashCard } from "@/types/flashcard.types";
import type { WordApiItem, CefrLevel } from "@/types/vocabulary";
import { WORD_TYPE_LABEL as WTL } from "@/types/vocabulary";

interface FavouriteApiItem {
  wordId: string | null;
  userWordId: string | null;
}

interface ProgressApiItem {
  wordId: string | null;
  userWordId: string | null;
  status: string;
}

// ── Lấy cards theo Topic ───────────────────────────────────────────────────────
export async function fetchCardsByTopic(topicId: string): Promise<FlashCard[]> {
  // Lấy tất cả từ của topic (tối đa 200)
  const [wordsRes, favsRes, progressRes] = await Promise.allSettled([
    serverFetch<ApiResponse<PaginatedData<WordApiItem>>>(
      `/words?topicId=${topicId}&current=1&pageSize=200`,
    ),
    serverFetch<ApiResponse<PaginatedData<FavouriteApiItem>>>(
      "/favourites?current=1&pageSize=2000",
    ),
    serverFetch<ApiResponse<PaginatedData<ProgressApiItem>>>(
      "/word-progress?current=1&pageSize=2000",
    ),
  ]);

  const words =
    wordsRes.status === "fulfilled" ? (wordsRes.value?.data?.result ?? []) : [];
  const favWordIds = new Set(
    favsRes.status === "fulfilled"
      ? favsRes.value?.data?.result?.map((f) => f.wordId).filter(Boolean)
      : [],
  );
  const progressMap = new Map(
    progressRes.status === "fulfilled"
      ? progressRes.value?.data?.result?.map((p) => [p.wordId, p.status])
      : [],
  );

  return words.map(
    (w): FlashCard => ({
      id: w.id,
      kind: "word",
      en: w.en,
      phonetic: w.phonetic ?? "",
      type: w.type,
      typeLabel: WTL[w.type] ?? w.type,
      level: w.level,
      meaning: w.meaning,
      meaningEn: w.meaningEn ?? undefined,
      example: w.example ?? undefined,
      exampleVi: w.exampleVi ?? undefined,
      audioUrl: w.audioUrl ?? undefined,
      imageUrl: w.imageUrl ?? undefined,
      topicName: w.wordTopics?.[0]?.topic?.name,
      topicColor: w.wordTopics?.[0]?.topic?.color ?? undefined,
      isFav: favWordIds.has(w.id),
      progressStatus:
        (progressMap.get(w.id) as FlashCard["progressStatus"]) ?? "NEW",
    }),
  );
}

// ── Lấy cards theo Level ───────────────────────────────────────────────────────
export async function fetchCardsByLevel(
  level: CefrLevel,
): Promise<FlashCard[]> {
  const [wordsRes, favsRes, progressRes] = await Promise.allSettled([
    serverFetch<ApiResponse<WordApiItem[]>>(`/words/level/${level}`),
    serverFetch<ApiResponse<PaginatedData<FavouriteApiItem>>>(
      "/favourites?current=1&pageSize=2000",
    ),
    serverFetch<ApiResponse<PaginatedData<ProgressApiItem>>>(
      "/word-progress?current=1&pageSize=2000",
    ),
  ]);

  const words =
    wordsRes.status === "fulfilled" ? (wordsRes.value?.data ?? []) : [];
  const favWordIds = new Set(
    favsRes.status === "fulfilled"
      ? favsRes.value?.data?.result?.map((f) => f.wordId).filter(Boolean)
      : [],
  );
  const progressMap = new Map(
    progressRes.status === "fulfilled"
      ? progressRes.value?.data?.result?.map((p) => [p.wordId, p.status])
      : [],
  );

  return words.map(
    (w): FlashCard => ({
      id: w.id,
      kind: "word",
      en: w.en,
      phonetic: w.phonetic ?? "",
      type: w.type,
      typeLabel: WTL[w.type] ?? w.type,
      level: w.level,
      meaning: w.meaning,
      meaningEn: w.meaningEn ?? undefined,
      example: w.example ?? undefined,
      exampleVi: w.exampleVi ?? undefined,
      audioUrl: w.audioUrl ?? undefined,
      imageUrl: w.imageUrl ?? undefined,
      isFav: favWordIds.has(w.id),
      progressStatus:
        (progressMap.get(w.id) as FlashCard["progressStatus"]) ?? "NEW",
    }),
  );
}
