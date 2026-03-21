// src/services/vocabulary.service.ts
// Tất cả hàm fetch dữ liệu từ backend — dùng trong Server Components

import { serverFetch, ApiResponse, PaginatedData } from "@/lib/api";
import {
  TopicApiItem,
  WordApiItem,
  WordProgressApiItem,
  WordProgressStats,
  FavouriteApiItem,
  UserWordApiItem,
  DashboardStats,
  UserGoalApiItem,
  Topic,
  LevelGroup,
  VocabWord,
  OwnWord,
  MiniWord,
  CefrLevel,
  LEVEL_META,
  LEVEL_COLORS,
  WORD_TYPE_LABEL,
} from "@/types/vocabulary";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDaysAgo(dateStr: string | null): number | "today" {
  if (!dateStr) return "today";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days === 0 ? "today" : days;
}

// ── Topics ────────────────────────────────────────────────────────────────────

export async function fetchTopics(): Promise<Topic[]> {
  try {
    const res = await serverFetch<ApiResponse<PaginatedData<TopicApiItem>>>(
      "/topics?current=1&pageSize=100&onlyActive=true",
    );

    return (
      res.data?.result?.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji ?? "📁",
        count: item.wordCount ?? 0,
        progress: 0, // Tính tiến độ riêng nếu backend hỗ trợ
        color: item.color ?? "#6c8fff",
        isNew: false,
      })) ?? []
    );
  } catch {
    return [];
  }
}

// ── Level Groups ──────────────────────────────────────────────────────────────

export async function fetchLevelGroups(): Promise<LevelGroup[]> {
  const levels: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const results = await Promise.allSettled(
    levels.map((level) =>
      serverFetch<ApiResponse<WordApiItem[]>>(`/words/level/${level}`),
    ),
  );

  // Lấy tiến độ của user cho tất cả từ
  let progressMap = new Map<string, { status: string }>();
  try {
    const progRes = await serverFetch<ApiResponse<PaginatedData<WordProgressApiItem>>>(
      "/word-progress?current=1&pageSize=2000",
    );
    progRes.data?.result?.forEach((p) => {
      if (p.wordId) progressMap.set(p.wordId, { status: p.status });
    });
  } catch {
    // Bỏ qua lỗi, tiếp tục với progressMap rỗng
  }

  return levels.map((level, idx) => {
    const meta = LEVEL_META[level];
    const settled = results[idx];
    const words: WordApiItem[] =
      settled.status === "fulfilled" ? settled.value?.data ?? [] : [];

    const masteredIds = new Set(
      [...progressMap.entries()]
        .filter(([, v]) => v.status === "MASTERED")
        .map(([k]) => k),
    );
    const learnedWords = words.filter((w) => masteredIds.has(w.id)).length;

    const miniWords: MiniWord[] = words.slice(0, 8).map((w) => ({
      id: w.id,
      en: w.en,
      vi: w.meaning,
      wordId: w.id,
    }));

    // C2 locked nếu B2 chưa hoàn thành đủ
    const locked = level === "C2";

    return {
      level,
      ...meta,
      totalWords: words.length,
      learnedWords,
      words: miniWords,
      locked,
    };
  });
}

// ── Favourites ────────────────────────────────────────────────────────────────

export async function fetchFavourites(): Promise<VocabWord[]> {
  try {
    const res = await serverFetch<ApiResponse<PaginatedData<FavouriteApiItem>>>(
      "/favourites?current=1&pageSize=100",
    );

    return (
      res.data?.result
        ?.map((fav): VocabWord | null => {
          const w = fav.word;
          const uw = fav.userWord;

          if (w) {
            const firstTopic = w.wordTopics?.[0]?.topic;
            const topicColor = firstTopic?.color ?? "#1565c0";
            const topicBg = LEVEL_COLORS[w.level as CefrLevel]?.bg ?? "#e3f2fd";
            return {
              id: fav.id,
              favouriteId: fav.id,
              wordId: fav.wordId ?? undefined,
              en: w.en,
              phonetic: w.phonetic ?? "",
              type: WORD_TYPE_LABEL[w.type] ?? w.type,
              level: w.level,
              meaning: w.meaning,
              example: w.example ?? "",
              topic: firstTopic ? `${firstTopic.emoji ?? ""} ${firstTopic.name}`.trim() : "",
              topicColor,
              topicBg,
              reviewedDaysAgo: "today",
              isFav: true,
            };
          }

          if (uw) {
            const lvl = LEVEL_COLORS[uw.level];
            return {
              id: fav.id,
              favouriteId: fav.id,
              userWordId: fav.userWordId ?? undefined,
              en: uw.en,
              phonetic: uw.phonetic ?? "",
              type: WORD_TYPE_LABEL[uw.type] ?? uw.type,
              level: uw.level,
              meaning: uw.meaning,
              example: "",
              topic: "✏️ Từ của tôi",
              topicColor: lvl?.color ?? "#6c8fff",
              topicBg: lvl?.bg ?? "#eeedfe",
              reviewedDaysAgo: "today",
              isFav: true,
            };
          }

          return null;
        })
        .filter((v): v is VocabWord => v !== null) ?? []
    );
  } catch {
    return [];
  }
}

// ── Own Words ─────────────────────────────────────────────────────────────────

export async function fetchUserWords(): Promise<OwnWord[]> {
  try {
    const res = await serverFetch<ApiResponse<PaginatedData<UserWordApiItem>>>(
      "/user-words?current=1&pageSize=100&sort=newest",
    );

    return (
      res.data?.result?.map((w): OwnWord => ({
        id: w.id,
        en: w.en,
        phonetic: w.phonetic ?? "",
        type: WORD_TYPE_LABEL[w.type] ?? w.type,
        meaning: w.meaning,
        note: w.note ?? "",
        addedDate: new Date(w.createdAt).toLocaleDateString("vi-VN"),
        status: w.wordProgress?.status,
      })) ?? []
    );
  } catch {
    return [];
  }
}

// ── Word Progress Stats ───────────────────────────────────────────────────────

export async function fetchProgressStats(): Promise<WordProgressStats | null> {
  try {
    const res = await serverFetch<ApiResponse<WordProgressStats>>(
      "/word-progress/stats",
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardStats | null> {
  try {
    const res = await serverFetch<ApiResponse<DashboardStats>>(
      "/study-sessions/dashboard",
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

// ── Daily Goals ───────────────────────────────────────────────────────────────

export async function fetchTodayGoals(): Promise<UserGoalApiItem[]> {
  try {
    const res = await serverFetch<ApiResponse<UserGoalApiItem[]>>(
      "/user-goals/today",
    );
    return res.data ?? [];
  } catch {
    return [];
  }
}

// ── Fetch all vocabulary page data in parallel ────────────────────────────────

export interface VocabPageData {
  topics: Topic[];
  levelGroups: LevelGroup[];
  favourites: VocabWord[];
  ownWords: OwnWord[];
  progressStats: WordProgressStats | null;
}

export async function fetchVocabPageData(): Promise<VocabPageData> {
  const [topics, levelGroups, favourites, ownWords, progressStats] =
    await Promise.all([
      fetchTopics(),
      fetchLevelGroups(),
      fetchFavourites(),
      fetchUserWords(),
      fetchProgressStats(),
    ]);

  return { topics, levelGroups, favourites, ownWords, progressStats };
}
