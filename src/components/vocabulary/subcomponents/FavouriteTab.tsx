// src/components/vocabulary/subcomponents/FavouriteTab.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Pagination,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import type { VocabWord } from "@/types/vocabulary";
import { LEVEL_COLORS } from "@/types/vocabulary";
import { useFavourites } from "@/components/hooks/useVocabulary";

const TOPIC_FILTERS = [
  "Tất cả",
  "💼 Kinh doanh",
  "🌍 Du lịch",
  "💻 Công nghệ",
  "💬 Giao tiếp",
  "✏️ Từ của tôi",
];

const PAGE_SIZE = 9;

interface FavouriteTabProps {
  initialFavs: VocabWord[];
  search?: string; // ← thêm
}

export default function FavouriteTab({
  initialFavs,
  search = "",
}: FavouriteTabProps) {
  const [topicFilter, setTopicFilter] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const { favWords, toggle, loading } = useFavourites(initialFavs);

  const q = search.trim().toLowerCase();

  const filtered = favWords.filter((w) => {
    const matchTopic =
      topicFilter === "Tất cả" ||
      w.topic.includes(topicFilter.replace(/^[^\s]+ /, ""));

    const matchSearch =
      q === "" ||
      w.en.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q);

    return matchTopic && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilter = (f: string) => {
    setTopicFilter(f);
    setPage(1);
  };

  // Reset page khi search thay đổi
  // (dùng key trick ở Vocabulary.tsx hoặc useEffect, ở đây dùng cách đơn giản nhất)
  const handlePageChange = (_: React.ChangeEvent<unknown>, v: number) => {
    setPage(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onClick={() => handleFilter(f)}
            variant={topicFilter === f ? "filled" : "outlined"}
            color={topicFilter === f ? "primary" : "default"}
            sx={{
              borderColor: topicFilter === f ? "primary.main" : "divider",
              cursor: "pointer",
              fontSize: "12px",
            }}
          />
        ))}
        <Box flex={1} />
        <Typography variant="body2" color="text.secondary">
          {filtered.length} từ
          {(q !== "" || topicFilter !== "Tất cả") &&
            ` · trang ${page}/${totalPages || 1}`}
        </Typography>
      </Stack>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography fontSize={40}>⭐</Typography>
          <Typography color="text.secondary" mt={1}>
            {favWords.length === 0
              ? "Chưa có từ yêu thích nào. Nhấn ★ trên bất kỳ từ nào để thêm!"
              : q !== ""
                ? `Không tìm thấy từ nào khớp với "${search}".`
                : "Không có từ yêu thích nào trong chủ đề này."}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={1.75}>
            {paginated.map((word, i) => {
              const lvl = LEVEL_COLORS[word.level];
              const isLoading = loading === (word.wordId ?? word.userWordId);
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
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <IconButton
                        size="small"
                        disabled={isLoading}
                        onClick={() => toggle(word.wordId, word.userWordId)}
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

                      <Chip
                        label={word.level}
                        size="small"
                        sx={{
                          bgcolor: lvl?.bg,
                          color: lvl?.color,
                          fontWeight: 700,
                          fontSize: "11px",
                          height: 22,
                          mb: 1.5,
                          borderRadius: 1,
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.6}
                        mb={1}
                      >
                        {word.meaning}
                      </Typography>

                      {word.example && (
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
                      )}

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

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                size="small"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
