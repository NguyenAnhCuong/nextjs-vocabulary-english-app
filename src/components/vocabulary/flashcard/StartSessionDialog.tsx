"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import type {
  SessionSource,
  SavedSessionProgress,
} from "@/types/flashcard.types";
import {
  loadSessionProgress,
  clearSessionProgress,
} from "@/types/flashcard.types";
import { LEVEL_COLORS } from "@/types/vocabulary";

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
  const [saved, setSaved] = useState<SavedSessionProgress | null>(null);

  useEffect(() => {
    if (source && open) {
      setSaved(loadSessionProgress(source));
    }
  }, [source, open]);

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

  const hasSaved =
    saved && saved.currentIndex > 0 && saved.totalCards === totalCards;
  const savedPct = hasSaved
    ? Math.round((saved.currentIndex / saved.totalCards) * 100)
    : 0;

  const handleResume = () => {
    onStart(saved!.currentIndex);
  };

  const handleRestart = () => {
    if (source) clearSessionProgress(source);
    onStart(0);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
    >
      {/* Header accent */}
      <Box sx={{ height: 4, bgcolor: color }} />

      <DialogContent sx={{ p: 3.5 }}>
        {/* Close */}
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
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
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            mb: 2,
          }}
        >
          {source.type === "topic" ? source.emoji : source.level}
        </Box>

        <Typography
          fontFamily="'Playfair Display', serif"
          fontSize={22}
          fontWeight={500}
          mb={0.5}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2.5}>
          {totalCards} từ vựng
          {source.type === "topic" ? ` · Chủ đề` : ` · Cấp độ`}
        </Typography>

        {/* Stats chips */}
        <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap" useFlexGap>
          <Chip
            label={`${totalCards} thẻ`}
            size="small"
            sx={{ bgcolor: bg, color, fontWeight: 600, fontSize: "12px" }}
          />
          <Chip
            label="Flip để xem nghĩa"
            size="small"
            variant="outlined"
            sx={{ fontSize: "12px", borderColor: "divider" }}
          />
          <Chip
            label="SM-2 tự động"
            size="small"
            variant="outlined"
            sx={{ fontSize: "12px", borderColor: "divider" }}
          />
        </Stack>

        {/* Saved progress section */}
        {hasSaved && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                bgcolor: "background.default",
                borderRadius: 2,
                p: 1.5,
                mb: 2,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={0.75}
              >
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                >
                  Tiến độ đã lưu
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {saved!.currentIndex} / {saved!.totalCards} thẻ
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={savedPct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: "rgba(0,0,0,0.07)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: color,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.disabled"
                mt={0.5}
                display="block"
              >
                Lưu lúc {new Date(saved!.savedAt).toLocaleString("vi-VN")}
              </Typography>
            </Box>

            <Stack spacing={1}>
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
                Tiếp tục từ thẻ {saved!.currentIndex + 1}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleRestart}
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                  py: 1.25,
                  borderRadius: 2,
                }}
              >
                Học lại từ đầu
              </Button>
            </Stack>
          </>
        )}

        {/* No saved progress */}
        {!hasSaved && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleRestart}
            disableElevation
            sx={{
              bgcolor: color,
              "&:hover": { bgcolor: color, opacity: 0.88 },
              py: 1.25,
              borderRadius: 2,
              fontWeight: 600,
              mt: 1,
            }}
          >
            Bắt đầu học
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
