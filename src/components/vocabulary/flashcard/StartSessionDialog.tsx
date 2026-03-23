"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  Divider,
  Skeleton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import type { SessionSource } from "@/types/flashcard";
import { clearSessionProgress } from "@/types/flashcard";
import { LEVEL_COLORS } from "@/types/vocabulary";

interface SessionProgressStats {
  totalWords: number;
  notLearnedWords: number; // chưa học (chưa review lần nào)
  learnedWords: number; // đã học (reviewed ít nhất 1 lần, gồm cả mastered)
  progressPct: number;
  resumeIndex: number; // index thẻ đầu tiên chưa học → dùng cho resume
}

interface StartSessionDialogProps {
  open: boolean;
  source: SessionSource | null;
  totalCards: number;
  onStart: (fromIndex: number) => void;
  onClose: () => void;
}

export default function StartSessionDialog({
  open,
  source,
  totalCards,
  onStart,
  onClose,
}: StartSessionDialogProps) {
  const [stats, setStats] = useState<SessionProgressStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source || !open) return;
    setStats(null);

    const fetchStats = async () => {
      setLoading(true);
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
          const total = data.totalWords ?? totalCards;
          setStats({
            totalWords: total,
            notLearnedWords: total - learned,
            learnedWords: learned, // đã học = reviewed (gồm cả mastered)
            progressPct: data.progressPct ?? 0,
            resumeIndex: learned, // bắt đầu từ thẻ đầu tiên chưa review
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [source, open, totalCards]);

  if (!source) return null;

  const color =
    source.type === "topic"
      ? source.color
      : (LEVEL_COLORS[source.level]?.color ?? "#6c8fff");

  const bg =
    source.type === "topic"
      ? `${source.color}18`
      : (LEVEL_COLORS[source.level]?.bg ?? "#eeedfe");

  const title =
    source.type === "topic"
      ? `${source.emoji} ${source.topicName}`
      : `${source.level} — ${source.levelName}`;

  // Resume nếu đã học ít nhất 1 từ nhưng chưa hết
  const canResume =
    stats !== null &&
    stats.resumeIndex > 0 &&
    stats.resumeIndex < stats.totalWords;

  const handleResume = () => {
    if (source) clearSessionProgress(source);
    onStart(stats!.resumeIndex);
  };

  const handleRestart = () => {
    if (source) clearSessionProgress(source);
    onStart(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      <Box sx={{ height: 4, bgcolor: color }} />

      <DialogContent sx={{ p: 3 }}>
        {/* Close */}
        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
          <Button
            size="small"
            onClick={onClose}
            sx={{ minWidth: 0, p: 0.5, color: "text.disabled" }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Box>

        {/* Icon + title */}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            mb: 1.5,
          }}
        >
          {source.type === "topic" ? source.emoji : source.level}
        </Box>

        <Typography
          fontFamily="'Playfair Display', serif"
          fontSize={20}
          fontWeight={500}
          mb={0.25}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {totalCards} từ vựng · {source.type === "topic" ? "Chủ đề" : "Cấp độ"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* ── Stats ───────────────────────────────────────────── */}
        {loading ? (
          <Stack spacing={0.75} mb={2.5}>
            <Skeleton variant="rounded" height={36} />
            <Skeleton variant="rounded" height={6} sx={{ borderRadius: 3 }} />
            <Skeleton variant="text" width="50%" />
          </Stack>
        ) : stats ? (
          <Box mb={2.5}>
            {/* 2 chip: Chưa học / Đã học */}
            <Stack direction="row" spacing={1.5} mb={1.5} alignItems="center">
              {/* Chưa học */}
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
                  {stats.notLearnedWords}
                </Typography>
                <Typography fontSize="12px" color="text.secondary">
                  Chưa học
                </Typography>
              </Box>

              {/* Đã học (gộp learning + mastered) */}
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
                  {stats.learnedWords}
                </Typography>
                <Typography fontSize="12px" color="text.secondary">
                  Đã học
                </Typography>
              </Box>
            </Stack>

            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={stats.progressPct}
              sx={{
                height: 7,
                borderRadius: 3,
                bgcolor: "rgba(0,0,0,0.07)",
                "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
              }}
            />
            <Typography
              variant="caption"
              color="text.disabled"
              mt={0.75}
              display="block"
            >
              {stats.progressPct}% hoàn thành
              {stats.notLearnedWords > 0
                ? ` · còn ${stats.notLearnedWords} từ chưa học`
                : " · đã học hết rồi 🎉"}
            </Typography>
          </Box>
        ) : (
          <Box mb={2.5} />
        )}

        {/* ── Buttons ─────────────────────────────────────────── */}
        <Stack spacing={1}>
          {canResume && (
            <Button
              fullWidth
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleResume}
              disableElevation
              sx={{
                bgcolor: color,
                "&:hover": { bgcolor: color, opacity: 0.88 },
                py: 1.25,
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Tiếp tục · còn {stats!.notLearnedWords} từ chưa học
            </Button>
          )}

          <Button
            fullWidth
            variant={canResume ? "outlined" : "contained"}
            startIcon={canResume ? <RestartAltIcon /> : <PlayArrowIcon />}
            onClick={handleRestart}
            disableElevation={!canResume}
            sx={
              canResume
                ? {
                    borderColor: "divider",
                    color: "text.secondary",
                    py: 1.25,
                    borderRadius: 2,
                  }
                : {
                    bgcolor: color,
                    "&:hover": { bgcolor: color, opacity: 0.88 },
                    py: 1.25,
                    borderRadius: 2,
                    fontWeight: 600,
                  }
            }
          >
            {canResume
              ? "Học lại từ đầu"
              : stats?.notLearnedWords === 0
                ? "Ôn tập lại"
                : "Bắt đầu học"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
