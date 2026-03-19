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
  Button,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { OWN_WORDS, OwnWord } from "@/types/vocabulary";

const SORTS = ["Mới nhất", "A → Z", "Cần ôn nhiều nhất"];

interface OwnWordsTabProps {
  onAddWord: () => void;
}

export default function OwnWordsTab({ onAddWord }: OwnWordsTabProps) {
  const [sort, setSort] = useState("Mới nhất");
  const [words, setWords] = useState<OwnWord[]>(OWN_WORDS);

  const deleteWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const sorted = [...words].sort((a, b) => {
    if (sort === "A → Z") return a.en.localeCompare(b.en);
    return 0;
  });

  return (
    <Box>
      {/* Toolbar */}
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
          {words.length} từ •{" "}
          <Typography
            component="span"
            variant="body2"
            color="primary.main"
            fontWeight={500}
          >
            +3 tuần này
          </Typography>
        </Typography>
      </Stack>

      <Grid container spacing={1.75}>
        {sorted.map((word, i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={word.id}>
            <Card
              sx={{
                height: "100%",
                border: "1.5px dashed rgba(108,143,255,0.35)",
                cursor: "pointer",
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
                {/* Label */}
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
                    letterSpacing: "0.04em",
                  }}
                />

                {/* Word */}
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

                {/* Meaning */}
                <Typography
                  variant="body2"
                  color="text.primary"
                  lineHeight={1.6}
                  mb={1}
                >
                  {word.meaning}
                </Typography>

                {/* Note */}
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

                {/* Footer */}
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
                    >
                      <EditIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteWord(word.id)}
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

        {/* Add new card */}
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
    </Box>
  );
}
