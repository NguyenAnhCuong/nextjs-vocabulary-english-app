"use client";

import { Stack, Button, Typography, Box } from "@mui/material";

interface QualityButtonsProps {
  onRate: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  loading?: boolean;
}

const RATINGS = [
  {
    quality: 1 as const,
    label: "Quên rồi",
    color: "#c62828",
    bg: "#fce4ec",
    emoji: "😵",
  },
  {
    quality: 2 as const,
    label: "Khó",
    color: "#f57f17",
    bg: "#fff8e1",
    emoji: "😓",
  },
  {
    quality: 3 as const,
    label: "Được",
    color: "#1565c0",
    bg: "#e3f2fd",
    emoji: "🙂",
  },
  {
    quality: 4 as const,
    label: "Dễ",
    color: "#2e7d32",
    bg: "#e8f5e9",
    emoji: "😊",
  },
  {
    quality: 5 as const,
    label: "Rất dễ",
    color: "#00695c",
    bg: "#e0f2f1",
    emoji: "🤩",
  },
];

export default function QualityButtons({
  onRate,
  loading,
}: QualityButtonsProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        display="block"
        mb={1.25}
        fontWeight={600}
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        Bạn nhớ từ này đến đâu?
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        {RATINGS.map(({ quality, label, color, bg, emoji }) => (
          <Button
            key={quality}
            disabled={loading}
            onClick={() => onRate(quality)}
            sx={{
              minWidth: { xs: 60, sm: 80 },
              flexDirection: "column",
              gap: 0.25,
              py: { xs: 1.25, sm: 1 },
              px: 1.5,
              bgcolor: bg,
              color,
              borderRadius: 2,
              border: "1px solid",
              borderColor: `${color}44`,
              fontWeight: 600,
              fontSize: { xs: "10px", sm: "11px" },
              textTransform: "none",
              lineHeight: 1.2,
              "&:hover": { bgcolor: `${color}22`, borderColor: color },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            <span style={{ fontSize: 18 }}>{emoji}</span>
            {label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
}
