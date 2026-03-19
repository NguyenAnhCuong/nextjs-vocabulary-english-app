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
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CefrLevel, WordType } from "@/types/vocabulary";

interface AddWordModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (word: {
    en: string;
    phonetic: string;
    type: WordType;
    level: CefrLevel;
    meaning: string;
    example: string;
    note: string;
  }) => void;
}

const WORD_TYPES: WordType[] = [
  "Danh từ",
  "Động từ",
  "Tính từ",
  "Phó từ",
  "Thành ngữ",
];
const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const defaultForm = {
  en: "",
  phonetic: "",
  type: "Danh từ" as WordType,
  level: "B2" as CefrLevel,
  meaning: "",
  example: "",
  note: "",
};

export default function AddWordModal({
  open,
  onClose,
  onSave,
}: AddWordModalProps) {
  const [form, setForm] = useState(defaultForm);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSave = () => {
    if (!form.en.trim() || !form.meaning.trim()) return;
    onSave?.(form);
    setForm(defaultForm);
    onClose();
  };

  const handleClose = () => {
    setForm(defaultForm);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px", p: 0.5 },
      }}
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
            "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          {/* EN word + phonetic */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Từ tiếng Anh *"
              fullWidth
              size="small"
              value={form.en}
              onChange={handleChange("en")}
              placeholder="e.g. Serendipity"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Phiên âm"
              fullWidth
              size="small"
              value={form.phonetic}
              onChange={handleChange("phonetic")}
              placeholder="e.g. /ˌserənˈdɪpɪti/"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Type + Level */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại từ</InputLabel>
              <Select
                value={form.type}
                label="Loại từ"
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value as WordType }))
                }
              >
                {WORD_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
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

          {/* Meaning */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Nghĩa tiếng Việt *"
              fullWidth
              size="small"
              value={form.meaning}
              onChange={handleChange("meaning")}
              placeholder="e.g. Sự tình cờ may mắn"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Example */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Câu ví dụ"
              fullWidth
              size="small"
              multiline
              rows={3}
              value={form.example}
              onChange={handleChange("example")}
              placeholder="Viết một câu ví dụ bằng tiếng Anh…"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Note */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Ghi chú của bạn"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={form.note}
              onChange={handleChange("note")}
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
          sx={{
            py: 1.25,
            fontSize: "14px",
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Lưu từ vựng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
