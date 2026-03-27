"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import type { LevelGroup } from "@/types/vocabulary";

const FILTERS = ["Tất cả từ", "Chưa học", "Đang học", "Đã thuộc"];

interface LevelTabProps {
  levelGroups: LevelGroup[];
  onSessionComplete?: () => void;
}

export default function LevelTab({
  levelGroups,
  onSessionComplete,
}: LevelTabProps) {
  const [filter, setFilter] = useState("Tất cả từ");

  // Tập hợp wordId đã yêu thích từ data server
  const router = useRouter();

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
                px: 2,
                py: 1.5,
                "& .MuiAccordionSummary-content": {
                  m: 0,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                {/* LEVEL CHIP */}
                <Chip
                  label={grp.level}
                  size="small"
                  sx={{
                    bgcolor: grp.bgColor,
                    color: grp.textColor,
                    fontWeight: 700,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />

                {/* MAIN CONTENT */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={600} fontSize="14px">
                    {grp.nameVi} — {grp.nameEn}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {grp.desc}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 0.5,
                    minWidth: 80,
                  }}
                >
                  {/* STATS */}
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Typography
                      fontSize={15}
                      fontWeight={600}
                      color={grp.textColor}
                    >
                      {grp.totalWords}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tổng
                    </Typography>

                    <Typography fontSize={15} fontWeight={600}>
                      {grp.learnedWords}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Thuộc
                    </Typography>
                  </Stack>

                  {/* BUTTON */}
                  {!grp.locked && (
                    <Button
                      component="div" // ✅ QUAN TRỌNG
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation(); // ❗ tránh mở accordion
                        if (onSessionComplete)
                          (window as any).__onSessionComplete =
                            onSessionComplete;
                        router.push(`/learning/level/${grp.level}`);
                      }}
                      sx={{
                        minWidth: 0,
                        px: 1.5,
                        py: 0.25,
                        fontSize: { xs: "11px", sm: "14px" },
                        borderRadius: 1.5,
                        bgcolor: grp.color,
                        "&:hover": { bgcolor: grp.color, opacity: 0.9 },
                      }}
                    >
                      Học ngay
                    </Button>
                  )}
                </Box>
              </Box>
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
                    {grp.level === "B1" || grp.level === "B2"
                      ? "Hoàn thành A1 và A2 (≥70%) để mở khoá."
                      : "Hoàn thành A1, A2, B1 và B2 (≥70%) để mở khoá."}
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
