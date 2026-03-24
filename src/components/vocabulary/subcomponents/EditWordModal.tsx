"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, MenuItem, Select,
  FormControl, InputLabel, IconButton, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { OwnWord } from "@/types/vocabulary";

type WordTypeKey = "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PHRASE" | "CONJUNCTION" | "PREPOSITION" | "PRONOUN";
type CefrLevel  = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

const WORD_TYPES: { value: WordTypeKey; label: string }[] = [
  { value: "NOUN",        label: "Danh từ" },
  { value: "VERB",        label: "Động từ" },
  { value: "ADJECTIVE",   label: "Tính từ" },
  { value: "ADVERB",      label: "Phó từ" },
  { value: "PHRASE",      label: "Thành ngữ" },
  { value: "CONJUNCTION", label: "Liên từ" },
  { value: "PREPOSITION", label: "Giới từ" },
  { value: "PRONOUN",     label: "Đại từ" },
];
const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

interface EditDto {
  en: string;
  phonetic?: string;
  type: WordTypeKey;
  level: CefrLevel;
  meaning: string;
  example?: string;
  note?: string;
}

interface EditWordModalProps {
  open: boolean;
  word: OwnWord | null;   // null = đóng
  onClose: () => void;
  onSave: (id: string, dto: EditDto) => Promise<void>;
  saving?: boolean;
}

export default function EditWordModal({ open, word, onClose, onSave, saving = false }: EditWordModalProps) {
  const [form, setForm] = useState<EditDto>({
    en: "", phonetic: "", type: "NOUN", level: "B2",
    meaning: "", example: "", note: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditDto, string>>>({});

  // Pre-fill form khi word thay đổi
  useEffect(() => {
    if (word) {
      setForm({
        en:       word.en ?? "",
        phonetic: word.phonetic ?? "",
        type:     (word.type as WordTypeKey) ?? "NOUN",
        level:    (word.level as CefrLevel)  ?? "B2",
        meaning:  word.meaning ?? "",
        example:  word.example ?? "",
        note:     word.note ?? "",
      });
      setErrors({});
    }
  }, [word]);

  const set = (field: keyof EditDto) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) =>
      setForm((p) => ({ ...p, [field]: e.target.value as string }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.en.trim())      e.en      = "Vui lòng nhập từ tiếng Anh";
    if (!form.meaning.trim()) e.meaning = "Vui lòng nhập nghĩa tiếng Việt";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!word || !validate()) return;
    try {
      await onSave(word.id, form);
      setErrors({});
    } catch (err: any) {
      setErrors({ en: err?.message ?? "Lưu thất bại, vui lòng thử lại!" });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}>
      <DialogTitle sx={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 500, pt: 2.5, px: 3, pb: 0 }}>
        Chỉnh sửa từ vựng
        <IconButton onClick={handleClose} size="small" sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Từ tiếng Anh *" fullWidth size="small"
              value={form.en} onChange={set("en")}
              error={!!errors.en} helperText={errors.en}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phiên âm" fullWidth size="small"
              value={form.phonetic} onChange={set("phonetic")}
              placeholder="e.g. /ˌserənˈdɪpɪti/"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại từ</InputLabel>
              <Select value={form.type} label="Loại từ" onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as WordTypeKey }))}>
                {WORD_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Cấp độ</InputLabel>
              <Select value={form.level} label="Cấp độ" onChange={(e) => setForm((p) => ({ ...p, level: e.target.value as CefrLevel }))}>
                {LEVELS.map((l) => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Nghĩa tiếng Việt *" fullWidth size="small"
              value={form.meaning} onChange={set("meaning")}
              error={!!errors.meaning} helperText={errors.meaning}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Câu ví dụ" fullWidth size="small" multiline rows={3}
              value={form.example} onChange={set("example")}
              placeholder="Viết một câu ví dụ bằng tiếng Anh…"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Ghi chú của bạn" fullWidth size="small" multiline rows={2}
              value={form.note} onChange={set("note")}
              placeholder="Bạn gặp từ này ở đâu? Cách nhớ từ này…"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          onClick={handleClose} variant="outlined"
          sx={{ borderColor: "divider", color: "text.secondary", py: 1.25, px: 3 }}
        >
          Huỷ
        </Button>
        <Button
          fullWidth variant="contained" onClick={handleSave} disableElevation
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{ py: 1.25, fontSize: "14px", bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
        >
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
