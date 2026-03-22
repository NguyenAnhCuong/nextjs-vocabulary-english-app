"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Fade,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import type { FlashCard } from "@/types/flashcard.types";
import { LEVEL_COLORS } from "@/types/vocabulary";

interface FlashCardViewProps {
  card: FlashCard;
  index: number;
  total: number;
  onFavToggle: (
    cardId: string,
    kind: "word" | "userWord",
    isFav: boolean,
  ) => void;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
}

export default function FlashCardView({
  card,
  index,
  total,
  onFavToggle,
  isFlipped: externalFlipped,
  onFlip,
}: FlashCardViewProps) {
  const [flipped, setFlipped] = useState(false);
  const controlled = externalFlipped !== undefined;

  // Reset về mặt trước mỗi khi đổi card
  useEffect(() => {
    setFlipped(false);
    onFlip?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const isFlipped = controlled ? externalFlipped : flipped;

  const handleFlip = () => {
    const next = !isFlipped;
    setFlipped(next);
    onFlip?.(next);
  };

  const lvl = LEVEL_COLORS[card.level];

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.audioUrl) {
      new Audio(card.audioUrl).play().catch(() => {});
    }
  };

  return (
    <Box
      onClick={handleFlip}
      sx={{
        width: "100%",
        perspective: "1200px",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: 380,
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          willChange: "transform",
        }}
      >
        {/* ── Front face (English) ──────────────────────────── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            bgcolor: "background.paper",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            gap: 2,
          }}
        >
          {/* Top row: level + fav */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ position: "absolute", top: 16, left: 20, right: 20 }}
          >
            <Chip
              label={card.level}
              size="small"
              sx={{
                bgcolor: lvl?.bg,
                color: lvl?.color,
                fontWeight: 700,
                fontSize: "12px",
                height: 24,
                borderRadius: 1,
              }}
            />
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFavToggle(card.id, card.kind, card.isFav);
              }}
              sx={{
                color: card.isFav ? "#f5b342" : "text.disabled",
                "&:hover": { color: "#f5b342" },
              }}
            >
              {card.isFav ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Stack>

          {/* Word */}
          <Typography
            fontFamily="'Playfair Display', serif"
            fontSize={{ xs: 36, sm: 44 }}
            fontWeight={500}
            textAlign="center"
            lineHeight={1.1}
            letterSpacing="-1px"
          >
            {card.en}
          </Typography>

          {/* Phonetic + audio */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontStyle="italic"
            >
              {card.phonetic || ""}
            </Typography>
            {card.audioUrl && (
              <Tooltip title="Nghe phát âm">
                <IconButton
                  size="small"
                  onClick={handleAudio}
                  sx={{ color: "text.disabled", p: 0.25 }}
                >
                  <VolumeUpIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Type chip */}
          <Chip
            label={card.typeLabel}
            size="small"
            variant="outlined"
            sx={{
              fontSize: "11px",
              borderColor: "divider",
              color: "text.secondary",
            }}
          />

          {/* Hint */}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ position: "absolute", bottom: 16 }}
          >
            Nhấn để xem nghĩa
          </Typography>
        </Box>

        {/* ── Back face (Vietnamese) ────────────────────────── */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            bgcolor: "background.paper",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            p: 4,
            gap: 2,
          }}
        >
          {/* Top: word small + fav */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              fontFamily="'Playfair Display', serif"
              fontSize={20}
              fontWeight={500}
              color="text.secondary"
            >
              {card.en}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFavToggle(card.id, card.kind, card.isFav);
              }}
              sx={{
                color: card.isFav ? "#f5b342" : "text.disabled",
                "&:hover": { color: "#f5b342" },
              }}
            >
              {card.isFav ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Stack>

          {/* Main meaning */}
          <Typography
            fontFamily="'Playfair Display', serif"
            fontSize={{ xs: 24, sm: 30 }}
            fontWeight={500}
            lineHeight={1.3}
            sx={{ flex: "0 0 auto" }}
          >
            {card.meaning}
          </Typography>

          {/* English meaning */}
          {card.meaningEn && (
            <Typography
              variant="body2"
              color="text.secondary"
              fontStyle="italic"
            >
              {card.meaningEn}
            </Typography>
          )}

          {/* Example */}
          {card.example && (
            <Box
              sx={{
                bgcolor: "background.default",
                borderLeft: "3px solid",
                borderColor: lvl?.color ?? "primary.main",
                borderRadius: "0 8px 8px 0",
                px: 1.5,
                py: 1,
                mt: "auto",
              }}
            >
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
                lineHeight={1.6}
              >
                "{card.example}"
              </Typography>
              {card.exampleVi && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  mt={0.5}
                  display="block"
                >
                  {card.exampleVi}
                </Typography>
              )}
            </Box>
          )}

          {/* Hint */}
          <Typography
            variant="caption"
            color="text.disabled"
            textAlign="center"
            sx={{ mt: "auto" }}
          >
            Nhấn để lật lại
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
