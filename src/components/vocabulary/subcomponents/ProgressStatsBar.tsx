// src/components/vocabulary/subcomponents/ProgressStatsBar.tsx
"use client";

import { Box, Stack, Typography, LinearProgress, Tooltip } from "@mui/material";
import type { WordProgressStats } from "@/types/vocabulary";

interface ProgressStatsBarProps {
  stats: WordProgressStats;
}

const STAT_ITEMS = [
  { key: "NEW", label: "Chưa học", color: "#b0b0aa", bg: "#f1efe8" },
  { key: "LEARNING", label: "Đang học", color: "#f57f17", bg: "#fff8e1" },
  { key: "REVIEWING", label: "Ôn tập", color: "#1565c0", bg: "#e3f2fd" },
  { key: "MASTERED", label: "Đã thuộc", color: "#2e7d32", bg: "#e8f5e9" },
] as const;

export default function ProgressStatsBar({ stats }: ProgressStatsBarProps) {
  const masteredPct =
    stats.total > 0 ? Math.round((stats.MASTERED / stats.total) * 100) : 0;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        px: { xs: 2, md: 3 },
        py: 1.5,
        flexShrink: 0,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
      >
        {/* Left: stat chips */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {STAT_ITEMS.map(({ key, label, color, bg }) => (
            <Tooltip key={key} title={label} arrow>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  bgcolor: bg,
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.5,
                  cursor: "default",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: color,
                    flexShrink: 0,
                  }}
                />
                <Typography fontSize="12px" fontWeight={600} color={color}>
                  {stats[key]}
                </Typography>
                <Typography fontSize="11px" color="text.secondary">
                  {label}
                </Typography>
              </Box>
            </Tooltip>
          ))}

          {stats.due > 0 && (
            <Tooltip title="Số từ cần ôn tập hôm nay" arrow>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  bgcolor: "#fce4ec",
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.5,
                  cursor: "default",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#c62828",
                    flexShrink: 0,
                  }}
                />
                <Typography fontSize="12px" fontWeight={600} color="#c62828">
                  {stats.due}
                </Typography>
                <Typography fontSize="11px" color="text.secondary">
                  Cần ôn
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Stack>

        {/* Right: overall progress bar */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          minWidth={200}
          sx={{ flexShrink: 0 }}
        >
          <LinearProgress
            variant="determinate"
            value={masteredPct}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(0,0,0,0.07)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#2e7d32",
                borderRadius: 3,
              },
            }}
          />
          <Typography
            fontSize="12px"
            fontWeight={600}
            color="text.secondary"
            minWidth={60}
          >
            {masteredPct}% thuộc ({stats.total} từ)
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}
