// src/types/vocabulary.ts

// ── Enums (khớp với Prisma schema) ────────────────────────────────────────────
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type WordType =
  | "NOUN"
  | "VERB"
  | "ADJECTIVE"
  | "ADVERB"
  | "PHRASE"
  | "CONJUNCTION"
  | "PREPOSITION"
  | "PRONOUN";

// Label tiếng Việt hiển thị UI
export const WORD_TYPE_LABEL: Record<WordType, string> = {
  NOUN: "Danh từ",
  VERB: "Động từ",
  ADJECTIVE: "Tính từ",
  ADVERB: "Phó từ",
  PHRASE: "Thành ngữ",
  CONJUNCTION: "Liên từ",
  PREPOSITION: "Giới từ",
  PRONOUN: "Đại từ",
};

export type MemoryStatus = "NEW" | "LEARNING" | "REVIEWING" | "MASTERED";

// ── API Response types ────────────────────────────────────────────────────────

/** GET /topics */
export interface TopicApiItem {
  id: string;
  name: string;
  nameEn: string | null;
  emoji: string | null;
  color: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  wordCount: number; // từ _count.wordTopics
  createdAt: string;
  updatedAt: string;
}

/** GET /words */
export interface WordApiItem {
  id: string;
  en: string;
  phonetic: string | null;
  type: WordType;
  level: CefrLevel;
  meaning: string;
  meaningEn: string | null;
  example: string | null;
  exampleVi: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  isActive: boolean;
  wordTopics: {
    topic: {
      id: string;
      name: string;
      emoji: string | null;
      color: string | null;
    };
  }[];
}

/** GET /word-progress */
export interface WordProgressApiItem {
  id: string;
  userId: string;
  wordId: string | null;
  userWordId: string | null;
  status: MemoryStatus;
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  correctCount: number;
  wrongCount: number;
  lastReviewedAt: string | null;
  word?: Pick<
    WordApiItem,
    "id" | "en" | "meaning" | "level" | "phonetic"
  > | null;
  userWord?: Pick<UserWordApiItem, "id" | "en" | "meaning" | "level"> | null;
}

/** GET /word-progress/stats */
export interface WordProgressStats {
  total: number;
  due: number;
  masteredToday: number;
  NEW: number;
  LEARNING: number;
  REVIEWING: number;
  MASTERED: number;
}

/** GET /favourites */
export interface FavouriteApiItem {
  id: string;
  userId: string;
  wordId: string | null;
  userWordId: string | null;
  createdAt: string;
  word?: {
    id: string;
    en: string;
    phonetic: string | null;
    type: WordType;
    level: CefrLevel;
    meaning: string;
    example: string | null;
    wordTopics: {
      topic: { name: string; emoji: string | null; color: string | null };
    }[];
  } | null;
  userWord?: {
    id: string;
    en: string;
    phonetic: string | null;
    type: WordType;
    level: CefrLevel;
    meaning: string;
    note: string | null;
  } | null;
}

/** GET /user-words */
export interface UserWordApiItem {
  id: string;
  userId: string;
  en: string;
  phonetic: string | null;
  type: WordType;
  level: CefrLevel;
  meaning: string;
  example: string | null;
  note: string | null;
  source: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  wordProgress?: Pick<
    WordProgressApiItem,
    "status" | "nextReviewAt" | "correctCount" | "wrongCount"
  > | null;
}

/** GET /study-sessions/dashboard */
export interface DashboardStats {
  today: {
    durationSecs: number;
    newWordsCount: number;
    reviewCount: number;
    xpEarned: number;
  };
  streak: number;
  week: {
    sessions: {
      studyDate: string;
      durationSecs: number;
      newWordsCount: number;
      reviewCount: number;
      xpEarned: number;
    }[];
    totals: {
      durationSecs: number;
      newWordsCount: number;
      reviewCount: number;
      xpEarned: number;
    };
  };
}

/** GET /user-goals/today */
export interface UserGoalApiItem {
  id: string;
  userId: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  goalDate: string | null;
  createdAt: string;
}

// ── UI types (dùng trong components) ─────────────────────────────────────────

/** Dùng cho TopicTab */
export interface Topic {
  id: string;
  emoji: string;
  name: string;
  count: number;
  progress: number;
  color: string;
  isNew?: boolean;
}

/** Dùng cho LevelTab */
export interface LevelGroup {
  level: CefrLevel;
  nameVi: string;
  nameEn: string;
  desc: string;
  totalWords: number;
  learnedWords: number;
  color: string;
  textColor: string;
  bgColor: string;
  words: MiniWord[];
  locked?: boolean;
}

export interface MiniWord {
  id: string;
  en: string;
  vi: string;
  isFav?: boolean;
  wordId?: string;
}

/** Dùng cho FavouriteTab */
export interface VocabWord {
  id: string;
  en: string;
  phonetic: string;
  type: string;
  level: CefrLevel;
  meaning: string;
  example: string;
  topic: string;
  topicColor: string;
  topicBg: string;
  reviewedDaysAgo: number | "today";
  isFav: boolean;
  favouriteId: string;
  wordId?: string;
  userWordId?: string;
}

/** Dùng cho OwnWordsTab */
export interface OwnWord {
  id: string;
  en: string;
  phonetic: string;
  type: string;
  meaning: string;
  note: string;
  addedDate: string;
  status?: MemoryStatus;
}

export const LEVEL_COLORS: Record<CefrLevel, { bg: string; color: string }> = {
  A1: { bg: "#e8f5e9", color: "#2e7d32" },
  A2: { bg: "#e3f2fd", color: "#1565c0" },
  B1: { bg: "#fff8e1", color: "#f57f17" },
  B2: { bg: "#fce4ec", color: "#c62828" },
  C1: { bg: "#f3e5f5", color: "#6a1b9a" },
  C2: { bg: "#e0f2f1", color: "#00695c" },
};

export const LEVEL_META: Record<
  CefrLevel,
  {
    nameVi: string;
    nameEn: string;
    desc: string;
    color: string;
    textColor: string;
    bgColor: string;
  }
> = {
  A1: {
    nameVi: "Sơ cấp",
    nameEn: "Beginner",
    desc: "Từ vựng cơ bản cho người mới bắt đầu",
    color: "#2e7d32",
    textColor: "#2e7d32",
    bgColor: "#e8f5e9",
  },
  A2: {
    nameVi: "Sơ trung cấp",
    nameEn: "Elementary",
    desc: "Giao tiếp đơn giản trong cuộc sống",
    color: "#1565c0",
    textColor: "#1565c0",
    bgColor: "#e3f2fd",
  },
  B1: {
    nameVi: "Trung cấp",
    nameEn: "Intermediate",
    desc: "Tự tin trong tình huống quen thuộc",
    color: "#f57f17",
    textColor: "#f57f17",
    bgColor: "#fff8e1",
  },
  B2: {
    nameVi: "Trên trung cấp",
    nameEn: "Upper-Intermediate",
    desc: "Cấp độ hiện tại của bạn 🎯",
    color: "#c62828",
    textColor: "#c62828",
    bgColor: "#fce4ec",
  },
  C1: {
    nameVi: "Nâng cao",
    nameEn: "Advanced",
    desc: "Sử dụng thành thạo, linh hoạt",
    color: "#6a1b9a",
    textColor: "#6a1b9a",
    bgColor: "#f3e5f5",
  },
  C2: {
    nameVi: "Thành thạo",
    nameEn: "Proficiency",
    desc: "Gần như người bản ngữ",
    color: "#00695c",
    textColor: "#00695c",
    bgColor: "#e0f2f1",
  },
};
