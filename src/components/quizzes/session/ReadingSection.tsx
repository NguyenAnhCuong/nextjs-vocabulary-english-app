"use client";
// src/components/quiz/session/ReadingSection.tsx

import { Box, Typography, Stack, Paper, Chip, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { ReadingQuestion } from "@/types/quiz";
import { OPTION_LABELS } from "@/lib/quizUtils";

interface Props {
  question: ReadingQuestion;
  answers: Record<string, string>;
  onAnswer: (blankId: string, val: string) => void;
  submitted: boolean;
}

export default function ReadingSection({ question, answers, onAnswer, submitted }: Props) {
  // Parse passage → split on [BLANK1], [BLANK2], etc.
  const parts = question.passage.split(/(\[BLANK\d+\])/g);

  return (
    <Paper elevation={0} sx={{ border: "1.5px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
      {/* Passage */}
      <Box sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={1.5}>
          📰 {question.title}
        </Typography>
        <Typography variant="body1" lineHeight={2.2} color="text.primary">
          {parts.map((part, i) => {
            const match = part.match(/\[BLANK(\d+)\]/);
            if (!match) return <span key={i}>{part}</span>;

            const blankIndex = parseInt(match[1]) - 1;
            const blank = question.blanks[blankIndex];
            if (!blank) return <span key={i}>{part}</span>;

            const chosen = answers[blank.id];
            const isCorrect = chosen === blank.answer;

            let bg = "#e0e7ff";
            let color = "#4338ca";
            let border = "#a5b4fc";

            if (submitted) {
              bg = isCorrect ? "#d1fae5" : "#fee2e2";
              color = isCorrect ? "#065f46" : "#991b1b";
              border = isCorrect ? "#6ee7b7" : "#fca5a5";
            } else if (chosen) {
              bg = "#dbeafe"; color = "#1e40af"; border = "#93c5fd";
            }

            return (
              <Box
                key={i}
                component="span"
                sx={{
                  display: "inline-block",
                  minWidth: 100, textAlign: "center",
                  px: 1.25, py: 0.25, mx: 0.25,
                  bgcolor: bg, color, borderRadius: 1,
                  border: `1.5px dashed ${border}`,
                  fontWeight: 700, fontSize: "0.875rem",
                  verticalAlign: "middle",
                }}
              >
                {chosen ? (
                  <Stack direction="row" alignItems="center" spacing={0.25} justifyContent="center">
                    <span>{chosen}</span>
                    {submitted && (isCorrect
                      ? <CheckCircleIcon sx={{ fontSize: 14 }} />
                      : <CancelIcon sx={{ fontSize: 14 }} />)}
                  </Stack>
                ) : (
                  <span style={{ opacity: 0.5 }}>{blank.label}</span>
                )}
              </Box>
            );
          })}
        </Typography>
      </Box>

      {/* Blank selectors */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={2}>
          Chọn từ cho các chỗ trống:
        </Typography>
        <Stack spacing={2}>
          {question.blanks.map((blank, bi) => {
            const chosen = answers[blank.id];
            return (
              <Stack key={blank.id} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{ minWidth: 72, color: "primary.main", flexShrink: 0 }}
                >
                  {blank.label}:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {blank.options.map((opt, oi) => {
                    const isChosen = chosen === opt;
                    const isCorrect = opt === blank.answer;

                    let borderColor = "divider";
                    let bgcolor = "background.default";
                    let color = "text.primary";

                    if (submitted) {
                      if (isCorrect) { borderColor = "success.main"; bgcolor = "#d1fae5"; color = "#065f46"; }
                      else if (isChosen && !isCorrect) { borderColor = "error.main"; bgcolor = "#fee2e2"; color = "#991b1b"; }
                    } else if (isChosen) {
                      borderColor = "primary.main"; bgcolor = "#eff6ff"; color = "#1d4ed8";
                    }

                    return (
                      <Box
                        key={opt}
                        component="button"
                        onClick={() => !submitted && onAnswer(blank.id, opt)}
                        sx={{
                          display: "flex", alignItems: "center", gap: 0.75,
                          px: 1.25, py: 0.75,
                          border: "1.5px solid", borderColor,
                          borderRadius: 1.5, bgcolor, color,
                          cursor: submitted ? "default" : "pointer",
                          fontSize: 13, fontWeight: isChosen ? 700 : 400,
                          transition: "all 0.15s",
                          "&:hover": !submitted ? { borderColor: "primary.main", bgcolor: "#eff6ff" } : {},
                        }}
                      >
                        <Box sx={{
                          width: 20, height: 20, borderRadius: 0.75,
                          bgcolor: isChosen || (submitted && isCorrect) ? borderColor : "grey.200",
                          color: "#fff", display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0,
                        }}>
                          {OPTION_LABELS[oi]}
                        </Box>
                        {opt}
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
