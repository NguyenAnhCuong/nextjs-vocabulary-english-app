// src/components/home/DashBoard.tsx
"use client";

import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Stack,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAppTheme } from "@/theme/ThemeContext";
import type { LevelGroup, WordProgressStats } from "@/types/vocabulary";

// ── Level color map ────────────────────────────────────────────────────────────
const LEVEL_STYLE: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  A1: { color: "#854d0e", bg: "#fef9c3", label: "Beginner" },
  A2: { color: "#166534", bg: "#dcfce7", label: "Elementary" },
  B1: { color: "#1e40af", bg: "#dbeafe", label: "Intermediate" },
  B2: { color: "#4c1d95", bg: "#ede9fe", label: "Upper-Int." },
  C1: { color: "#9f1239", bg: "#ffe4e6", label: "Advanced" },
  C2: { color: "#1e3a5f", bg: "#e0f2fe", label: "Proficiency" },
};

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  value,
  label,
  accent,
  sub,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent: string;
  sub?: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderColor: "divider",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: `0 4px 20px ${accent}20` },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          bgcolor: `${accent}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.75rem",
            fontWeight: 700,
            lineHeight: 1,
            color: accent,
          }}
        >
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.disabled" display="block">
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashBoardPage({
  levelGroups,
  session,
  progressStats,
  dashStats,
}: {
  levelGroups: LevelGroup[];
  session: any;
  progressStats: WordProgressStats | null;
  dashStats: any;
}) {
  const { theme } = useAppTheme();
  const { data: clientSession } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/auth/signin" });
    }
  }, [session]);

  const user = (clientSession?.user ?? session?.user) as any;
  const loginDays = dashStats?.loginDays ?? dashStats?.data?.loginDays ?? 0;
  const streak = dashStats?.streak ?? dashStats?.data?.streak ?? 0;
  const totalWords = progressStats?.total ?? 0;
  const mastered = progressStats?.MASTERED ?? 0;
  const learning =
    (progressStats?.LEARNING ?? 0) + (progressStats?.REVIEWING ?? 0);

  const firstName = user?.name?.split(" ").at(-1) ?? "bạn";

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 0, md: 1 },
        pb: 6,
        bgcolor: theme.bg,
        transition: "background-color 0.4s",
      }}
    >
      {/* ── Greeting hero ──────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          mb: 3,
          background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent}dd 100%)`,
          p: { xs: 3, md: 4 },
          color: "white",
        }}
      >
        {/* Background gif overlay */}
        <Box
          component="img"
          src="/assets/gif/banner-black-cat.gif"
          sx={{
            position: "absolute",
            right: 0,
            bottom: 0,
            height: "100%",
            opacity: 0.18,
            pointerEvents: "none",
          }}
        />
        {/* Decorative rings */}
        {[140, 200, 260].map((size, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.1)",
              width: size,
              height: size,
              top: -size / 3,
              right: -size / 3,
            }}
          />
        ))}

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.75,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Chào mừng trở lại
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              fontWeight: 700,
              lineHeight: 1.1,
              mt: 0.5,
              mb: 2,
            }}
          >
            {firstName} 👋
          </Typography>

          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {streak > 0 && (
              <Chip
                icon={
                  <LocalFireDepartmentIcon
                    sx={{ fontSize: 15, color: "#fb923c !important" }}
                  />
                }
                label={`${streak} ngày liên tiếp`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              />
            )}
            {totalWords > 0 && (
              <Chip
                icon={
                  <AutoStoriesIcon
                    sx={{ fontSize: 14, color: "white !important" }}
                  />
                }
                label={`${totalWords} từ đang học`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              />
            )}
          </Stack>

          <Button
            component={Link}
            href="/learning"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            disableElevation
            sx={{
              mt: 3,
              bgcolor: "white",
              color: theme.accent,
              fontWeight: 700,
              borderRadius: 2.5,
              px: 3,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Học ngay
          </Button>
        </Box>
      </Box>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <Grid container spacing={1.75} mb={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<LocalFireDepartmentIcon />}
            value={streak}
            label="Chuỗi ngày"
            accent="#f97316"
            sub={streak > 0 ? "Đang duy trì!" : "Bắt đầu hôm nay"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AutoStoriesIcon />}
            value={loginDays}
            label="Ngày đã học"
            accent={theme.accent}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<TrendingUpIcon />}
            value={totalWords}
            label="Tổng số từ"
            accent="#8b5cf6"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<EmojiEventsIcon />}
            value={mastered}
            label="Từ đã thuộc"
            accent="#16a34a"
          />
        </Grid>
      </Grid>

      {/* ── Level progress ─────────────────────────────────────────────── */}
      <Box mb={2} display="flex" alignItems="center" gap={1}>
        <TrendingUpIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <Typography
          fontWeight={700}
          color="text.secondary"
          fontSize="14px"
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          Tiến độ theo cấp độ
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {levelGroups.map((grp, i) => {
          const style = LEVEL_STYLE[grp.level] ?? {
            color: "#64748b",
            bg: "#f1f5f9",
            label: grp.level,
          };
          const pct =
            grp.totalWords > 0
              ? Math.round((grp.learnedWords / grp.totalWords) * 100)
              : 0;

          return (
            <Paper
              key={grp.level}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                opacity: grp.locked ? 0.5 : 1,
                transition: "all 0.2s",
                animation: `fadeUp 0.3s ease ${i * 50}ms both`,
                "@keyframes fadeUp": {
                  from: { opacity: 0, transform: "translateY(8px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
                "&:hover": grp.locked
                  ? {}
                  : {
                      borderColor: style.color,
                      boxShadow: `0 2px 16px ${style.color}18`,
                    },
              }}
            >
              {/* Level badge */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  bgcolor: style.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography
                  fontWeight={800}
                  fontSize="15px"
                  color={style.color}
                >
                  {grp.level}
                </Typography>
              </Box>

              {/* Info + progress */}
              <Box flex={1} minWidth={0}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={0.75}
                >
                  <Box>
                    <Typography fontWeight={700} fontSize="14px">
                      {style.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {grp.nameVi}
                    </Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {grp.learnedWords}/{grp.totalWords}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: style.color,
                        minWidth: 34,
                        textAlign: "right",
                      }}
                    >
                      {pct}%
                    </Typography>
                  </Stack>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: style.bg,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: style.color,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Lock / action */}
              {grp.locked ? (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ flexShrink: 0 }}
                >
                  🔒
                </Typography>
              ) : (
                <Button
                  component={Link}
                  href={`/learning/level/${grp.level}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    flexShrink: 0,
                    borderColor: style.color,
                    color: style.color,
                    borderRadius: 2,
                    fontSize: "12px",
                    px: 1.5,
                    "&:hover": { bgcolor: style.bg, borderColor: style.color },
                  }}
                >
                  Học
                </Button>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
