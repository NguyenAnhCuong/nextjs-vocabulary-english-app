"use client";
// src/components/quiz/session/PronunciationQuestionCard.tsx

import { Box, Typography, Stack, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { PronunciationQuestion } from "@/types/quiz";
import { OPTION_LABELS } from "@/lib/quizUtils";

interface Props {
  question: PronunciationQuestion;
  globalIndex: number;
  chosen: string | undefined;
  onAnswer: (qId: string, val: string) => void;
  submitted: boolean;
}

export default function PronunciationQuestionCard({ question, globalIndex, chosen, onAnswer, submitted }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2, p: { xs: 2, sm: 2.5 },
        border: "1.5px solid",
        borderColor: chosen ? "primary.200" : "divider",
        borderRadius: 3,
        transition: "border-color 0.15s",
      }}
    >
      {/* Question */}
      <Stack direction="row" spacing={1.25} mb={2} alignItems="flex-start">
        <Box sx={{
          minWidth: 28, height: 28, bgcolor: "primary.main", color: "#fff",
          borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, flexShrink: 0,
        }}>
          {globalIndex}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} color="text.primary" lineHeight={1.6}>
            {question.question}
          </Typography>
          {question.phonetics && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
              {question.options.map((opt, i) => `${opt} ${question.phonetics?.[i] ?? ""}`).join(" · ")}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Options grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {question.options.map((opt, oi) => {
          const isChosen = chosen === opt;
          const isCorrect = opt === question.answer;

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
              onClick={() => !submitted && onAnswer(question.id, opt)}
              sx={{
                display: "flex", alignItems: "center", gap: 1,
                p: "10px 14px",
                border: "1.5px solid", borderColor,
                borderRadius: 2, bgcolor, color,
                cursor: submitted ? "default" : "pointer",
                textAlign: "left", transition: "all 0.15s",
                fontWeight: isChosen ? 700 : 400,
                "&:hover": !submitted ? { borderColor: "primary.main", bgcolor: "#eff6ff" } : {},
              }}
            >
              <Box sx={{
                minWidth: 24, height: 24, borderRadius: 1,
                bgcolor: isChosen || submitted ? borderColor : "divider",
                color: "#fff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {OPTION_LABELS[oi]}
              </Box>
              <Typography variant="body2" fontWeight={isChosen ? 700 : 400} sx={{ color }}>
                {opt}
              </Typography>
              {submitted && isCorrect && <CheckCircleIcon sx={{ fontSize: 16, color: "success.main", ml: "auto" }} />}
              {submitted && isChosen && !isCorrect && <CancelIcon sx={{ fontSize: 16, color: "error.main", ml: "auto" }} />}
            </Box>
          );
        })}
      </Box>

      {/* Explanation */}
      {submitted && (
        <Box sx={{ mt: 1.5, p: "10px 14px", bgcolor: "#fffbeb", borderRadius: 2, borderLeft: "3px solid", borderColor: "warning.main" }}>
          <Typography variant="caption" color="warning.dark" fontWeight={500}>
            💡 {question.explanation}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
