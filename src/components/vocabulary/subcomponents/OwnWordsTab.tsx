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
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import type { OwnWord } from "@/types/vocabulary";
import EditWordModal from "./EditWordModal";

const SORTS = ["Mới nhất", "A → Z", "Cần ôn nhiều nhất"];

interface OwnWordsTabProps {
  words: OwnWord[];
  onAddWord: () => void;
  onDeleteWord: (id: string) => void;
  onUpdateWord: (id: string, dto: Partial<OwnWord>) => Promise<void>;
}

export default function OwnWordsTab({
  words,
  onAddWord,
  onDeleteWord,
  onUpdateWord,
}: OwnWordsTabProps) {
  const [sort, setSort] = useState("Mới nhất");
  const [editingWord, setEditingWord] = useState<OwnWord | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = [...words].sort((a, b) => {
    if (sort === "A → Z") return a.en.localeCompare(b.en);
    return 0;
  });

  const handleSaveEdit = async (id: string, dto: Partial<OwnWord>) => {
    setSaving(true);
    try {
      await onUpdateWord(id, dto);
      setEditingWord(null);
    } finally {
      setSaving(false);
    }
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
          Sắp xếp:
        </Typography>
        {SORTS.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
            onClick={() => setSort(s)}
            variant={sort === s ? "filled" : "outlined"}
            color={sort === s ? "primary" : "default"}
            sx={{
              borderColor: sort === s ? "primary.main" : "divider",
              cursor: "pointer",
              fontSize: "12px",
            }}
          />
        ))}
        <Box flex={1} />
        <Typography variant="body2" color="text.secondary">
          {words.length} từ
        </Typography>
      </Stack>

      <Grid container spacing={1.75}>
        {sorted.map((word, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={word.id}>
            <Card
              sx={{
                height: "100%",
                border: "1.5px dashed rgba(108,143,255,0.35)",
                animation: `fadeUp 0.35s ease ${i * 60}ms both`,
                "@keyframes fadeUp": {
                  from: { opacity: 0, transform: "translateY(10px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
                "&:hover": {
                  borderStyle: "solid",
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 3px rgba(108,143,255,0.08)",
                },
                transition: "all 0.15s",
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: 2.5, position: "relative" }}>
                <Chip
                  label="Từ của tôi"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: "rgba(108,143,255,0.1)",
                    color: "primary.main",
                    fontWeight: 600,
                    fontSize: "10px",
                    height: 20,
                  }}
                />
                <Typography
                  fontFamily="'Playfair Display', serif"
                  fontSize={20}
                  fontWeight={500}
                  mb={0.5}
                  pr={7}
                  lineHeight={1.2}
                >
                  {word.en}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1.25}
                >
                  {word.phonetic} · {word.type}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  lineHeight={1.6}
                  mb={1}
                >
                  {word.meaning}
                </Typography>
                {word.note && (
                  <Box
                    sx={{
                      bgcolor: "rgba(108,143,255,0.07)",
                      borderLeft: "3px solid",
                      borderColor: "primary.main",
                      borderRadius: "0 6px 6px 0",
                      px: 1.25,
                      py: 0.75,
                      mt: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="primary.main"
                      lineHeight={1.6}
                    >
                      💡 {word.note}
                    </Typography>
                  </Box>
                )}
                {word.status && (
                  <Chip
                    label={word.status}
                    size="small"
                    sx={{
                      mt: 1,
                      height: 18,
                      fontSize: "10px",
                      bgcolor:
                        word.status === "MASTERED"
                          ? "#e8f5e9"
                          : word.status === "LEARNING"
                            ? "#fff8e1"
                            : "rgba(0,0,0,0.06)",
                      color:
                        word.status === "MASTERED"
                          ? "#2e7d32"
                          : word.status === "LEARNING"
                            ? "#f57f17"
                            : "text.secondary",
                    }}
                  />
                )}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1.5}
                >
                  <Typography variant="caption" color="text.disabled">
                    Thêm vào: {word.addedDate}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 0.5,
                      }}
                      onClick={() => setEditingWord(word)}
                    >
                      <EditIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteWord(word.id)}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        p: 0.5,
                      }}
                    >
                      <DeleteOutlineIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Add card */}
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <Paper
            variant="outlined"
            onClick={onAddWord}
            sx={{
              height: "100%",
              minHeight: 180,
              border: "1.5px dashed rgba(108,143,255,0.3)",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              cursor: "pointer",
              transition: "all 0.15s",
              "&:hover": {
                borderColor: "primary.main",
                borderStyle: "solid",
                bgcolor: "rgba(108,143,255,0.03)",
              },
            }}
          >
            <AddIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            <Typography fontWeight={500} color="text.secondary" fontSize="13px">
              Thêm từ mới của bạn
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Ghi lại những từ bạn tự học được
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <EditWordModal
        open={!!editingWord}
        word={editingWord}
        onClose={() => setEditingWord(null)}
        onSave={handleSaveEdit}
        saving={saving}
      />
    </Box>
  );
}
