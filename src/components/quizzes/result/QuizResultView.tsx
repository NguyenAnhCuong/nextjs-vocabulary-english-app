"use client";
// src/components/quiz/result/QuizResultView.tsx

import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import type { QuizDetail, AnswerMap, QuizScore } from "@/types/quiz";
import { gradeColor, formatTime } from "@/lib/quizUtils";
import SectionHeader from "../session/SectionHeader";
import PronunciationQuestionCard from "../session/PronunciationQuestionCard";
import VocabularyQuestionCard from "../session/VocabularyQuestionCard";
import ReadingSection from "../session/ReadingSection";

interface Props {
  quiz: QuizDetail;
  answers: AnswerMap;
  score: QuizScore;
  showAnswers: boolean;
  onToggleAnswers: () => void;
  onBack: () => void;
  onRestart: () => void;
}

export default function QuizResultView({
  quiz,
  answers,
  score,
  showAnswers,
  onToggleAnswers,
  onBack,
  onRestart,
}: Props) {
  const gc = gradeColor(score.grade);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Score card */}
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          p: { xs: 3, sm: 4 },
          mb: 3,
          background: `linear-gradient(135deg, ${gc}0f, ${gc}1a)`,
          border: "2px solid",
          borderColor: `${gc}44`,
          borderRadius: 4,
        }}
      >
        {/* Grade badge */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: gc,
            color: "#fff",
            fontSize: 36,
            fontWeight: 900,
            fontFamily: "monospace",
            mb: 2,
            mx: "auto",
            boxShadow: `0 8px 24px ${gc}44`,
          }}
        >
          {score.grade}
        </Box>

        <Typography
          fontFamily="'Playfair Display', serif"
          fontSize={{ xs: 64, sm: 80 }}
          fontWeight={900}
          lineHeight={1}
          sx={{ color: gc, fontFamily: "monospace" }}
        >
          {score.percentScore}
        </Typography>
        <Typography fontSize={18} color={gc} fontWeight={600} mb={1}>
          điểm
        </Typography>
        <Typography fontSize={22} fontWeight={800} mb={0.5}>
          {score.gradeLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {score.totalCorrect}/{score.totalQuestions} câu đúng · {quiz.title}
        </Typography>
        <Typography
          variant="caption"
          color="text.disabled"
          display="block"
          mt={0.5}
        >
          Thời gian làm bài: {formatTime(score.timeTakenSeconds)}
        </Typography>
      </Paper>

      {/* Section breakdown */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={3}>
        {score.sections.map((sec) => {
          const pct = Math.round((sec.correct / sec.total) * 100);
          const c = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
          return (
            <Paper
              key={sec.label}
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              <Typography fontSize={28} mb={0.5}>
                {sec.icon}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                {sec.label}
              </Typography>
              <Typography
                fontSize={24}
                fontWeight={800}
                mt={0.5}
                sx={{ color: c }}
              >
                {sec.correct}
                <Typography
                  component="span"
                  fontSize={14}
                  color="text.disabled"
                  fontWeight={400}
                >
                  /{sec.total}
                </Typography>
              </Typography>
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  mt: 1,
                  height: 5,
                  borderRadius: 3,
                  bgcolor: "rgba(0,0,0,0.07)",
                  "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: c },
                }}
              />
            </Paper>
          );
        })}
      </Stack>

      {/* Action buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={4}>
        <Button
          variant="contained"
          onClick={onRestart}
          startIcon={<ReplayIcon />}
          disableElevation
          sx={{ flex: 1, py: 1.25, borderRadius: 2.5, fontWeight: 700 }}
        >
          Làm lại
        </Button>
        <Button
          variant={showAnswers ? "contained" : "outlined"}
          onClick={onToggleAnswers}
          startIcon={showAnswers ? <VisibilityOffIcon /> : <VisibilityIcon />}
          color={showAnswers ? "secondary" : "primary"}
          sx={{ flex: 1, py: 1.25, borderRadius: 2.5, fontWeight: 700 }}
        >
          {showAnswers ? "Ẩn đáp án" : "Xem đáp án"}
        </Button>
        <Button
          variant="outlined"
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            flex: 1,
            py: 1.25,
            borderRadius: 2.5,
            fontWeight: 700,
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          Về danh sách
        </Button>
      </Stack>

      {/* Answer review */}
      {showAnswers && (
        <Box>
          <Divider sx={{ mb: 3 }}>
            <Chip label="Xem lại đáp án" size="small" />
          </Divider>

          <SectionHeader
            icon="🔊"
            title="Phần 1: Phát âm"
            subtitle="Đáp án và giải thích"
            count={quiz.pronunciationQuestions.length}
          />
          {quiz.pronunciationQuestions.map((q, i) => (
            <PronunciationQuestionCard
              key={q.id}
              question={q}
              globalIndex={i + 1}
              chosen={answers[q.id]}
              onAnswer={() => {}}
              submitted={true}
            />
          ))}

          <Box mt={4}>
            <SectionHeader
              icon="📖"
              title="Phần 2: Từ vựng"
              subtitle="Đáp án và giải thích"
              count={quiz.vocabularyQuestions.length}
            />
            {quiz.vocabularyQuestions.map((q, i) => (
              <VocabularyQuestionCard
                key={q.id}
                question={q}
                globalIndex={quiz.pronunciationQuestions.length + i + 1}
                chosen={answers[q.id]}
                onAnswer={() => {}}
                submitted={true}
              />
            ))}
          </Box>

          <Box mt={4}>
            <SectionHeader
              icon="📰"
              title="Phần 3: Đọc hiểu"
              subtitle="Đáp án"
              count={quiz.readingQuestion.blanks.length}
            />
            <ReadingSection
              question={quiz.readingQuestion}
              answers={answers}
              onAnswer={() => {}}
              submitted={true}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
