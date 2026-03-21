// src/hooks/useVocabulary.ts
// Hooks cho các thao tác client-side: toggle ★, submit review, add/delete word

"use client";

import { useState, useCallback } from "react";
import { VocabWord, OwnWord } from "@/types/vocabulary";

const API = (path: string) => `/api/proxy${path}`;

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(API(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${res.status}`);
  }
  return res.json().then((r) => r.data ?? r);
}

// ── Toggle Favourite ──────────────────────────────────────────────────────────
export function useFavourites(initialFavs: VocabWord[]) {
  const [favWords, setFavWords] = useState<VocabWord[]>(initialFavs);
  const [loading, setLoading] = useState<string | null>(null);

  const toggle = useCallback(async (wordId?: string, userWordId?: string) => {
    const id = wordId ?? userWordId ?? "";
    setLoading(id);
    try {
      const result = await apiFetch<{ isFavourite: boolean }>(
        "/favourites/toggle",
        {
          method: "POST",
          body: JSON.stringify(wordId ? { wordId } : { userWordId }),
        },
      );

      if (!result.isFavourite) {
        // Xoá khỏi danh sách
        setFavWords((prev) =>
          prev.filter(
            (w) => w.wordId !== wordId && w.userWordId !== userWordId,
          ),
        );
      }
    } catch (err) {
      console.error("Toggle favourite failed:", err);
    } finally {
      setLoading(null);
    }
  }, []);

  return { favWords, toggle, loading };
}

// ── SM-2 Review ───────────────────────────────────────────────────────────────
export function useWordReview() {
  const [submitting, setSubmitting] = useState(false);

  const submitReview = useCallback(
    async (
      quality: 0 | 1 | 2 | 3 | 4 | 5,
      wordId?: string,
      userWordId?: string,
    ) => {
      setSubmitting(true);
      try {
        return await apiFetch("/word-progress/review", {
          method: "POST",
          body: JSON.stringify({ quality, wordId, userWordId }),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitReview, submitting };
}

// ── Star (Favourite) toggle in LevelTab ──────────────────────────────────────
export function useFavStar(initialFavIds: Set<string>) {
  const [favIds, setFavIds] = useState<Set<string>>(initialFavIds);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const toggle = useCallback(async (wordId: string) => {
    // Optimistic update
    setFavIds((prev) => {
      const next = new Set(prev);
      next.has(wordId) ? next.delete(wordId) : next.add(wordId);
      return next;
    });
    setPendingId(wordId);

    try {
      await apiFetch("/favourites/toggle", {
        method: "POST",
        body: JSON.stringify({ wordId }),
      });
    } catch {
      // Revert on error
      setFavIds((prev) => {
        const next = new Set(prev);
        next.has(wordId) ? next.delete(wordId) : next.add(wordId);
        return next;
      });
    } finally {
      setPendingId(null);
    }
  }, []);

  return { favIds, toggle, pendingId };
}

// ── Own Words CRUD ────────────────────────────────────────────────────────────
export function useOwnWords(
  initialWords: OwnWord[],
  // callback tuỳ chọn — gọi sau khi addWord thành công, dùng để sync stats ở component cha
  onWordAdded?: () => void,
  onWordDeleted?: () => void,
) {
  const [words, setWords] = useState<OwnWord[]>(initialWords);
  const [saving, setSaving] = useState(false);

  const addWord = useCallback(
    async (dto: {
      en: string;
      phonetic?: string;
      type?: string;
      level?: string;
      meaning: string;
      example?: string;
      note?: string;
      source?: string;
    }) => {
      setSaving(true);
      try {
        const created = await apiFetch<any>("/user-words", {
          method: "POST",
          body: JSON.stringify(dto),
        });
        const newWord: OwnWord = {
          id: created.id,
          en: created.en,
          phonetic: created.phonetic ?? "",
          type: created.type,
          meaning: created.meaning,
          note: created.note ?? "",
          addedDate: new Date(created.createdAt).toLocaleDateString("vi-VN"),
          status: "NEW",
        };
        setWords((prev) => [newWord, ...prev]);
        // Thông báo cho component cha biết đã thêm từ thành công
        onWordAdded?.();
        return newWord;
      } finally {
        setSaving(false);
      }
    },
    [onWordAdded],
  );

  const deleteWord = useCallback(
    async (id: string) => {
      // Optimistic
      setWords((prev) => prev.filter((w) => w.id !== id));
      try {
        await apiFetch(`/user-words/${id}`, { method: "DELETE" });
        await new Promise((resolve) => setTimeout(resolve, 300));
        onWordDeleted?.();
      } catch {
        // Không rollback vì server cũng có thể đã xoá
      }
    },
    [onWordDeleted],
  );

  const updateWord = useCallback(async (id: string, dto: Partial<OwnWord>) => {
    try {
      const updated = await apiFetch<any>(`/user-words/${id}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      });
      setWords((prev) =>
        prev.map((w) =>
          w.id === id
            ? {
                ...w,
                ...dto,
                addedDate: new Date(updated.updatedAt).toLocaleDateString(
                  "vi-VN",
                ),
              }
            : w,
        ),
      );
    } catch (err) {
      throw err;
    }
  }, []);

  return { words, addWord, deleteWord, updateWord, saving };
}

// ── Study Session Tracker ─────────────────────────────────────────────────────
export function useStudySession() {
  const recordActivity = useCallback(
    async (data: {
      durationSecs?: number;
      newWordsCount?: number;
      reviewCount?: number;
      xpEarned?: number;
    }) => {
      try {
        await apiFetch("/study-sessions/today", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        // Silent fail - không block user experience
      }
    },
    [],
  );

  return { recordActivity };
}

// ── Goal Tracker ──────────────────────────────────────────────────────────────
export function useGoalTracker() {
  const increment = useCallback(
    async (goalType: string, amount: number = 1) => {
      try {
        await apiFetch("/user-goals/increment", {
          method: "POST",
          body: JSON.stringify({ goalType, amount }),
        });
      } catch {
        // Silent fail
      }
    },
    [],
  );

  return { increment };
}
