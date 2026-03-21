"use client";

import React, { useState } from "react";
import {
  Box,
  Stack,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import LockIcon from "@mui/icons-material/Lock";
import type { LevelGroup } from "@/types/vocabulary";
import { useFavStar } from "@/components/hooks/useVocabulary";

const FILTERS = ["Tất cả từ", "Chưa học", "Đang học", "Đã thuộc"];

interface LevelTabProps {
  levelGroups: LevelGroup[];
}

export default function LevelTab({ levelGroups }: LevelTabProps) {
  const [filter, setFilter] = useState("Tất cả từ");

  // Tập hợp wordId đã yêu thích từ data server
  const initialFavIds = new Set(
    levelGroups
      .flatMap((g) => g.words)
      .filter((w) => w.isFav)
      .map((w) => w.wordId ?? w.id),
  );

  const { favIds, toggle } = useFavStar(initialFavIds);

  if (!levelGroups.length) {
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary">Chưa có dữ liệu cấp độ.</Typography>
      </Box>
    );
  }

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
          Hiển thị:
        </Typography>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            size="small"
            onClick={() => setFilter(f)}
            variant={filter === f ? "filled" : "outlined"}
            color={filter === f ? "primary" : "default"}
            sx={{
              borderColor: filter === f ? "primary.main" : "divider",
              cursor: "pointer",
              fontSize: "12px",
            }}
          />
        ))}
      </Stack>

      <Stack spacing={1.5}>
        {levelGroups.map((grp, i) => (
          <Accordion
            key={grp.level}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px !important",
              overflow: "hidden",
              animation: `fadeUp 0.35s ease ${i * 60}ms both`,
              "@keyframes fadeUp": {
                from: { opacity: 0, transform: "translateY(10px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
              "&:before": { display: "none" },
              "&.Mui-expanded": { borderColor: grp.color },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2.5,
                py: 1,
                "&:hover": { bgcolor: "rgba(0,0,0,0.02)" },
                "& .MuiAccordionSummary-content": {
                  alignItems: "center",
                  gap: 2,
                  my: 1.5,
                },
              }}
            >
              <Chip
                label={grp.level}
                size="small"
                sx={{
                  bgcolor: grp.bgColor,
                  color: grp.textColor,
                  fontWeight: 700,
                  fontSize: "13px",
                  height: 30,
                  px: 0.5,
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <Box flex={1} minWidth={0}>
                <Typography fontWeight={600} fontSize="14px">
                  {grp.nameVi} — {grp.nameEn}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {grp.desc}
                </Typography>
              </Box>
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                sx={{ mr: 1 }}
              >
                <Box textAlign="right">
                  <Typography
                    fontFamily="'Playfair Display', serif"
                    fontSize={20}
                    fontWeight={500}
                    color={grp.textColor}
                    lineHeight={1}
                  >
                    {grp.totalWords}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Tổng từ
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography
                    fontFamily="'Playfair Display', serif"
                    fontSize={20}
                    fontWeight={500}
                    lineHeight={1}
                  >
                    {grp.learnedWords}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    Đã thuộc
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                px: 2.5,
                pb: 2.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {grp.locked ? (
                <Stack direction="row" alignItems="center" spacing={1} mt={1.5}>
                  <LockIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                  <Typography variant="body2" color="text.secondary">
                    Hoàn thành B2 trước để mở khóa cấp độ này.
                  </Typography>
                </Stack>
              ) : (
                <>
                  {grp.totalWords > 0 && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      mt={1.5}
                      mb={2}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={Math.round(
                          (grp.learnedWords / grp.totalWords) * 100,
                        )}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "rgba(0,0,0,0.07)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: grp.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color={grp.textColor}
                        minWidth={32}
                      >
                        {Math.round((grp.learnedWords / grp.totalWords) * 100)}%
                      </Typography>
                    </Stack>
                  )}

                  {grp.words.length === 0 ? (
                    <Typography variant="caption" color="text.disabled">
                      Chưa có từ nào trong cấp độ này.
                    </Typography>
                  ) : (
                    <Grid container spacing={1}>
                      {grp.words.map((word) => {
                        const wId = word.wordId ?? word.id;
                        return (
                          <Grid
                            size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                            key={word.id}
                          >
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.25,
                                borderRadius: 2,
                                cursor: "pointer",
                                bgcolor: "background.default",
                                borderColor: "divider",
                                "&:hover": { bgcolor: "#ece8e0" },
                                transition: "background 0.12s",
                                position: "relative",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => toggle(wId)}
                                sx={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  p: 0.25,
                                  color: favIds.has(wId)
                                    ? "#f5b342"
                                    : "text.disabled",
                                  "&:hover": {
                                    color: "#f5b342",
                                    bgcolor: "transparent",
                                  },
                                }}
                              >
                                {favIds.has(wId) ? (
                                  <StarIcon sx={{ fontSize: 14 }} />
                                ) : (
                                  <StarBorderIcon sx={{ fontSize: 14 }} />
                                )}
                              </IconButton>
                              <Typography
                                fontWeight={600}
                                fontSize="13px"
                                pr={2}
                              >
                                {word.en}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {word.vi}
                              </Typography>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
}
