"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type WordTypeKey = "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PHRASE";
type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const WORD_TYPES: { value: WordTypeKey; label: string }[] = [
  { value: "NOUN", label: "Danh từ" },
  { value: "VERB", label: "Động từ" },
  { value: "ADJECTIVE", label: "Tính từ" },
  { value: "ADVERB", label: "Phó từ" },
  { value: "PHRASE", label: "Thành ngữ" },
];
const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface SaveDto {
  en: string;
  phonetic?: string;
  type: WordTypeKey;
  level: CefrLevel;
  meaning: string;
  example?: string;
  note?: string;
}

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: SaveDto) => Promise<void>;
  saving?: boolean;
}

const defaultForm: SaveDto = {
  en: "",
  phonetic: "",
  type: "NOUN",
  level: "B2",
  meaning: "",
  example: "",
  note: "",
};

export default function AddWordModal({
  open,
  onClose,
  onSave,
  saving = false,
}: AddWordModalProps) {
  const [form, setForm] = useState<SaveDto>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SaveDto, string>>>(
    {},
  );

  const set =
    (field: keyof SaveDto) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setForm((p) => ({ ...p, [field]: e.target.value as string }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.en.trim()) e.en = "Vui lòng nhập từ tiếng Anh";
    if (!form.meaning.trim()) e.meaning = "Vui lòng nhập nghĩa tiếng Việt";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      await onSave(form);
      setForm(defaultForm);
      setErrors({});
    } catch (err: any) {
      setErrors({ en: err?.message ?? "Lưu thất bại, vui lòng thử lại!" });
    }
  };

  const handleClose = () => {
    setForm(defaultForm);
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "20px",
          fontWeight: 500,
          pt: 2.5,
          px: 3,
          pb: 0,
        }}
      >
        Thêm từ của bạn
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "text.secondary",
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Từ tiếng Anh *"
              fullWidth
              size="small"
              value={form.en}
              onChange={set("en")}
              placeholder="e.g. Serendipity"
              error={!!errors.en}
              helperText={errors.en}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phiên âm"
              fullWidth
              size="small"
              value={form.phonetic}
              onChange={set("phonetic")}
              placeholder="e.g. /ˌserənˈdɪpɪti/"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại từ</InputLabel>
              <Select
                value={form.type}
                label="Loại từ"
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    type: e.target.value as WordTypeKey,
                  }))
                }
              >
                {WORD_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Cấp độ</InputLabel>
              <Select
                value={form.level}
                label="Cấp độ"
                onChange={(e) =>
                  setForm((p) => ({ ...p, level: e.target.value as CefrLevel }))
                }
              >
                {LEVELS.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Nghĩa tiếng Việt *"
              fullWidth
              size="small"
              value={form.meaning}
              onChange={set("meaning")}
              placeholder="e.g. Sự tình cờ may mắn"
              error={!!errors.meaning}
              helperText={errors.meaning}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Câu ví dụ"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.example}
              onChange={set("example")}
              placeholder="Viết một câu ví dụ bằng tiếng Anh…"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Ghi chú của bạn"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={form.note}
              onChange={set("note")}
              placeholder="Bạn gặp từ này ở đâu? Cách nhớ từ này…"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disableElevation
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          sx={{
            py: 1.25,
            fontSize: "14px",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          {saving ? "Đang lưu…" : "Lưu từ vựng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
