// src/types/flashcard.ts

import type { CefrLevel, WordType } from "./vocabulary";

// ── Card data ──────────────────────────────────────────────────────────────────
export interface FlashCard {
  id: string;           // wordId hoặc userWordId
  kind: "word" | "userWord";
  en: string;
  phonetic: string;
  type: WordType | string;
  typeLabel: string;    // "Danh từ", "Động từ"…
  level: CefrLevel;
  meaning: string;
  meaningEn?: string;
  example?: string;
  exampleVi?: string;
  audioUrl?: string;
  imageUrl?: string;
  topicName?: string;
  topicColor?: string;
  isFav: boolean;
  // tiến độ hiện tại (từ WordProgress)
  progressStatus?: "NEW" | "LEARNING" | "REVIEWING" | "MASTERED";
  progressId?: string;
}

// ── Session context ────────────────────────────────────────────────────────────
export type SessionSource =
  | { type: "topic"; topicId: string; topicName: string; color: string; emoji: string }
  | { type: "level"; level: CefrLevel; levelName: string };

// ── Saved progress (localStorage) ─────────────────────────────────────────────
export interface SavedSessionProgress {
  source: SessionSource;
  currentIndex: number;   // index của card đang xem
  totalCards: number;
  reviewedIds: string[];  // các wordId đã review
  savedAt: string;        // ISO timestamp
}

// ── localStorage key ──────────────────────────────────────────────────────────
export function getSessionKey(source: SessionSource): string {
  if (source.type === "topic") return `flashcard_progress_topic_${source.topicId}`;
  return `flashcard_progress_level_${source.level}`;
}

export function saveSessionProgress(
  source: SessionSource,
  currentIndex: number,
  totalCards: number,
  reviewedIds: string[],
) {
  if (typeof window === "undefined") return;
  const key = getSessionKey(source);
  const data: SavedSessionProgress = {
    source,
    currentIndex,
    totalCards,
    reviewedIds,
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // localStorage full — ignore
  }
}

export function loadSessionProgress(source: SessionSource): SavedSessionProgress | null {
  if (typeof window === "undefined") return null;
  const key = getSessionKey(source);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSessionProgress;
    // Expired nếu > 7 ngày
    const savedAt = new Date(parsed.savedAt).getTime();
    if (Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSessionProgress(source: SessionSource) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getSessionKey(source));
}
