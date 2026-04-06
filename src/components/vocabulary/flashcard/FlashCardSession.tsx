"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  LinearProgress,
  Button,
  Tooltip,
  Fade,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import type { FlashCard, SessionSource } from "@/types/flashcard";
import { saveSessionProgress, clearSessionProgress } from "@/types/flashcard";
import FlashCardView from "./FlashCardView";
import QualityButtons from "./QualityButtons";
import { LEVEL_COLORS } from "@/types/vocabulary";

const API = (path: string) => `/api/proxy${path}`;

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(API(path), {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json().then((r) => r.data ?? r);
}

interface FlashCardSessionProps {
  cards: FlashCard[];
  source: SessionSource;
  initialIndex?: number;
  onExit: () => void;
  onSessionComplete?: () => void;
}

export default function FlashCardSession({
  cards: initialCards,
  source,
  initialIndex = 0,
  onExit,
  onSessionComplete,
}: FlashCardSessionProps) {
  const [cards, setCards] = useState<FlashCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [rating, setRating] = useState<boolean>(false); // loading state
  const [sessionDone, setSessionDone] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  const card = cards[currentIndex];
  const total = cards.length;
  const progress = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  const accentColor =
    source.type === "topic"
      ? source.color
      : (LEVEL_COLORS[source.level]?.color ?? "#6c8fff");

  // ── Auto-save progress khi currentIndex thay đổi ──────────────────────────
  useEffect(() => {
    if (total === 0) return;
    saveSessionProgress(source, currentIndex, total, [...reviewedIds]);
  }, [currentIndex, source, total, reviewedIds]);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "l") goNext();
      if (e.key === "ArrowLeft" || e.key === "h") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, total]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setSessionDone(true);
      // Gọi callback để refresh progress ở VocabularyPage
      onSessionComplete?.();
    }
  }, [currentIndex, total, onSessionComplete]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // ── Start learning this word (tạo WordProgress nếu chưa có) ───────────────
  useEffect(() => {
    if (!card || card.kind !== "word") return;
    apiFetch("/word-progress/start", {
      method: "POST",
      body: JSON.stringify({ wordId: card.id }),
    }).catch(() => {}); // silent — không chặn UI
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id]);

  // ── SM-2 Rating ────────────────────────────────────────────────────────────
  const handleRate = useCallback(
    async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
      if (!card) return;
      setRating(true);
      try {
        await apiFetch("/word-progress/review", {
          method: "POST",
          body: JSON.stringify(
            card.kind === "word"
              ? { wordId: card.id, quality }
              : { userWordId: card.id, quality },
          ),
        });
        setReviewedIds((prev) => new Set([...prev, card.id]));
        // Cập nhật status trên card
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, progressStatus: quality >= 3 ? "LEARNING" : "NEW" }
              : c,
          ),
        );
      } catch {
        // silent
      } finally {
        setRating(false);
        goNext();
      }
    },
    [card, goNext],
  );

  // ── Favourite toggle ────────────────────────────────────────────────────────
  const handleFavToggle = useCallback(
    async (cardId: string, kind: "word" | "userWord", isFav: boolean) => {
      // Optimistic
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFav: !isFav } : c)),
      );
      try {
        await apiFetch("/favourites/toggle", {
          method: "POST",
          body: JSON.stringify(
            kind === "word" ? { wordId: cardId } : { userWordId: cardId },
          ),
        });
      } catch {
        // Revert
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, isFav } : c)),
        );
      }
    },
    [],
  );

  // ── Shuffle ────────────────────────────────────────────────────────────────
  const handleShuffle = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  };

  // ── Exit: lưu progress rồi về ─────────────────────────────────────────────
  const handleExit = () => {
    saveSessionProgress(source, currentIndex, total, [...reviewedIds]);
    onExit();
  };

  // ── Session complete ───────────────────────────────────────────────────────
  if (sessionDone) {
    return (
      <SessionComplete
        source={source}
        total={total}
        accentColor={accentColor}
        onRestart={() => {
          clearSessionProgress(source);
          setCurrentIndex(0);
          setReviewedIds(new Set());
          setSessionDone(false);
          setIsFlipped(false);
        }}
        onExit={onExit}
      />
    );
  }

  if (!card) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: 2,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Thoát và lưu tiến độ">
          <IconButton size="small" onClick={handleExit}>
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Tooltip>

        <Box flex={1}>
          <Typography fontWeight={600} fontSize="14px" noWrap>
            {source.type === "topic"
              ? `${source.emoji} ${source.topicName}`
              : `${source.level} — ${source.levelName}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentIndex + 1} / {total} thẻ · {reviewedIds.size}
          </Typography>
        </Box>

        <Tooltip title={shuffled ? "Đã trộn bài" : "Trộn ngẫu nhiên"}>
          <IconButton
            size="small"
            onClick={handleShuffle}
            sx={{ color: shuffled ? accentColor : "text.disabled" }}
          >
            <ShuffleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* ── Progress bar ───────────────────────────────────── */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          bgcolor: "rgba(0,0,0,0.06)",
          flexShrink: 0,
          "& .MuiLinearProgress-bar": { bgcolor: accentColor },
        }}
      />

      {/* ── Main content ───────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 8 },
          py: 3,
          gap: 3,
        }}
      >
        {/* Card */}
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <FlashCardView
            card={card}
            index={currentIndex}
            total={total}
            onFavToggle={handleFavToggle}
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
          />
        </Box>

        {/* Quality buttons — chỉ hiện sau khi flip */}
        <Fade in={isFlipped}>
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            {isFlipped && (
              <QualityButtons onRate={handleRate} loading={rating} />
            )}
          </Box>
        </Fade>

        {/* Navigation arrows */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            onClick={goPrev}
            disabled={currentIndex === 0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Dots indicator */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {Array.from({ length: Math.min(total, 7) }).map((_, i) => {
              const dotIndex =
                total <= 7 ? i : Math.floor((i / 6) * (total - 1));
              const isActive =
                total <= 7
                  ? i === currentIndex
                  : Math.abs(dotIndex - currentIndex) < total / 7;
              return (
                <Box
                  key={i}
                  sx={{
                    width: isActive ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isActive ? accentColor : "divider",
                    transition: "all 0.2s",
                  }}
                />
              );
            })}
          </Stack>

          <IconButton
            onClick={goNext}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Stack>

        {/* Keyboard hint */}
        <Typography variant="caption" color="text.disabled" textAlign="center">
          ← → để chuyển · Space để lật thẻ
        </Typography>
      </Box>
    </Box>
  );
}

// ── Session Complete screen ────────────────────────────────────────────────────
function SessionComplete({
  source,
  total,
  accentColor,
  onRestart,
  onExit,
}: {
  source: SessionSource;
  total: number;
  accentColor: string;
  onRestart: () => void;
  onExit: () => void;
}) {
  const [stats, setStats] = useState<{
    learnedWords: number;
    totalWords: number;
    progressPct: number;
    notLearnedWords: number;
  } | null>(null);

  // Fetch stats thực tế từ DB ngay khi màn hình complete xuất hiện
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint =
          source.type === "topic"
            ? `/api/proxy/word-progress/topic/${source.topicId}`
            : `/api/proxy/word-progress/level/${source.level}`;
        const res = await fetch(`${endpoint}?_t=${Date.now()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        const data = json?.data;
        if (data) {
          const learned = data.learnedWords ?? 0;
          const t = data.totalWords ?? total;
          setStats({
            learnedWords: learned,
            totalWords: t,
            progressPct: data.progressPct ?? 0,
            notLearnedWords: t - learned,
          });
        }
      } catch {
        /* silent */
      }
    };
    fetchStats();
  }, [source, total]);

  const displayTotal = stats?.totalWords ?? total;
  const displayLearned = stats?.learnedWords ?? 0;
  const displayPct = stats?.progressPct ?? 0;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 3,
        px: 3,
        bgcolor: "background.default",
      }}
    >
      <CheckCircleOutlineIcon sx={{ fontSize: 64, color: accentColor }} />

      <Box textAlign="center">
        <Typography
          fontFamily="'Playfair Display', serif"
          fontSize={28}
          fontWeight={500}
          mb={0.5}
        >
          Hoàn thành! 🎉
        </Typography>
        <Typography color="text.secondary">
          Bạn đã xem qua {total} thẻ trong phiên này
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          p: 2.5,
          width: "100%",
          maxWidth: 360,
        }}
      >
        {/* 2 chip: Chưa học / Đã học */}
        <Stack direction="row" spacing={1.5} mb={1.5} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: "#f1efe8",
              borderRadius: 1.5,
              px: 1.25,
              py: 0.6,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#78716c",
              }}
            />
            <Typography fontSize="13px" fontWeight={700} color="#78716c">
              {stats?.notLearnedWords ?? "—"}
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              Chưa học
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: "#e8f5e9",
              borderRadius: 1.5,
              px: 1.25,
              py: 0.6,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#2e7d32",
              }}
            />
            <Typography fontSize="13px" fontWeight={700} color="#2e7d32">
              {stats ? displayLearned : "—"}
            </Typography>
            <Typography fontSize="12px" color="text.secondary">
              Đã học
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Tổng tiến độ {source.type === "topic" ? "chủ đề" : "cấp độ"}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {displayLearned} / {displayTotal} từ
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={displayPct}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(0,0,0,0.07)",
            "& .MuiLinearProgress-bar": {
              bgcolor: accentColor,
              borderRadius: 4,
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.disabled"
          mt={0.75}
          display="block"
        >
          {displayPct}% hoàn thành
          {stats?.notLearnedWords === 0 ? " · đã học hết rồi 🎉" : ""}
        </Typography>
      </Box>

      <Stack spacing={1.5} width="100%" maxWidth={360}>
        <Button
          fullWidth
          variant="contained"
          onClick={onRestart}
          disableElevation
          sx={{
            bgcolor: accentColor,
            "&:hover": { bgcolor: accentColor, opacity: 0.88 },
            py: 1.25,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Học lại từ đầu
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={onExit}
          sx={{
            py: 1.25,
            borderRadius: 2,
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Về trang từ vựng
        </Button>
      </Stack>
    </Box>
  );
}
