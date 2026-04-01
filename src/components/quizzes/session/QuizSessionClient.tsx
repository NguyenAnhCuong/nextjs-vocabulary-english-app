"use client";
// src/components/quiz/session/QuizSessionClient.tsx

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  LinearProgress,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useRouter } from "next/navigation";
import SectionHeader from "./SectionHeader";
import PronunciationQuestionCard from "./PronunciationQuestionCard";
import VocabularyQuestionCard from "./VocabularyQuestionCard";
import ReadingSection from "./ReadingSection";
import type { QuizDetail, AnswerMap, QuizScore } from "@/types/quiz";
import { computeScore } from "@/lib/quizUtils";
import QuizResultView from "../result/QuizResultView";
import QuizTimer from "../list/QuizTimer";

interface QuizSessionClientProps {
  quiz: QuizDetail;
}

async function submitToApi(
  quizId: string,
  answers: AnswerMap,
  timeTakenSeconds: number,
): Promise<QuizScore | null> {
  try {
    const res = await fetch(`/api/proxy/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers, timeTakenSeconds }),
    });
    const json = await res.json();
    return (json?.data?.score as QuizScore) ?? null;
  } catch {
    return null;
  }
}

export default function QuizSessionClient({ quiz }: QuizSessionClientProps) {
  const router = useRouter();
  const startTimeRef = useRef(Date.now());
  const answersRef = useRef<AnswerMap>({});
  const submittedRef = useRef(false);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<QuizScore | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const totalQ =
    quiz.pronunciationQuestions.length +
    quiz.vocabularyQuestions.length +
    quiz.readingQuestion.blanks.length;

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / totalQ) * 100);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(
    async (currentAnswers?: AnswerMap) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setTimerPaused(true);
      setSubmitting(true);

      const finalAnswers = currentAnswers ?? answersRef.current;
      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

      const apiScore = await submitToApi(quiz.id, finalAnswers, timeTaken);
      const finalScore =
        apiScore ?? computeScore(quiz, finalAnswers, timeTaken);

      setScore(finalScore);
      setSubmitting(false);
      setSubmitted(true);
    },
    [quiz],
  );

  // ── Navigation guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (submitted) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      setShowExitDialog(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [submitted]);

  const handleAnswer = useCallback((qId: string, val: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [qId]: val };
      answersRef.current = next;
      return next;
    });
  }, []);

  const confirmExitAndSubmit = () => {
    setShowExitDialog(false);
    doSubmit();
  };

  const confirmExitWithoutSubmit = () => {
    submittedRef.current = true;
    router.push("/quizzes");
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (submitted && score) {
    return (
      <QuizResultView
        quiz={quiz}
        answers={answers}
        score={score}
        showAnswers={showAnswers}
        onToggleAnswers={() => setShowAnswers((v) => !v)}
        onBack={() => router.push("/quizzes")}
        onRestart={() => {
          submittedRef.current = false;
          setAnswers({});
          setScore(null);
          setSubmitted(false);
          setShowAnswers(false);
          setTimerPaused(false);
          startTimeRef.current = Date.now();
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Sticky header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: 1.25,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={0.75}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title="Thoát bài làm">
              <IconButton
                size="small"
                onClick={() => setShowExitDialog(true)}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <Typography fontWeight={700} fontSize={14} noWrap>
                {quiz.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong
                  style={{
                    color: answeredCount === totalQ ? "#16a34a" : undefined,
                  }}
                >
                  {answeredCount}
                </strong>
                /{totalQ} đã trả lời
              </Typography>
            </Box>
          </Stack>
          <QuizTimer
            totalSeconds={quiz.durationMinutes * 60}
            onExpire={() => doSubmit()}
            paused={timerPaused}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{
            height: 3,
            borderRadius: 2,
            bgcolor: "rgba(0,0,0,0.06)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 2,
              bgcolor: "primary.main",
            },
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 860,
          mx: "auto",
          width: "100%",
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        <SectionHeader
          icon="🔊"
          title="Phần 1: Phát âm"
          subtitle="Chọn từ có phát âm KHÁC với các từ còn lại"
          count={quiz.pronunciationQuestions.length}
        />
        {quiz.pronunciationQuestions.map((q, i) => (
          <PronunciationQuestionCard
            key={q.id}
            question={q}
            globalIndex={i + 1}
            chosen={answers[q.id]}
            onAnswer={handleAnswer}
            submitted={submitted}
          />
        ))}

        <Box mt={4}>
          <SectionHeader
            icon="📖"
            title="Phần 2: Từ vựng"
            subtitle="Chọn đáp án đúng nhất cho mỗi câu hỏi"
            count={quiz.vocabularyQuestions.length}
          />
          {quiz.vocabularyQuestions.map((q, i) => (
            <VocabularyQuestionCard
              key={q.id}
              question={q}
              globalIndex={quiz.pronunciationQuestions.length + i + 1}
              chosen={answers[q.id]}
              onAnswer={handleAnswer}
              submitted={submitted}
            />
          ))}
        </Box>

        <Box mt={4}>
          <SectionHeader
            icon="📰"
            title="Phần 3: Đọc hiểu"
            subtitle="Điền từ phù hợp vào chỗ trống trong đoạn văn"
            count={quiz.readingQuestion.blanks.length}
          />
          <ReadingSection
            question={quiz.readingQuestion}
            answers={answers}
            onAnswer={handleAnswer}
            submitted={submitted}
          />
        </Box>

        {/* Submit bar */}
        <Box
          sx={{
            mt: 5,
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary" mb={2}>
            Đã trả lời{" "}
            <Box
              component="span"
              fontWeight={800}
              color={answeredCount === totalQ ? "success.main" : "text.primary"}
            >
              {answeredCount}/{totalQ}
            </Box>{" "}
            câu hỏi
            {answeredCount < totalQ && (
              <Box component="span" color="warning.main">
                {" "}
                — còn {totalQ - answeredCount} câu chưa trả lời
              </Box>
            )}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => doSubmit()}
            disabled={submitting}
            disableElevation
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {submitting ? "Đang chấm điểm…" : "📤 Nộp bài"}
          </Button>
        </Box>
      </Box>

      {/* Exit dialog */}
      <Dialog
        open={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogContent sx={{ textAlign: "center", pt: 4, pb: 2 }}>
          <Typography fontSize={48} mb={1}>
            ⚠️
          </Typography>
          <Typography fontWeight={800} fontSize={18} mb={1}>
            Bạn muốn thoát?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Khi thoát và nộp bài, kết quả sẽ được tính ngay với các câu đã trả
            lời.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1, px: 3, pb: 3 }}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            disableElevation
            onClick={confirmExitAndSubmit}
            disabled={submitting}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {submitting ? "Đang chấm điểm…" : "Nộp bài và thoát"}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setShowExitDialog(false)}
            sx={{
              borderRadius: 2,
              borderColor: "divider",
              color: "text.secondary",
            }}
          >
            Tiếp tục làm bài
          </Button>
          <Button
            fullWidth
            onClick={confirmExitWithoutSubmit}
            sx={{ color: "text.disabled", fontSize: 12 }}
          >
            Thoát không lưu kết quả
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
