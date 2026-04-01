"use client";
// src/components/quiz/list/QuizListClient.tsx

import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Pagination,
  Button,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GridViewIcon from "@mui/icons-material/GridView";
import HistoryIcon from "@mui/icons-material/History";
import Link from "next/link";
import QuizCard from "./QuizCard";
import type { QuizSummary } from "@/types/quiz";
import QuizHistoryTab from "./QuizHistoryTab";

const PER_PAGE = 6;

interface QuizListClientProps {
  quizzes: QuizSummary[];
  isAdmin?: boolean;
  isLoggedIn?: boolean;
}

export default function QuizListClient({
  quizzes,
  isAdmin,
  isLoggedIn,
}: QuizListClientProps) {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const matchSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchLevel = !level || q.level === level;
      return matchSearch && matchLevel;
    });
  }, [quizzes, search, level]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };
  const handleLevel = (v: string) => {
    setLevel(v);
    setPage(1);
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={2.5}
        spacing={2}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            fontFamily="'Playfair Display', serif"
            letterSpacing="-0.02em"
          >
            Câu đố từ vựng
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {tab === 0
              ? `${filtered.length} bài kiểm tra · Chọn một bài để bắt đầu`
              : "Lịch sử làm bài của bạn"}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            component={Link}
            href="/quizzes/create"
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            sx={{
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
              borderRadius: 2,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Tạo Quiz mới
          </Button>
        )}
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: "#1d4ed8" } }}
          sx={{
            "& .MuiTab-root": {
              color: "text.secondary",
              minHeight: 44,
              fontWeight: 600,
            },
            "& .Mui-selected": { color: "primary.main !important" },
          }}
        >
          <Tab
            icon={<GridViewIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>Danh sách</span>
                <Chip
                  label={quizzes.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 10,
                    fontWeight: 700,
                    bgcolor:
                      tab === 0 ? "primary.main" : "rgba(99,102,241,0.12)",
                    color: tab === 0 ? "#fff" : "primary.main",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Stack>
            }
          />
          <Tab
            icon={<HistoryIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>Lịch sử làm bài</span>
                {!isLoggedIn && (
                  <Chip
                    label="Đăng nhập"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: 9,
                      bgcolor: "rgba(0,0,0,0.06)",
                      color: "text.secondary",
                      "& .MuiChip-label": { px: 0.6 },
                    }}
                  />
                )}
              </Stack>
            }
            disabled={!isLoggedIn}
          />
        </Tabs>
      </Box>

      {/* Tab 0: Danh sách */}
      {tab === 0 && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={3}>
            <TextField
              size="small"
              placeholder="Tìm kiếm quiz, tags…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Cấp độ</InputLabel>
              <Select
                value={level}
                label="Cấp độ"
                onChange={(e) => handleLevel(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: "background.default" }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {paginated.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Typography fontSize={48}>🔍</Typography>
              <Typography color="text.secondary" mt={1}>
                Không tìm thấy quiz phù hợp
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {paginated.map((quiz) => (
                <Grid key={quiz.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <QuizCard quiz={quiz} isAdmin={isAdmin} />
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 600,
                    borderRadius: 1.5,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}

      {/* Tab 1: Lịch sử */}
      {tab === 1 && <QuizHistoryTab />}
    </Box>
  );
}
