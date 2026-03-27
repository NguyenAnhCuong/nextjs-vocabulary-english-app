"use client";

import { useState, useEffect, useCallback, useId } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminTopic {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  isActive: boolean;
  wordCount?: number;
}

interface AdminWord {
  id: string;
  en: string;
  type: string;
  level: string;
  meaning: string;
  isActive: boolean;
  wordTopics?: { topic: { id: string; name: string } }[];
}

const WORD_TYPES = [
  "NOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PHRASE",
  "CONJUNCTION",
  "PREPOSITION",
  "PRONOUN",
];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TYPE_LABELS: Record<string, string> = {
  NOUN: "Danh từ",
  VERB: "Động từ",
  ADJECTIVE: "Tính từ",
  ADVERB: "Phó từ",
  PHRASE: "Thành ngữ",
  CONJUNCTION: "Liên từ",
  PREPOSITION: "Giới từ",
  PRONOUN: "Đại từ",
};
const EMOJI_OPTIONS = [
  "📚",
  "💼",
  "✈️",
  "🍜",
  "🏥",
  "💻",
  "💬",
  "🎵",
  "🏠",
  "🌍",
  "🎨",
  "🔬",
  "⚽",
  "🎭",
  "🌿",
];
const COLOR_OPTIONS = [
  "#1565c0",
  "#2e7d32",
  "#f57f17",
  "#c62828",
  "#6a1b9a",
  "#00695c",
  "#e65100",
  "#37474f",
];

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Error ${res.status}`);
  return json?.data ?? json;
}

// ── Admin Panel Button ────────────────────────────────────────────────────────

export default function AdminPanel() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Quản trị (Admin)">
        <Button
          variant="outlined"
          startIcon={<AdminPanelSettingsIcon />}
          onClick={() => setOpen(true)}
          size="small"
          sx={{
            borderColor: "warning.main",
            color: "warning.main",
            "&:hover": {
              borderColor: "warning.dark",
              bgcolor: "rgba(237,108,2,0.05)",
            },
            whiteSpace: "nowrap",
            fontWeight: 600,
          }}
        >
          Admin
        </Button>
      </Tooltip>

      <AdminDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Admin Drawer ──────────────────────────────────────────────────────────────

function AdminDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(0);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 680, md: 780 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <AdminPanelSettingsIcon sx={{ color: "warning.main" }} />
        <Typography fontWeight={700} fontSize="16px" flex={1}>
          Quản trị nội dung
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: "#ed6c02" } }}
          sx={{ "& .Mui-selected": { color: "warning.main !important" } }}
        >
          <Tab label="📂 Chủ đề" />
          <Tab label="📖 Từ vựng" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {tab === 0 && <TopicsManager />}
        {tab === 1 && <WordsManager />}
      </Box>
    </Drawer>
  );
}

// ── Topics Manager ────────────────────────────────────────────────────────────

function TopicsManager() {
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTopic | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch<any>("/topics?current=1&pageSize=100");
      setTopics(res.result ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (dto: Partial<AdminTopic>) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await adminFetch(`/topics/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      } else {
        await adminFetch("/topics", {
          method: "POST",
          body: JSON.stringify(dto),
        });
      }
      await load();
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminFetch(`/topics/${id}`, { method: "DELETE" });
      await load();
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    }
    setDeleteConfirm(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography fontWeight={600}>{topics.length} chủ đề</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          disableElevation
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          sx={{
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          Thêm chủ đề
        </Button>
      </Stack>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={1}>
          {topics.map((topic) => (
            <Paper
              key={topic.id}
              variant="outlined"
              sx={{
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: `${topic.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {topic.emoji ?? "📁"}
              </Box>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: topic.color ?? "#ccc",
                  flexShrink: 0,
                }}
              />
              <Typography fontWeight={600} fontSize="14px" flex={1}>
                {topic.name}
              </Typography>
              <Chip
                label={topic.isActive ? "Hiện" : "Ẩn"}
                size="small"
                sx={{
                  bgcolor: topic.isActive ? "#e8f5e9" : "#f5f5f5",
                  color: topic.isActive ? "#2e7d32" : "#666",
                  fontSize: "11px",
                }}
              />
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditing(topic);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setDeleteConfirm(topic.id)}
                  sx={{ color: "error.main" }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Topic form dialog */}
      <TopicFormDialog
        open={dialogOpen}
        topic={editing}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete confirm */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
      >
        <DialogContent>
          <Typography>Xoá chủ đề này? Hành động không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Huỷ</Button>
          <Button
            onClick={() => handleDelete(deleteConfirm!)}
            color="error"
            variant="contained"
            disableElevation
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function TopicFormDialog({
  open,
  topic,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  topic: AdminTopic | null;
  onClose: () => void;
  onSave: (dto: any) => void;
  saving: boolean;
}) {
  const id = useId();
  const [form, setForm] = useState({
    name: "",
    emoji: "📚",
    color: "#1565c0",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (topic) {
      setForm({
        name: topic.name,
        emoji: topic.emoji ?? "📚",
        color: topic.color ?? "#1565c0",
        isActive: topic.isActive,
        sortOrder: 0,
      });
    } else {
      setForm({
        name: "",
        emoji: "📚",
        color: "#1565c0",
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [topic, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
        {topic ? "Sửa chủ đề" : "Thêm chủ đề mới"}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <TextField
            id={id}
            label="Tên chủ đề *"
            size="small"
            fullWidth
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            InputLabelProps={{ shrink: true }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={0.75}
              display="block"
            >
              Emoji
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {EMOJI_OPTIONS.map((e) => (
                <Box
                  key={e}
                  onClick={() => setForm((p) => ({ ...p, emoji: e }))}
                  sx={{
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: 20,
                    borderRadius: 1.5,
                    border: "2px solid",
                    borderColor:
                      form.emoji === e ? "warning.main" : "transparent",
                    bgcolor:
                      form.emoji === e ? "rgba(237,108,2,0.08)" : "transparent",
                  }}
                >
                  {e}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={0.75}
              display="block"
            >
              Màu
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {COLOR_OPTIONS.map((c) => (
                <Box
                  key={c}
                  onClick={() => setForm((p) => ({ ...p, color: c }))}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: c,
                    cursor: "pointer",
                    border: "3px solid",
                    borderColor:
                      form.color === c ? "text.primary" : "transparent",
                  }}
                />
              ))}
            </Stack>
          </Box>

          <FormControl size="small" fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={form.isActive ? "true" : "false"}
              label="Trạng thái"
              onChange={(e) =>
                setForm((p) => ({ ...p, isActive: e.target.value === "true" }))
              }
            >
              <MenuItem value="true">Hiện</MenuItem>
              <MenuItem value="false">Ẩn</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Huỷ
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={saving || !form.name.trim()}
          onClick={() => onSave(form)}
          startIcon={
            saving ? <CircularProgress size={14} color="inherit" /> : undefined
          }
          sx={{
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Words Manager ─────────────────────────────────────────────────────────────

function WordsManager() {
  const [words, setWords] = useState<AdminWord[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminWord | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const router = useRouter();
  const id = useId();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        current: String(page),
        pageSize: "20",
      });
      if (search) params.set("search", search);
      if (filterLevel) params.set("level", filterLevel);
      if (filterTopic) params.set("topicId", filterTopic);
      const res = await adminFetch<any>(`/words?${params}`);
      setWords(res.result ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, filterLevel, filterTopic, page]);

  const loadTopics = useCallback(async () => {
    try {
      const res = await adminFetch<any>("/topics?current=1&pageSize=100");
      setTopics(res.result ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, filterLevel, filterTopic]);

  const handleSave = async (dto: any) => {
    setSaving(true);
    try {
      if (editing?.id) {
        await adminFetch(`/words/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(dto),
        });
      } else {
        await adminFetch("/words", {
          method: "POST",
          body: JSON.stringify(dto),
        });
      }
      await load();
      setDialogOpen(false);
      setEditing(null);
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminFetch(`/words/${id}`, { method: "DELETE" });
      await load();
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    }
    setDeleteConfirm(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Filters */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        mb={2}
        alignItems="flex-start"
      >
        <TextField
          id={id}
          size="small"
          placeholder="Tìm từ…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 180 }}
        />
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Cấp độ</InputLabel>
          <Select
            value={filterLevel}
            label="Cấp độ"
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Chủ đề</InputLabel>
          <Select
            value={filterTopic}
            label="Chủ đề"
            onChange={(e) => setFilterTopic(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {topics.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.emoji} {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box flex={1} />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          disableElevation
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          sx={{
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
            whiteSpace: "nowrap",
          }}
        >
          Thêm từ
        </Button>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        mb={1}
        display="block"
      >
        {total} từ · trang {page}
      </Typography>

      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Table size="small" sx={{ "& td, & th": { fontSize: "13px" } }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": { fontWeight: 600, bgcolor: "background.default" },
                }}
              >
                <TableCell>Từ</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Cấp</TableCell>
                <TableCell>Nghĩa</TableCell>
                <TableCell>Chủ đề</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {words.map((word) => (
                <TableRow
                  key={word.id}
                  sx={{ "&:hover": { bgcolor: "background.default" } }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{word.en}</TableCell>
                  <TableCell>
                    <Chip
                      label={TYPE_LABELS[word.type] ?? word.type}
                      size="small"
                      sx={{ fontSize: "11px", height: 20 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={word.level}
                      size="small"
                      sx={{ fontSize: "11px", height: 20 }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {word.meaning}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {word.wordTopics?.slice(0, 2).map((wt) => (
                        <Chip
                          key={wt.topic.id}
                          label={wt.topic.name}
                          size="small"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      ))}
                      {(word.wordTopics?.length ?? 0) > 2 && (
                        <Chip
                          label={`+${(word.wordTopics?.length ?? 0) - 2}`}
                          size="small"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.25}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditing(word);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteConfirm(word.id)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Stack direction="row" justifyContent="center" spacing={1} mt={2}>
            <Button
              size="small"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Trước
            </Button>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              Trang {page} / {Math.ceil(total / 20)}
            </Typography>
            <Button
              size="small"
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau →
            </Button>
          </Stack>
        </>
      )}

      {/* Word form dialog */}
      <WordFormDialog
        open={dialogOpen}
        word={editing}
        topics={topics}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete confirm */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
      >
        <DialogContent>
          <Typography>
            Xoá từ này? (soft-delete, không ảnh hưởng dữ liệu user)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Huỷ</Button>
          <Button
            onClick={() => handleDelete(deleteConfirm!)}
            color="error"
            variant="contained"
            disableElevation
          >
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function WordFormDialog({
  open,
  word,
  topics,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  word: AdminWord | null;
  topics: AdminTopic[];
  onClose: () => void;
  onSave: (dto: any) => void;
  saving: boolean;
}) {
  const blank = {
    en: "",
    phonetic: "",
    type: "NOUN",
    level: "B2",
    meaning: "",
    meaningEn: "",
    example: "",
    exampleVi: "",
    topicIds: [] as string[],
  };
  const [form, setForm] = useState(blank);
  const id = useId();

  useEffect(() => {
    if (word) {
      setForm({
        en: word.en,
        phonetic: "",
        type: word.type,
        level: word.level,
        meaning: word.meaning,
        meaningEn: "",
        example: "",
        exampleVi: "",
        topicIds: word.wordTopics?.map((wt) => wt.topic.id) ?? [],
      });
    } else {
      setForm(blank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word, open]);

  const set = (f: keyof typeof form) => (e: any) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));
  const toggleTopic = (id: string) =>
    setForm((p) => ({
      ...p,
      topicIds: p.topicIds.includes(id)
        ? p.topicIds.filter((t) => t !== id)
        : [...p.topicIds, id],
    }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontSize: "16px", fontWeight: 600 }}>
        {word ? `Sửa từ "${word.en}"` : "Thêm từ vựng mới"}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5}>
            <TextField
              id={id}
              label="Từ tiếng Anh *"
              size="small"
              sx={{ flex: 1 }}
              value={form.en}
              onChange={set("en")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              id={id}
              label="Phiên âm"
              size="small"
              value={form.phonetic}
              onChange={set("phonetic")}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Loại từ</InputLabel>
              <Select value={form.type} label="Loại từ" onChange={set("type")}>
                {WORD_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {TYPE_LABELS[t] ?? t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Cấp độ</InputLabel>
              <Select value={form.level} label="Cấp độ" onChange={set("level")}>
                {LEVELS.map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <TextField
            id={id}
            label="Nghĩa tiếng Việt *"
            size="small"
            fullWidth
            value={form.meaning}
            onChange={set("meaning")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id={id}
            label="Nghĩa tiếng Anh"
            size="small"
            fullWidth
            value={form.meaningEn}
            onChange={set("meaningEn")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id={id}
            label="Câu ví dụ (EN)"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={form.example}
            onChange={set("example")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            id={id}
            label="Câu ví dụ (VI)"
            size="small"
            fullWidth
            value={form.exampleVi}
            onChange={set("exampleVi")}
            InputLabelProps={{ shrink: true }}
          />

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              mb={0.75}
              display="block"
            >
              Chủ đề
            </Typography>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {topics
                .filter((t) => t.isActive)
                .map((t) => (
                  <Chip
                    key={t.id}
                    label={`${t.emoji ?? ""} ${t.name}`}
                    size="small"
                    clickable
                    onClick={() => toggleTopic(t.id)}
                    variant={
                      form.topicIds.includes(t.id) ? "filled" : "outlined"
                    }
                    color={form.topicIds.includes(t.id) ? "warning" : "default"}
                    sx={{ fontSize: "12px" }}
                  />
                ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Huỷ
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={saving || !form.en.trim() || !form.meaning.trim()}
          onClick={() => onSave(form)}
          startIcon={
            saving ? <CircularProgress size={14} color="inherit" /> : undefined
          }
          sx={{
            bgcolor: "warning.main",
            "&:hover": { bgcolor: "warning.dark" },
          }}
        >
          {saving ? "Đang lưu…" : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
