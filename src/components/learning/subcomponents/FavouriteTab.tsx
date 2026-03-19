"use client";

import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { FAV_WORDS, LEVEL_COLORS } from "@/types/vocabulary";

const TOPIC_FILTERS = [
  "Tất cả",
  "💼 Kinh doanh",
  "🌍 Du lịch",
  "💻 Công nghệ",
  "💬 Giao tiếp",
];

export default function FavouriteTab() {
  const [topicFilter, setTopicFilter] = useState("Tất cả");
  const [favs, setFavs] = useState<Set<string>>(
    new Set(FAV_WORDS.map((w) => w.id)),
  );

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = FAV_WORDS.filter((w) =>
    topicFilter === "Tất cả" ? true : w.topic === topicFilter,
  ).filter((w) => favs.has(w.id));

  const reviewLabel = (days: number | "today") => {
    if (days === "today") return "Ôn lại: hôm nay";
    if (days === 1) return "Ôn lại: 1 ngày trước";
    return `Ôn lại: ${days} ngày trước`;
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        mb={3}
        useFlexGap
      >
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ mr: 0.5 }}
        >
          Chủ đề:
        </Typography>
        {TOPIC_FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            size="small"
            onClick={() => setTopicFilter(f)}
            variant={topicFilter === f ? "filled" : "outlined"}
            color={topicFilter === f ? "primary" : "default"}
            sx={{
              borderColor: topicFilter === f ? "primary.main" : "divider",
              cursor: "pointer",
              fontSize: "12px",
            }}
          />
        ))}
        <Box
          width={1}
          height={18}
          borderLeft="1px solid"
          borderColor="divider"
          mx={0.5}
          display="inline-block"
          sx={{ verticalAlign: "middle", width: 1, height: 18 }}
        />
        <Chip
          label="Cần ôn lại"
          size="small"
          variant="outlined"
          sx={{ borderColor: "divider", cursor: "pointer", fontSize: "12px" }}
        />
      </Stack>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography fontSize={40}>⭐</Typography>
          <Typography color="text.secondary" mt={1}>
            Chưa có từ yêu thích nào.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.75}>
          {filtered.map((word, i) => {
            const lvl = LEVEL_COLORS[word.level];
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={word.id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    position: "relative",
                    animation: `fadeUp 0.35s ease ${i * 60}ms both`,
                    "@keyframes fadeUp": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
                    },
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Star button */}
                    <IconButton
                      size="small"
                      onClick={() => toggleFav(word.id)}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        color: "#f5b342",
                        "&:hover": { bgcolor: "rgba(245,179,66,0.1)" },
                      }}
                    >
                      <StarIcon fontSize="small" />
                    </IconButton>

                    {/* Word */}
                    <Typography
                      fontFamily="'Playfair Display', serif"
                      fontSize={22}
                      fontWeight={500}
                      mb={0.5}
                      pr={4}
                      lineHeight={1.2}
                    >
                      {word.en}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={1}
                    >
                      {word.phonetic} · {word.type}
                    </Typography>

                    {/* Level chip */}
                    <Chip
                      label={word.level}
                      size="small"
                      sx={{
                        bgcolor: lvl.bg,
                        color: lvl.color,
                        fontWeight: 700,
                        fontSize: "11px",
                        height: 22,
                        mb: 1.5,
                        borderRadius: 1,
                      }}
                    />

                    {/* Meaning */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      lineHeight={1.6}
                      mb={1}
                    >
                      {word.meaning}
                    </Typography>

                    {/* Example */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      fontStyle="italic"
                      lineHeight={1.6}
                      display="block"
                      sx={{
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      "{word.example}"
                    </Typography>

                    {/* Footer */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mt={1.5}
                    >
                      <Chip
                        label={word.topic}
                        size="small"
                        sx={{
                          bgcolor: word.topicBg,
                          color: word.topicColor,
                          fontWeight: 500,
                          fontSize: "11px",
                          height: 22,
                        }}
                      />
                      <Typography variant="caption" color="text.disabled">
                        {reviewLabel(word.reviewedDaysAgo)}
                        {word.reviewedDaysAgo === "today" && " ⚠️"}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
