"use client";

import React, { useState } from "react";
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

interface TabItem {
  label: string;
  icon: string;
  count: number;
}

const TABS: TabItem[] = [
  { label: "Theo Chủ Đề", icon: "📂", count: 12 },
  { label: "Theo Cấp Độ", icon: "📊", count: 6 },
  { label: "Yêu Thích", icon: "⭐", count: 24 },
  { label: "Từ Của Tôi", icon: "✏️", count: 8 },
];

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
        fontFamily: "'Be Vietnam Pro', sans-serif",
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
                    label={tab.count}
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
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          px: { xs: 2, md: 3 },
          py: 2.5,
        }}
      >
        {activeTab === 0 && <TopicTab />}
        {activeTab === 1 && <LevelTab />}
        {activeTab === 2 && <FavouriteTab />}
        {activeTab === 3 && (
          <OwnWordsTab onAddWord={() => setModalOpen(true)} />
        )}
      </Box>

      {/* ── Modal ────────────────────────────────────────────── */}
      <AddWordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(word) => {
          console.log("Saved word:", word);
          // integrate with your state/API here
        }}
      />
    </Box>
  );
}
