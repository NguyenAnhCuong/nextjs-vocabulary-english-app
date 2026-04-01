"use client";
// src/components/quiz/list/QuizCard.tsx

import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import type { QuizSummary } from "@/types/quiz";
import { LEVEL_META } from "@/lib/quizUtils";
import Link from "next/link";

interface QuizCardProps {
  quiz: QuizSummary;
  isAdmin?: boolean;
}

export default function QuizCard({ quiz, isAdmin }: QuizCardProps) {
  const lvl = LEVEL_META[quiz.level] ?? LEVEL_META.B1;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
          borderColor: "transparent",
        },
      }}
    >
      {/* Accent bar */}
      <Box sx={{ height: 4, bgcolor: lvl.color, opacity: 0.8 }} />

      <CardContent sx={{ flex: 1, p: 2.5 }}>
        {/* Top row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Chip
            label={lvl.label}
            size="small"
            sx={{
              bgcolor: lvl.bg,
              color: lvl.color,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
          <Typography variant="caption" color="text.disabled">
            {quiz.createdAt}
          </Typography>
        </Stack>

        {/* Title */}
        <Typography
          fontWeight={700}
          fontSize={15}
          color="text.primary"
          mb={0.75}
          sx={{ lineHeight: 1.35 }}
        >
          {quiz.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mb={1.5}
          sx={{
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {quiz.description}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={2}>
          {quiz.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ fontSize: 11, height: 20, bgcolor: "background.default" }}
            />
          ))}
          {!quiz.isPublished && (
            <Chip
              label="Nháp"
              size="small"
              color="warning"
              sx={{ fontSize: 11, height: 20 }}
            />
          )}
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={2} mb={1.5}>
          {[
            {
              icon: <QuizOutlinedIcon sx={{ fontSize: 14 }} />,
              text: `${quiz.totalQuestions} câu`,
            },
            {
              icon: <TimerOutlinedIcon sx={{ fontSize: 14 }} />,
              text: `${quiz.durationMinutes} phút`,
            },
          ].map(({ icon, text }) => (
            <Stack
              key={text}
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ color: "text.secondary" }}
            >
              {icon}
              <Typography variant="caption" color="text.secondary">
                {text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
        <Button
          component={Link}
          href={`/quizzes/${quiz.id}`}
          variant="contained"
          startIcon={<PlayArrowIcon />}
          disableElevation
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 700, fontSize: 13 }}
        >
          Làm bài
        </Button>
        {isAdmin && (
          <Tooltip title="Chỉnh sửa">
            <IconButton
              component={Link}
              href={`/quizzes/${quiz.id}/edit`}
              size="small"
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
