"use client";
// src/components/quiz/admin/CreateQuizClient.tsx

import { useState } from "react";
import {
  Box, Typography, Stack, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Paper, Chip,
  Step, Stepper, StepLabel, Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/navigation";
import type { CefrLevel } from "@/types/quiz";

const STEPS = ["Thông tin cơ bản", "Câu hỏi", "Xem lại & Lưu"];
const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface BasicInfo {
  title: string;
  description: string;
  level: CefrLevel;
  durationMinutes: number;
  tags: string;
}

export default function CreateQuizClient() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [info, setInfo] = useState<BasicInfo>({
    title: "", description: "", level: "B1", durationMinutes: 30, tags: "",
  });

  const setField = (f: keyof BasicInfo) => (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
    setInfo((p) => ({ ...p, [f]: e.target.value }));

  const canNext = activeStep === 0 ? info.title.trim().length > 0 && info.description.trim().length > 0 : true;

  const handleSave = async () => {
    setSaving(true);
    // TODO: POST /api/proxy/quizzes
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    router.push("/quizzes");
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/quizzes")}
          sx={{ color: "text.secondary" }}
        >
          Quay lại
        </Button>
        <Typography fontWeight={800} fontSize={20} fontFamily="'Playfair Display', serif">
          Tạo Quiz mới
        </Typography>
      </Stack>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Basic info */}
      {activeStep === 0 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Stack spacing={2.5}>
            <TextField
              label="Tên Quiz *"
              fullWidth size="small"
              value={info.title}
              onChange={setField("title")}
              placeholder="VD: Business English B2"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Mô tả"
              fullWidth size="small" multiline rows={2}
              value={info.description}
              onChange={setField("description")}
              placeholder="Mô tả ngắn về nội dung bài quiz..."
              InputLabelProps={{ shrink: true }}
            />
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Cấp độ</InputLabel>
                <Select value={info.level} label="Cấp độ" onChange={setField("level") as any}>
                  {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Thời gian (phút)"
                type="number"
                size="small"
                value={info.durationMinutes}
                onChange={setField("durationMinutes")}
                inputProps={{ min: 10, max: 90 }}
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField
              label="Tags (phân cách bằng dấu phẩy)"
              fullWidth size="small"
              value={info.tags}
              onChange={setField("tags")}
              placeholder="VD: Kinh doanh, B2, Đọc hiểu"
              InputLabelProps={{ shrink: true }}
            />

            {/* Structure info */}
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={700} mb={0.5}>📋 Cấu trúc Quiz:</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                <li><Typography variant="body2">5 câu phát âm — chọn từ phát âm KHÁC với các từ còn lại</Typography></li>
                <li><Typography variant="body2">Tối đa 15 câu từ vựng — MCQ 4 đáp án</Typography></li>
                <li><Typography variant="body2">1 bài đọc hiểu — điền từ vào chỗ trống (4-8 blank)</Typography></li>
              </Box>
            </Alert>
          </Stack>
        </Paper>
      )}

      {/* Step 2: Questions */}
      {activeStep === 1 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3, textAlign: "center" }}>
          <Typography fontSize={48} mb={2}>🚧</Typography>
          <Typography fontWeight={700} fontSize={18} mb={1}>Trình soạn thảo câu hỏi</Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Thêm câu hỏi phát âm, từ vựng và bài đọc hiểu tại đây.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2, textAlign: "left" }}>
            Tính năng soạn thảo câu hỏi inline đang phát triển. Tạm thời sử dụng API hoặc import JSON.
          </Alert>
        </Paper>
      )}

      {/* Step 3: Review */}
      {activeStep === 2 && (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Typography fontWeight={700} fontSize={16} mb={2}>Xem lại thông tin Quiz</Typography>
          <Stack spacing={1.5}>
            {[
              ["Tên Quiz", info.title || "—"],
              ["Mô tả", info.description || "—"],
              ["Cấp độ", info.level],
              ["Thời gian", `${info.durationMinutes} phút`],
              ["Tags", info.tags || "Chưa có"],
            ].map(([label, value]) => (
              <Stack key={label} direction="row" spacing={2} alignItems="flex-start">
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, flexShrink: 0 }}>{label}:</Typography>
                <Typography variant="body2" fontWeight={600}>{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Navigation */}
      <Stack direction="row" justifyContent="space-between" mt={3}>
        <Button
          onClick={() => activeStep === 0 ? router.push("/quizzes") : setActiveStep((s) => s - 1)}
          sx={{ color: "text.secondary" }}
        >
          {activeStep === 0 ? "Huỷ" : "← Quay lại"}
        </Button>
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canNext}
            onClick={() => setActiveStep((s) => s + 1)}
            disableElevation
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Tiếp theo →
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            disableElevation
            sx={{ bgcolor: "warning.main", "&:hover": { bgcolor: "warning.dark" }, borderRadius: 2, fontWeight: 700 }}
          >
            {saving ? "Đang lưu…" : "💾 Lưu Quiz"}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
