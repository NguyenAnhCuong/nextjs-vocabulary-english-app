"use client";
// src/components/quiz/list/QuizHistoryTab.tsx

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Button,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ReplayIcon from "@mui/icons-material/Replay";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Link from "next/link";
import { gradeColor, formatTime, LEVEL_META } from "@/lib/quizUtils";
import type { QuizScore } from "@/types/quiz";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttemptItem {
  id: string;
  score: QuizScore;
  timeTakenSeconds: number;
  submittedAt: string;
  quiz: {
    id: string;
    title: string;
    level: string;
  };
}

interface HistoryResponse {
  meta: { current: number; pageSize: number; total: number; pages: number };
  result: AttemptItem[];
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchHistory(page: number): Promise<HistoryResponse | null> {
  try {
    const res = await fetch(
      `/api/proxy/quizzes/me/history?current=${page}&pageSize=10`,
      { cache: "no-store" },
    );
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Grade badge ───────────────────────────────────────────────────────────────

function GradeBadge({
  grade,
  size = 40,
}: {
  grade: QuizScore["grade"];
  size?: number;
}) {
  const color = gradeColor(grade);
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 900,
        fontFamily: "monospace",
        flexShrink: 0,
        boxShadow: `0 4px 12px ${color}44`,
      }}
    >
      {grade}
    </Box>
  );
}

// ── Single attempt card ───────────────────────────────────────────────────────

function AttemptCard({ attempt }: { attempt: AttemptItem }) {
  const [expanded, setExpanded] = useState(false);
  const { score, quiz } = attempt;
  const gc = gradeColor(score.grade);
  const lvl = LEVEL_META[quiz.level] ?? LEVEL_META.B1;

  const submittedDate = new Date(attempt.submittedAt).toLocaleDateString(
    "vi-VN",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        transition: "border-color 0.15s",
        "&:hover": { borderColor: gc + "66" },
      }}
    >
      {/* Main row */}
      <Stack direction="row" alignItems="center" spacing={2} p={2}>
        <GradeBadge grade={score.grade} />

        <Box flex={1} minWidth={0}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            mb={0.5}
            flexWrap="wrap"
          >
            <Typography fontWeight={700} fontSize={14} noWrap>
              {quiz.title}
            </Typography>
            <Chip
              label={lvl.label}
              size="small"
              sx={{
                bgcolor: lvl.bg,
                color: lvl.color,
                fontWeight: 700,
                fontSize: 10,
                height: 18,
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              <AccessTimeIcon
                sx={{ fontSize: 12, mr: 0.25, verticalAlign: "middle" }}
              />
              {submittedDate}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ⏱ {formatTime(attempt.timeTakenSeconds)}
            </Typography>
          </Stack>
        </Box>

        {/* Score */}
        <Box textAlign="right" flexShrink={0}>
          <Typography
            fontSize={22}
            fontWeight={900}
            sx={{ color: gc, fontFamily: "monospace" }}
          >
            {score.percentScore}
            <Typography
              component="span"
              fontSize={12}
              color="text.disabled"
              fontWeight={400}
            >
              %
            </Typography>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {score.totalCorrect}/{score.totalQuestions} đúng
          </Typography>
        </Box>

        <Tooltip title={expanded ? "Thu gọn" : "Xem chi tiết"}>
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
            }}
          >
            {expanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Score bar */}
      <LinearProgress
        variant="determinate"
        value={score.percentScore}
        sx={{
          height: 3,
          borderRadius: 0,
          bgcolor: "rgba(0,0,0,0.05)",
          "& .MuiLinearProgress-bar": { bgcolor: gc },
        }}
      />

      {/* Expanded detail */}
      <Collapse in={expanded}>
        <Box p={2} pt={1.5} bgcolor="grey.50">
          <Typography
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            display="block"
            mb={1.5}
          >
            KẾT QUẢ THEO PHẦN
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {score.sections.map((sec) => {
              const pct =
                sec.total > 0 ? Math.round((sec.correct / sec.total) * 100) : 0;
              const c =
                pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
              return (
                <Box
                  key={sec.label}
                  flex={1}
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    textAlign: "center",
                  }}
                >
                  <Typography fontSize={20}>{sec.icon}</Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {sec.label}
                  </Typography>
                  <Typography fontSize={18} fontWeight={800} sx={{ color: c }}>
                    {sec.correct}
                    <Typography
                      component="span"
                      fontSize={12}
                      color="text.disabled"
                      fontWeight={400}
                    >
                      /{sec.total}
                    </Typography>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      mt: 0.75,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.07)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 2,
                        bgcolor: c,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
          <Stack direction="row" justifyContent="flex-end" mt={1.5}>
            <Button
              component={Link}
              href={`/quizzes/${quiz.id}`}
              size="small"
              startIcon={<ReplayIcon />}
              variant="outlined"
              sx={{ borderRadius: 1.5, fontSize: 12 }}
            >
              Làm lại
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

// ── Stats summary bar ─────────────────────────────────────────────────────────

function StatsSummary({ attempts }: { attempts: AttemptItem[] }) {
  if (attempts.length === 0) return null;

  const scores = attempts.map((a) => a.score.percentScore);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const best = Math.max(...scores);
  const gradeCounts = attempts.reduce(
    (acc, a) => {
      acc[a.score.grade] = (acc[a.score.grade] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const topGrade = (["S", "A", "B", "C", "F"] as const).find(
    (g) => gradeCounts[g],
  );

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={3}>
      {[
        { label: "Số bài đã làm", value: String(attempts.length), icon: "📝" },
        { label: "Điểm trung bình", value: `${avg}%`, icon: "📊" },
        { label: "Điểm cao nhất", value: `${best}%`, icon: "🏆" },
        {
          label: "Xếp loại phổ biến",
          value: topGrade ?? "—",
          icon: "⭐",
          color: topGrade ? gradeColor(topGrade) : undefined,
        },
      ].map(({ label, value, icon, color }) => (
        <Paper
          key={label}
          elevation={0}
          sx={{
            flex: 1,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2.5,
            textAlign: "center",
          }}
        >
          <Typography fontSize={24} mb={0.5}>
            {icon}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {label}
          </Typography>
          <Typography
            fontSize={20}
            fontWeight={800}
            sx={{ color: color ?? "text.primary", fontFamily: "monospace" }}
          >
            {value}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function QuizHistoryTab() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const res = await fetchHistory(p);
    setData(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const attempts = data?.result ?? [];
  const totalPages = data?.meta?.pages ?? 1;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!loading && attempts.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <EmojiEventsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
        <Typography fontWeight={700} fontSize={18} mb={1}>
          Chưa có lịch sử làm bài
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Hãy thử làm một bài quiz để xem kết quả tại đây
        </Typography>
        <Button
          component={Link}
          href="/quizzes"
          variant="contained"
          disableElevation
          sx={{ borderRadius: 2 }}
        >
          Xem danh sách Quiz
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <StatsSummary attempts={attempts} />

      <Divider sx={{ mb: 2.5 }}>
        <Chip label={`${data?.meta?.total ?? 0} lượt làm bài`} size="small" />
      </Divider>

      <Stack spacing={1.5}>
        {attempts.map((attempt) => (
          <AttemptCard key={attempt.id} attempt={attempt} />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1.5}
          mt={3}
        >
          <Button
            size="small"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ borderRadius: 2 }}
          >
            ← Trước
          </Button>
          <Typography variant="body2" color="text.secondary">
            Trang {page} / {totalPages}
          </Typography>
          <Button
            size="small"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            sx={{ borderRadius: 2 }}
          >
            Sau →
          </Button>
        </Stack>
      )}
    </Box>
  );
}
