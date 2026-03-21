"use client";

import React, { useState, useCallback } from "react";
import {
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import TopicTab from "./subcomponents/TopicTab";
import LevelTab from "./subcomponents/LevelTab";
import FavouriteTab from "./subcomponents/FavouriteTab";
import OwnWordsTab from "./subcomponents/OwnWordsTab";
import AddWordModal from "./subcomponents/AddWordModal";
import ProgressStatsBar from "./subcomponents/ProgressStatsBar";
import type { VocabPageData } from "@/services/vocabulary.service";
import type { WordProgressStats } from "@/types/vocabulary";
import { useOwnWords } from "../hooks/useVocabulary";

interface TabItem {
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { label: "Theo Chủ Đề", icon: "📂" },
  { label: "Theo Cấp Độ", icon: "📊" },
  { label: "Yêu Thích", icon: "⭐" },
  { label: "Từ Của Tôi", icon: "✏️" },
];

interface VocabularyPageProps {
  data: VocabPageData;
}

export default function VocabularyPage({ data }: VocabularyPageProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // progressStats là state để cập nhật sau khi addWord thành công
  const [progressStats, setProgressStats] = useState<WordProgressStats | null>(
    data.progressStats,
  );

  // Fetch lại stats — gọi ngay sau khi backend tạo xong UserWord + WordProgress
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch("/api/proxy/word-progress/stats");
      const json = await res.json();
      if (json?.data) setProgressStats(json.data);
    } catch {
      // Stats lỗi không block UI
    }
  }, []);

  // Own words có thể mutate client-side
  const {
    words: ownWords,
    addWord,
    deleteWord,
    updateWord,
    saving,
  } = useOwnWords(data.ownWords, refreshStats, refreshStats); // ← refreshStats chạy sau addWord thành công (data.ownWords,onWordAdded?,onWordDeleted?)

  // Count cho từng tab — "Từ Của Tôi" đọc từ live state để cập nhật sau khi thêm/xoá
  const getTabCount = (index: number) => {
    if (index === 0) return data.topics.length;
    if (index === 1) return 6;
    if (index === 2) return data.favourites.length;
    if (index === 3) return ownWords.length;
    return 0;
  };

  const handleSaveWord = async (dto: Parameters<typeof addWord>[0]) => {
    await addWord(dto);
    setModalOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 3 },
          py: 2,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm từ vựng…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 200,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                fontSize: "13px",
                bgcolor: "background.default",
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disableElevation
            onClick={() => setModalOpen(true)}
            sx={{
              bgcolor: "primary.main",
              whiteSpace: "nowrap",
              px: 2,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Thêm từ của bạn
          </Button>
        </Stack>
      </Box>

      {/* ── Progress stats bar ───────────────────────────────── */}
      {progressStats && progressStats.total > 0 && (
        <ProgressStatsBar stats={progressStats} />
      )}

      {/* ── Tab bar ──────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 1, md: 2 },
          flexShrink: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: "#6c8fff" } }}
          sx={{
            "& .MuiTab-root": { color: "text.secondary", minHeight: 48 },
            "& .Mui-selected": { color: "primary.main !important" },
          }}
        >
          {TABS.map((tab, i) => (
            <Tab
              key={tab.label}
              label={
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <Chip
                    label={getTabCount(i)}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "10px",
                      fontWeight: 600,
                      bgcolor:
                        activeTab === i
                          ? "primary.main"
                          : "rgba(108,143,255,0.15)",
                      color: activeTab === i ? "white" : "primary.main",
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Content ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflow: "auto", px: { xs: 2, md: 3 }, py: 2.5 }}>
        {activeTab === 0 && <TopicTab topics={data.topics} search={search} />}
        {activeTab === 1 && <LevelTab levelGroups={data.levelGroups} />}
        {activeTab === 2 && <FavouriteTab initialFavs={data.favourites} />}
        {activeTab === 3 && (
          <OwnWordsTab
            words={ownWords}
            onAddWord={() => setModalOpen(true)}
            onDeleteWord={deleteWord}
            onUpdateWord={updateWord}
          />
        )}
      </Box>

      {/* ── Modal ────────────────────────────────────────────── */}
      <AddWordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveWord}
        saving={saving}
      />
    </Box>
  );
}
