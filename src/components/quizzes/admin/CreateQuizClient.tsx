"use client";
// src/components/quiz/admin/CreateQuizClient.tsx

import { useState, useId } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Step,
  Stepper,
  StepLabel,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter } from "next/navigation";
import type { CefrLevel } from "@/types/quiz";

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DEFAULT_PRON_QUESTION = "Từ nào có cách phát âm KHÁC với các từ còn lại?";
const STEP_TITLES = [
  "Thông tin",
  "Phát âm (5)",
  "Từ vựng",
  "Đọc hiểu",
  "Xem lại",
];

interface BasicInfo {
  title: string;
  description: string;
  level: CefrLevel;
  durationMinutes: number;
  tags: string;
}
interface PronQ {
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
  phonetics: [string, string, string, string];
}
interface VocabQ {
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation: string;
}
interface ReadingBlank {
  label: string;
  options: [string, string, string, string];
  answer: string;
}
interface ReadingQ {
  title: string;
  passage: string;
  blanks: ReadingBlank[];
}

const defaultPronQ = (): PronQ => ({
  question: DEFAULT_PRON_QUESTION,
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
  phonetics: ["", "", "", ""],
});
const defaultVocabQ = (): VocabQ => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
});
const defaultBlank = (i: number): ReadingBlank => ({
  label: `BLANK${i}`,
  options: ["", "", "", ""],
  answer: "",
});

function validatePron(qs: PronQ[]) {
  const e: string[] = [];
  if (qs.length !== 5) e.push("Cần đúng 5 câu phát âm");
  qs.forEach((q, i) => {
    if (q.options.some((o) => !o.trim()))
      e.push(`Phát âm ${i + 1}: điền đủ 4 từ`);
    if (!q.answer.trim()) e.push(`Phát âm ${i + 1}: chọn đáp án đúng`);
    if (!q.explanation.trim()) e.push(`Phát âm ${i + 1}: điền giải thích`);
  });
  return e;
}
function validateVocab(qs: VocabQ[]) {
  const e: string[] = [];
  if (qs.length < 1 || qs.length > 15) e.push("Cần 1–15 câu từ vựng");
  qs.forEach((q, i) => {
    if (!q.question.trim()) e.push(`Từ vựng ${i + 1}: điền nội dung câu hỏi`);
    if (q.options.some((o) => !o.trim()))
      e.push(`Từ vựng ${i + 1}: điền đủ 4 đáp án`);
    if (!q.answer.trim()) e.push(`Từ vựng ${i + 1}: chọn đáp án đúng`);
  });
  return e;
}
function validateReading(r: ReadingQ) {
  const e: string[] = [];
  if (!r.title.trim()) e.push("Điền tiêu đề bài đọc");
  if (!r.passage.trim()) e.push("Điền đoạn văn");
  const blankCount = (r.passage.match(/\[BLANK\d+\]/g) ?? []).length;
  if (blankCount !== r.blanks.length)
    e.push(
      `Đoạn văn có ${blankCount} [BLANK] nhưng có ${r.blanks.length} bộ đáp án`,
    );
  r.blanks.forEach((b, i) => {
    if (b.options.some((o) => !o.trim()))
      e.push(`Blank ${i + 1}: điền đủ 4 đáp án`);
    if (!b.answer.trim()) e.push(`Blank ${i + 1}: chọn đáp án đúng`);
  });
  return e;
}

function OptionChip({
  label,
  isAnswer,
  onClick,
}: {
  label: string;
  isAnswer: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        bgcolor: isAnswer ? "success.main" : "grey.200",
        color: isAnswer ? "#fff" : "text.secondary",
        fontWeight: 700,
        fontSize: 12,
      }}
    >
      {label}
    </Box>
  );
}

function StepPronunciation({
  questions,
  onChange,
}: {
  questions: PronQ[];
  onChange: (q: PronQ[]) => void;
}) {
  const id = useId();
  const update = (i: number, patch: Partial<PronQ>) => {
    const n = [...questions];
    n[i] = { ...n[i], ...patch };
    onChange(n);
  };
  const updateOpt = (qi: number, oi: number, v: string) => {
    const n = [...questions];
    const o = [...n[qi].options] as any;
    o[oi] = v;
    n[qi] = { ...n[qi], options: o };
    onChange(n);
  };
  const updatePh = (qi: number, oi: number, v: string) => {
    const n = [...questions];
    const p = [...n[qi].phonetics] as any;
    p[oi] = v;
    n[qi] = { ...n[qi], phonetics: p };
    onChange(n);
  };
  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Click vào nút <strong>A/B/C/D</strong> để đánh dấu từ phát âm KHÁC.
        Phonetics không bắt buộc.
      </Alert>
      {questions.map((q, qi) => (
        <Paper
          key={qi}
          elevation={0}
          sx={{
            p: 2.5,
            border: "1.5px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography
            fontWeight={700}
            fontSize={13}
            mb={1.5}
            color="primary.main"
          >
            🔊 Câu phát âm {qi + 1}
          </Typography>
          <TextField
            id={id}
            size="small"
            fullWidth
            label="Câu hỏi"
            value={q.question}
            onChange={(e) => update(qi, { question: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            display="block"
            mb={1}
          >
            4 TỪ + PHIÊN ÂM (tùy chọn):
          </Typography>
          <Stack spacing={1} mb={2}>
            {(["A", "B", "C", "D"] as const).map((lbl, oi) => (
              <Stack key={lbl} direction="row" spacing={1} alignItems="center">
                <OptionChip
                  label={lbl}
                  isAnswer={q.answer === q.options[oi] && !!q.options[oi]}
                  onClick={() => update(qi, { answer: q.options[oi] })}
                />
                <TextField
                  id={id}
                  size="small"
                  value={q.options[oi]}
                  onChange={(e) => updateOpt(qi, oi, e.target.value)}
                  placeholder={`Từ ${lbl}${q.answer === q.options[oi] && q.options[oi] ? " ✓" : ""}`}
                  sx={{ flex: 1 }}
                />
                <TextField
                  id={id}
                  size="small"
                  value={q.phonetics[oi]}
                  onChange={(e) => updatePh(qi, oi, e.target.value)}
                  placeholder="/fɪər/"
                  sx={{ width: 100, "& input": { fontSize: 12 } }}
                />
              </Stack>
            ))}
          </Stack>
          <TextField
            id={id}
            size="small"
            fullWidth
            label="Giải thích"
            multiline
            value={q.explanation}
            onChange={(e) => update(qi, { explanation: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder='"fear" /fɪər/ có âm /ɪ/, các từ còn lại đều có /eər/'
          />
        </Paper>
      ))}
    </Stack>
  );
}

function StepVocabulary({
  questions,
  onChange,
}: {
  questions: VocabQ[];
  onChange: (q: VocabQ[]) => void;
}) {
  const id = useId();
  const update = (i: number, patch: Partial<VocabQ>) => {
    const n = [...questions];
    n[i] = { ...n[i], ...patch };
    onChange(n);
  };
  const updateOpt = (qi: number, oi: number, v: string) => {
    const n = [...questions];
    const o = [...n[qi].options] as any;
    o[oi] = v;
    n[qi] = { ...n[qi], options: o };
    onChange(n);
  };
  const add = () => {
    if (questions.length < 15) onChange([...questions, defaultVocabQ()]);
  };
  const remove = (i: number) => {
    if (questions.length > 1) onChange(questions.filter((_, idx) => idx !== i));
  };
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Alert severity="info" sx={{ borderRadius: 2, flex: 1 }}>
          Click <strong>A/B/C/D</strong> để chọn đáp án đúng.
        </Alert>
        <Button
          startIcon={<AddIcon />}
          onClick={add}
          disabled={questions.length >= 15}
          sx={{ ml: 2, whiteSpace: "nowrap" }}
          variant="outlined"
          size="small"
        >
          Thêm ({questions.length}/15)
        </Button>
      </Stack>
      {questions.map((q, qi) => (
        <Paper
          key={qi}
          elevation={0}
          sx={{
            p: 2.5,
            border: "1.5px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
          >
            <Typography fontWeight={700} fontSize={13} color="primary.main">
              📖 Câu từ vựng {qi + 1}
            </Typography>
            <IconButton
              size="small"
              color="error"
              onClick={() => remove(qi)}
              disabled={questions.length <= 1}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
          <TextField
            id={id}
            size="small"
            fullWidth
            label="Câu hỏi *"
            multiline
            value={q.question}
            onChange={(e) => update(qi, { question: e.target.value })}
            sx={{ mb: 2 }}
            placeholder='VD: Chọn nghĩa đúng của từ "eloquent":'
            InputLabelProps={{ shrink: true }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            display="block"
            mb={1}
          >
            4 ĐÁP ÁN:
          </Typography>
          <Stack spacing={1} mb={1.5}>
            {(["A", "B", "C", "D"] as const).map((lbl, oi) => (
              <Stack key={lbl} direction="row" spacing={1} alignItems="center">
                <OptionChip
                  label={lbl}
                  isAnswer={q.answer === q.options[oi] && !!q.options[oi]}
                  onClick={() => update(qi, { answer: q.options[oi] })}
                />
                <TextField
                  id={id}
                  size="small"
                  value={q.options[oi]}
                  onChange={(e) => updateOpt(qi, oi, e.target.value)}
                  placeholder={`Đáp án ${lbl}`}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor:
                        q.answer === q.options[oi] && q.options[oi]
                          ? "#f0fdf4"
                          : "background.default",
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
          <TextField
            id={id}
            size="small"
            fullWidth
            label="Giải thích"
            value={q.explanation}
            onChange={(e) => update(qi, { explanation: e.target.value })}
            InputLabelProps={{ shrink: true }}
            placeholder="Giải thích tại sao đáp án đúng..."
          />
        </Paper>
      ))}
    </Stack>
  );
}

function StepReading({
  question,
  onChange,
}: {
  question: ReadingQ;
  onChange: (r: ReadingQ) => void;
}) {
  const id = useId();
  const updateBlankOpt = (bi: number, oi: number, v: string) => {
    const blanks = [...question.blanks];
    const o = [...blanks[bi].options] as any;
    o[oi] = v;
    blanks[bi] = { ...blanks[bi], options: o };
    onChange({ ...question, blanks });
  };
  const updateBlank = (bi: number, patch: Partial<ReadingBlank>) => {
    const blanks = [...question.blanks];
    blanks[bi] = { ...blanks[bi], ...patch };
    onChange({ ...question, blanks });
  };
  const addBlank = () => {
    if (question.blanks.length >= 8) return;
    onChange({
      ...question,
      blanks: [...question.blanks, defaultBlank(question.blanks.length + 1)],
    });
  };
  const removeBlank = (i: number) => {
    if (question.blanks.length <= 1) return;
    const blanks = question.blanks
      .filter((_, idx) => idx !== i)
      .map((b, idx) => ({ ...b, label: `BLANK${idx + 1}` }));
    onChange({ ...question, blanks });
  };
  const blankCount = (question.passage.match(/\[BLANK\d+\]/g) ?? []).length;
  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Dùng <strong>[BLANK1]</strong>, <strong>[BLANK2]</strong>… trong đoạn
        văn. Số lượng [BLANK] phải bằng số bộ đáp án.
      </Alert>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1.5px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <TextField
          id={id}
          size="small"
          fullWidth
          label="Tiêu đề bài đọc *"
          value={question.title}
          onChange={(e) => onChange({ ...question, title: e.target.value })}
          sx={{ mb: 2 }}
          placeholder="Bài đọc: Artificial Intelligence in Education"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          id={id}
          fullWidth
          label="Đoạn văn *"
          multiline
          rows={6}
          value={question.passage}
          onChange={(e) => onChange({ ...question, passage: e.target.value })}
          InputLabelProps={{ shrink: true }}
          placeholder="Artificial intelligence is rapidly [BLANK1] the landscape of education..."
        />
        <Stack direction="row" justifyContent="flex-end" mt={0.75}>
          <Typography
            variant="caption"
            color={
              blankCount !== question.blanks.length
                ? "error.main"
                : "text.disabled"
            }
          >
            {blankCount} [BLANK] trong văn · {question.blanks.length} bộ đáp án
            {blankCount !== question.blanks.length && " ← phải bằng nhau"}
          </Typography>
        </Stack>
      </Paper>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography fontWeight={700}>Đáp án cho từng chỗ trống</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addBlank}
          disabled={question.blanks.length >= 8}
          size="small"
          variant="outlined"
        >
          Thêm blank ({question.blanks.length}/8)
        </Button>
      </Stack>
      {question.blanks.map((blank, bi) => (
        <Paper
          key={bi}
          elevation={0}
          sx={{
            p: 2.5,
            border: "1.5px solid",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1.5}
          >
            <Chip
              label={blank.label}
              size="small"
              color="primary"
              sx={{ fontWeight: 700 }}
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => removeBlank(bi)}
              disabled={question.blanks.length <= 1}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Stack spacing={1}>
            {(["A", "B", "C", "D"] as const).map((lbl, oi) => (
              <Stack key={lbl} direction="row" spacing={1} alignItems="center">
                <OptionChip
                  label={lbl}
                  isAnswer={
                    blank.answer === blank.options[oi] && !!blank.options[oi]
                  }
                  onClick={() => updateBlank(bi, { answer: blank.options[oi] })}
                />
                <TextField
                  id={id}
                  size="small"
                  value={blank.options[oi]}
                  onChange={(e) => updateBlankOpt(bi, oi, e.target.value)}
                  placeholder={`Đáp án ${lbl}`}
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor:
                        blank.answer === blank.options[oi] && blank.options[oi]
                          ? "#f0fdf4"
                          : "background.default",
                    },
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

function StepReview({
  info,
  pronQs,
  vocabQs,
  reading,
}: {
  info: BasicInfo;
  pronQs: PronQ[];
  vocabQs: VocabQ[];
  reading: ReadingQ;
}) {
  const allErrors = [
    ...validatePron(pronQs),
    ...validateVocab(vocabQs),
    ...validateReading(reading),
  ];
  return (
    <Stack spacing={2.5}>
      {allErrors.length > 0 ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography fontWeight={700} mb={0.5}>
            Cần sửa trước khi lưu:
          </Typography>
          {allErrors.slice(0, 6).map((e, i) => (
            <Typography key={i} variant="body2">
              • {e}
            </Typography>
          ))}
          {allErrors.length > 6 && (
            <Typography variant="body2">
              ... và {allErrors.length - 6} lỗi khác
            </Typography>
          )}
        </Alert>
      ) : (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          ✅ Quiz hợp lệ — sẵn sàng lưu!
        </Alert>
      )}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography fontWeight={700} mb={1.5}>
          Thông tin cơ bản
        </Typography>
        {[
          ["Tên Quiz", info.title],
          ["Mô tả", info.description],
          ["Cấp độ", info.level],
          ["Thời gian", `${info.durationMinutes} phút`],
          ["Tags", info.tags || "—"],
        ].map(([l, v]) => (
          <Stack key={l} direction="row" spacing={2} mb={0.75}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 80 }}
            >
              {l}:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {v}
            </Typography>
          </Stack>
        ))}
      </Paper>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Typography fontWeight={700} mb={1.5}>
          Cấu trúc quiz
        </Typography>
        {[
          {
            icon: "🔊",
            label: "Phát âm",
            count: `${pronQs.length} câu`,
            ok: validatePron(pronQs).length === 0,
          },
          {
            icon: "📖",
            label: "Từ vựng",
            count: `${vocabQs.length} câu`,
            ok: validateVocab(vocabQs).length === 0,
          },
          {
            icon: "📰",
            label: "Đọc hiểu",
            count: `${reading.blanks.length} blank`,
            ok: validateReading(reading).length === 0,
          },
        ].map((s) => (
          <Stack
            key={s.label}
            direction="row"
            spacing={1.5}
            alignItems="center"
            mb={0.75}
          >
            <Typography fontSize={18}>{s.icon}</Typography>
            <Typography variant="body2" flex={1}>
              {s.label}: <strong>{s.count}</strong>
            </Typography>
            <Chip
              label={s.ok ? "✓ OK" : "✗ Lỗi"}
              size="small"
              sx={{
                bgcolor: s.ok ? "#d1fae5" : "#fee2e2",
                color: s.ok ? "#065f46" : "#991b1b",
                fontWeight: 700,
                fontSize: 11,
              }}
            />
          </Stack>
        ))}
      </Paper>
    </Stack>
  );
}

export default function CreateQuizClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [info, setInfo] = useState<BasicInfo>({
    title: "",
    description: "",
    level: "B1",
    durationMinutes: 30,
    tags: "",
  });
  const [pronQs, setPronQs] = useState<PronQ[]>(
    Array.from({ length: 5 }, defaultPronQ),
  );
  const [vocabQs, setVocabQs] = useState<VocabQ[]>(
    Array.from({ length: 5 }, defaultVocabQ),
  );
  const [reading, setReading] = useState<ReadingQ>({
    title: "",
    passage: "",
    blanks: Array.from({ length: 4 }, (_, i) => defaultBlank(i + 1)),
  });

  const setInfoField = (f: keyof BasicInfo) => (e: any) =>
    setInfo((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    const allErrors = [
      ...validatePron(pronQs),
      ...validateVocab(vocabQs),
      ...validateReading(reading),
    ];
    if (allErrors.length > 0) {
      setSaveError("Vui lòng sửa các lỗi trước khi lưu");
      return;
    }

    setSaving(true);
    setSaveError(null);

    const payload = {
      title: info.title,
      description: info.description,
      level: info.level,
      durationMinutes: Number(info.durationMinutes),
      tags: info.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isPublished: true,
      pronunciationQuestions: pronQs.map((q, i) => ({
        order: i + 1,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        ...(q.phonetics.some((p) => p.trim()) && { phonetics: q.phonetics }),
      })),
      vocabularyQuestions: vocabQs.map((q, i) => ({
        order: i + 6,
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      })),
      readingQuestion: {
        order: pronQs.length + vocabQs.length + 1,
        title: reading.title,
        passage: reading.passage,
        blanks: reading.blanks.map((b) => ({
          label: b.label,
          options: b.options,
          answer: b.answer,
        })),
      },
    };

    try {
      const res = await fetch("/api/proxy/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(json?.message)
          ? json.message.join(", ")
          : (json?.message ?? `Lỗi ${res.status}`);
        setSaveError(msg);
        setSaving(false);
        return;
      }
      const quizId = json?.data?.id;
      router.push(quizId ? `/quizzes/${quizId}` : "/quizzes");
    } catch (e: any) {
      setSaveError(e?.message ?? "Lỗi không xác định");
      setSaving(false);
    }
  };

  const id = useId();

  const canNext =
    step === 0
      ? info.title.trim().length > 0 && info.description.trim().length > 0
      : true;
  const stepLabels = [
    "Thông tin",
    "Phát âm (5)",
    `Từ vựng (${vocabQs.length})`,
    `Đọc hiểu (${reading.blanks.length})`,
    "Xem lại",
  ];

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/quizzes")}
          sx={{ color: "text.secondary" }}
        >
          Quay lại
        </Button>
        <Typography
          fontWeight={800}
          fontSize={20}
          fontFamily="'Playfair Display', serif"
        >
          Tạo Quiz mới
        </Typography>
      </Stack>

      <Stepper activeStep={step} sx={{ mb: 4 }} alternativeLabel>
        {stepLabels.map((label, i) => (
          <Step key={label} completed={step > i}>
            <StepLabel
              onClick={() => step > i && setStep(i)}
              sx={{ cursor: step > i ? "pointer" : "default" }}
            >
              <Typography variant="caption" fontWeight={step === i ? 700 : 400}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {saveError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setSaveError(null)}
        >
          {saveError}
        </Alert>
      )}

      <Box sx={{ minHeight: 300 }}>
        {step === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Stack spacing={2.5}>
              <TextField
                id={id}
                label="Tên Quiz *"
                fullWidth
                size="small"
                value={info.title}
                onChange={setInfoField("title")}
                placeholder="VD: Business English B2"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id={id}
                label="Mô tả *"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={info.description}
                onChange={setInfoField("description")}
                placeholder="Mô tả ngắn về nội dung..."
                InputLabelProps={{ shrink: true }}
              />
              <Stack direction="row" spacing={2}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Cấp độ</InputLabel>
                  <Select
                    value={info.level}
                    label="Cấp độ"
                    onChange={setInfoField("level")}
                  >
                    {LEVELS.map((l) => (
                      <MenuItem key={l} value={l}>
                        {l}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  id={id}
                  label="Thời gian (phút)"
                  type="number"
                  size="small"
                  value={info.durationMinutes}
                  onChange={setInfoField("durationMinutes")}
                  inputProps={{ min: 10, max: 90 }}
                  sx={{ flex: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <TextField
                id={id}
                label="Tags (phân cách dấu phẩy)"
                fullWidth
                size="small"
                value={info.tags}
                onChange={setInfoField("tags")}
                placeholder="VD: Kinh doanh, B2"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>
        )}
        {step === 1 && (
          <StepPronunciation questions={pronQs} onChange={setPronQs} />
        )}
        {step === 2 && (
          <StepVocabulary questions={vocabQs} onChange={setVocabQs} />
        )}
        {step === 3 && <StepReading question={reading} onChange={setReading} />}
        {step === 4 && (
          <StepReview
            info={info}
            pronQs={pronQs}
            vocabQs={vocabQs}
            reading={reading}
          />
        )}
      </Box>

      <Stack direction="row" justifyContent="space-between" mt={4}>
        <Button
          onClick={() =>
            step === 0 ? router.push("/quizzes") : setStep((s) => s - 1)
          }
          sx={{ color: "text.secondary" }}
        >
          {step === 0 ? "Huỷ" : "← Quay lại"}
        </Button>
        {step < stepLabels.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            disableElevation
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Tiếp theo →
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            disableElevation
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
            }}
          >
            {saving ? "Đang lưu…" : "💾 Lưu Quiz"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
