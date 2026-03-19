export interface Word {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  category: string; // Ví dụ: Oxford 3000, IELTS, TOEIC
  status: "new" | "learning" | "mastered"; // Trạng thái học tập
}
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type WordType =
  | "Danh từ"
  | "Động từ"
  | "Tính từ"
  | "Phó từ"
  | "Thành ngữ";

export interface Topic {
  id: string;
  emoji: string;
  name: string;
  count: number;
  progress: number; // 0-100
  color: string;
  isNew?: boolean;
}

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
}

export interface VocabWord {
  id: string;
  en: string;
  phonetic: string;
  type: WordType;
  level: CefrLevel;
  meaning: string;
  example: string;
  topic: string;
  topicColor: string;
  topicBg: string;
  reviewedDaysAgo: number | "today";
  isFav: boolean;
}

export interface OwnWord {
  id: string;
  en: string;
  phonetic: string;
  type: WordType;
  meaning: string;
  note: string;
  addedDate: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const TOPICS: Topic[] = [
  {
    id: "biz",
    emoji: "💼",
    name: "Kinh doanh",
    count: 148,
    progress: 72,
    color: "#6c8fff",
  },
  {
    id: "travel",
    emoji: "🌍",
    name: "Du lịch",
    count: 95,
    progress: 88,
    color: "#10b981",
  },
  {
    id: "food",
    emoji: "🍜",
    name: "Ẩm thực",
    count: 72,
    progress: 55,
    color: "#f59e0b",
  },
  {
    id: "health",
    emoji: "💊",
    name: "Y tế & Sức khỏe",
    count: 110,
    progress: 40,
    color: "#ef4444",
  },
  {
    id: "tech",
    emoji: "💻",
    name: "Công nghệ",
    count: 134,
    progress: 62,
    color: "#8b5cf6",
  },
  {
    id: "art",
    emoji: "🎨",
    name: "Nghệ thuật",
    count: 58,
    progress: 20,
    color: "#ec4899",
    isNew: true,
  },
  {
    id: "edu",
    emoji: "🏫",
    name: "Giáo dục",
    count: 80,
    progress: 30,
    color: "#14b8a6",
    isNew: true,
  },
  {
    id: "sport",
    emoji: "⚽",
    name: "Thể thao",
    count: 64,
    progress: 45,
    color: "#f97316",
  },
  {
    id: "home",
    emoji: "🏠",
    name: "Gia đình & Nhà ở",
    count: 92,
    progress: 78,
    color: "#6366f1",
  },
  {
    id: "env",
    emoji: "🌱",
    name: "Môi trường",
    count: 55,
    progress: 15,
    color: "#84cc16",
    isNew: true,
  },
  {
    id: "news",
    emoji: "📰",
    name: "Tin tức & Báo chí",
    count: 77,
    progress: 50,
    color: "#06b6d4",
  },
  {
    id: "daily",
    emoji: "💬",
    name: "Giao tiếp hàng ngày",
    count: 120,
    progress: 93,
    color: "#d946ef",
  },
];

export const LEVEL_GROUPS: LevelGroup[] = [
  {
    level: "A1",
    nameVi: "Sơ cấp",
    nameEn: "Beginner",
    desc: "Từ vựng cơ bản cho người mới bắt đầu",
    totalWords: 245,
    learnedWords: 238,
    color: "#2e7d32",
    textColor: "#2e7d32",
    bgColor: "#e8f5e9",
    words: [
      { id: "w1", en: "Hello", vi: "Xin chào" },
      { id: "w2", en: "Thank you", vi: "Cảm ơn" },
      { id: "w3", en: "Please", vi: "Làm ơn" },
      { id: "w4", en: "Sorry", vi: "Xin lỗi" },
      { id: "w5", en: "Yes / No", vi: "Có / Không" },
      { id: "w6", en: "Water", vi: "Nước" },
    ],
  },
  {
    level: "A2",
    nameVi: "Sơ trung cấp",
    nameEn: "Elementary",
    desc: "Giao tiếp đơn giản trong cuộc sống",
    totalWords: 312,
    learnedWords: 280,
    color: "#1565c0",
    textColor: "#1565c0",
    bgColor: "#e3f2fd",
    words: [
      { id: "w7", en: "Appointment", vi: "Cuộc hẹn" },
      { id: "w8", en: "Suggest", vi: "Gợi ý", isFav: true },
      { id: "w9", en: "Direction", vi: "Hướng / Chỉ đường" },
      { id: "w10", en: "Schedule", vi: "Lịch trình" },
    ],
  },
  {
    level: "B1",
    nameVi: "Trung cấp",
    nameEn: "Intermediate",
    desc: "Tự tin trong tình huống quen thuộc",
    totalWords: 428,
    learnedWords: 310,
    color: "#f57f17",
    textColor: "#f57f17",
    bgColor: "#fff8e1",
    words: [
      { id: "w11", en: "Negotiate", vi: "Đàm phán" },
      { id: "w12", en: "Consequence", vi: "Hậu quả", isFav: true },
      { id: "w13", en: "Contribute", vi: "Đóng góp" },
      { id: "w14", en: "Establish", vi: "Thành lập" },
      { id: "w15", en: "Influence", vi: "Ảnh hưởng" },
      { id: "w16", en: "Respond", vi: "Phản hồi" },
    ],
  },
  {
    level: "B2",
    nameVi: "Trên trung cấp",
    nameEn: "Upper-Intermediate",
    desc: "Cấp độ hiện tại của bạn 🎯",
    totalWords: 520,
    learnedWords: 245,
    color: "#c62828",
    textColor: "#c62828",
    bgColor: "#fce4ec",
    words: [
      { id: "w17", en: "Eloquent", vi: "Hùng hồn", isFav: true },
      { id: "w18", en: "Feasible", vi: "Khả thi", isFav: true },
      { id: "w19", en: "Ambiguous", vi: "Mơ hồ" },
      { id: "w20", en: "Dilemma", vi: "Tình huống khó xử" },
    ],
  },
  {
    level: "C1",
    nameVi: "Nâng cao",
    nameEn: "Advanced",
    desc: "Sử dụng thành thạo, linh hoạt",
    totalWords: 380,
    learnedWords: 42,
    color: "#6a1b9a",
    textColor: "#6a1b9a",
    bgColor: "#f3e5f5",
    words: [
      { id: "w21", en: "Meticulous", vi: "Tỉ mỉ, cẩn thận" },
      { id: "w22", en: "Proliferate", vi: "Phổ biến nhanh" },
      { id: "w23", en: "Nuanced", vi: "Tinh tế, nhiều sắc thái" },
    ],
  },
  {
    level: "C2",
    nameVi: "Thành thạo",
    nameEn: "Proficiency",
    desc: "Gần như người bản ngữ",
    totalWords: 215,
    learnedWords: 0,
    color: "#00695c",
    textColor: "#00695c",
    bgColor: "#e0f2f1",
    words: [],
    locked: true,
  },
];

export const FAV_WORDS: VocabWord[] = [
  {
    id: "f1",
    en: "Eloquent",
    phonetic: "/ˈeləkwənt/",
    type: "Tính từ",
    level: "B2",
    meaning: "Có khả năng diễn đạt rõ ràng, hùng hồn và thuyết phục.",
    example: "She gave an eloquent speech that moved the entire audience.",
    topic: "💼 Kinh doanh",
    topicColor: "#1565c0",
    topicBg: "#e3f2fd",
    reviewedDaysAgo: 2,
    isFav: true,
  },
  {
    id: "f2",
    en: "Feasible",
    phonetic: "/ˈfiːzɪbl/",
    type: "Tính từ",
    level: "B2",
    meaning: "Có thể thực hiện được; khả thi trong thực tế.",
    example: "Is it feasible to finish the project by Friday?",
    topic: "💼 Kinh doanh",
    topicColor: "#2e7d32",
    topicBg: "#e8f5e9",
    reviewedDaysAgo: "today",
    isFav: true,
  },
  {
    id: "f3",
    en: "Itinerary",
    phonetic: "/aɪˈtɪnəreri/",
    type: "Danh từ",
    level: "B1",
    meaning: "Lịch trình chuyến đi, kế hoạch các địa điểm tham quan.",
    example: "The travel agent sent us a detailed itinerary for the trip.",
    topic: "🌍 Du lịch",
    topicColor: "#1565c0",
    topicBg: "#e3f2fd",
    reviewedDaysAgo: 5,
    isFav: true,
  },
  {
    id: "f4",
    en: "Bandwidth",
    phonetic: "/ˈbændwɪdθ/",
    type: "Danh từ",
    level: "B2",
    meaning: "Băng thông; (nghĩa bóng) năng lực, thời gian để xử lý việc.",
    example: "I don't have the bandwidth to take on another project right now.",
    topic: "💻 Công nghệ",
    topicColor: "#6a1b9a",
    topicBg: "#f3e5f5",
    reviewedDaysAgo: 1,
    isFav: true,
  },
  {
    id: "f5",
    en: "Nonetheless",
    phonetic: "/ˌnʌnðəˈles/",
    type: "Phó từ",
    level: "B2",
    meaning: "Mặc dù vậy; tuy nhiên; dù sao đi nữa.",
    example: "The task was difficult; nonetheless, they succeeded.",
    topic: "💬 Giao tiếp",
    topicColor: "#00695c",
    topicBg: "#e0f2f1",
    reviewedDaysAgo: 3,
    isFav: true,
  },
  {
    id: "f6",
    en: "Meticulous",
    phonetic: "/məˈtɪkjʊləs/",
    type: "Tính từ",
    level: "C1",
    meaning: "Vô cùng cẩn thận, tỉ mỉ trong từng chi tiết nhỏ.",
    example: "She is meticulous about keeping accurate records.",
    topic: "💼 Kinh doanh",
    topicColor: "#2e7d32",
    topicBg: "#e8f5e9",
    reviewedDaysAgo: "today",
    isFav: true,
  },
];

export const OWN_WORDS: OwnWord[] = [
  {
    id: "o1",
    en: "Serendipity",
    phonetic: "/ˌserənˈdɪpɪti/",
    type: "Danh từ",
    meaning:
      "Sự tình cờ may mắn; tìm thấy điều tốt đẹp khi không cố ý tìm kiếm.",
    note: 'Mình gặp từ này khi đọc cuốn "The Alchemist" — rất hay!',
    addedDate: "15/03/2026",
  },
  {
    id: "o2",
    en: "Ephemeral",
    phonetic: "/ɪˈfemərəl/",
    type: "Tính từ",
    meaning: "Tồn tại trong thời gian rất ngắn; phù du, thoáng qua.",
    note: 'Gặp trong bài podcast: "ephemeral content" trên mạng xã hội (story, reels).',
    addedDate: "14/03/2026",
  },
  {
    id: "o3",
    en: "Leverage",
    phonetic: "/ˈlevərɪdʒ/",
    type: "Động từ",
    meaning:
      "Tận dụng; sử dụng (nguồn lực, lợi thế) để đạt được kết quả tốt hơn.",
    note: 'Hay dùng trong kinh doanh: "leverage our strengths" = phát huy thế mạnh.',
    addedDate: "12/03/2026",
  },
  {
    id: "o4",
    en: "Pivotal",
    phonetic: "/ˈpɪvətl/",
    type: "Tính từ",
    meaning: "Cực kỳ quan trọng; mang tính quyết định; then chốt.",
    note: '"a pivotal moment" — thời điểm bước ngoặt. Nghe thấy trong TED Talk.',
    addedDate: "10/03/2026",
  },
  {
    id: "o5",
    en: "Overwhelmed",
    phonetic: "/ˌoʊvərˈwelmd/",
    type: "Tính từ",
    meaning: "Cảm thấy bị áp đảo, quá tải, không biết xử lý thế nào.",
    note: 'Hay nói "I\'m feeling overwhelmed" thay vì "I\'m very stressed".',
    addedDate: "08/03/2026",
  },
];

export const LEVEL_COLORS: Record<CefrLevel, { bg: string; color: string }> = {
  A1: { bg: "#e8f5e9", color: "#2e7d32" },
  A2: { bg: "#e3f2fd", color: "#1565c0" },
  B1: { bg: "#fff8e1", color: "#f57f17" },
  B2: { bg: "#fce4ec", color: "#c62828" },
  C1: { bg: "#f3e5f5", color: "#6a1b9a" },
  C2: { bg: "#e0f2f1", color: "#00695c" },
};
