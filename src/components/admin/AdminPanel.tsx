// src/components/admin/AdminPanel.tsx
"use client";

import {
  useState,
  useEffect,
  useCallback,
  useId,
  useRef,
  DragEvent,
} from "react";
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
  LinearProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

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

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface ParsedRow {
  en: string;
  phonetic?: string;
  type?: string;
  level?: string;
  meaning: string;
  example?: string;
  note?: string;
  topicName?: string; // ← tên chủ đề từ Excel, sẽ map sang topicId khi import
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

// ── XLSX column mapping ───────────────────────────────────────────────────────
// Các tên cột hợp lệ (case-insensitive, trim)
// Kiểm tra COL_MAP có đủ key chưa — thêm các alias còn thiếu
const COL_MAP: Record<string, keyof ParsedRow> = {
  en: "en",
  "từ tiếng anh": "en",
  "tiếng anh": "en",
  word: "en",
  phonetic: "phonetic",
  "phiên âm": "phonetic",
  type: "type",
  "loại từ": "type",
  "loai tu": "type",
  level: "level",
  "cấp độ": "level",
  "cap do": "level",
  meaning: "meaning",
  "nghĩa tiếng việt": "meaning",
  nghia: "meaning",
  nghĩa: "meaning",
  example: "example",
  "câu ví dụ": "example",
  "cau vi du": "example",
  note: "note",
  "ghi chú": "note",
  "ghi chu": "note",
  // ← Đảm bảo tất cả các alias của topics đều có
  topics: "topicName",
  topic: "topicName",
  "chủ đề": "topicName",
  "chu de": "topicName",
  chude: "topicName",
};

function parseExcel(
  file: File,
): Promise<{ rows: ParsedRow[]; fileName: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });

        // Ưu tiên sheet tên "Words", fallback sheet đầu tiên
        const sheetName = wb.SheetNames.includes("Words")
          ? "Words"
          : wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const raw: any[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: "",
        });

        if (raw.length < 2) {
          reject(
            new Error(
              "File không có dữ liệu (cần ít nhất 1 hàng dữ liệu sau header).",
            ),
          );
          return;
        }

        // Map header
        const headers = (raw[0] as string[]).map((h) =>
          String(h).trim().toLowerCase(),
        );
        const colIndex: Partial<Record<keyof ParsedRow, number>> = {};
        headers.forEach((h, i) => {
          const mapped = COL_MAP[h];
          if (mapped) colIndex[mapped] = i;
        });

        if (colIndex.en === undefined || colIndex.meaning === undefined) {
          reject(
            new Error(
              `Không tìm thấy cột bắt buộc "en" và "meaning". Header hiện tại: ${raw[0].join(", ")}`,
            ),
          );
          return;
        }

        const rows: ParsedRow[] = [];
        for (let i = 1; i < raw.length; i++) {
          const row = raw[i] as string[];
          const en = String(row[colIndex.en!] ?? "").trim();
          const meaning = String(row[colIndex.meaning!] ?? "").trim();
          if (!en || !meaning) continue; // Bỏ qua hàng rỗng

          rows.push({
            en,
            meaning,
            phonetic:
              colIndex.phonetic !== undefined
                ? String(row[colIndex.phonetic] ?? "").trim() || undefined
                : undefined,
            type:
              colIndex.type !== undefined
                ? String(row[colIndex.type] ?? "")
                    .trim()
                    .toUpperCase() || undefined
                : undefined,
            level:
              colIndex.level !== undefined
                ? String(row[colIndex.level] ?? "")
                    .trim()
                    .toUpperCase() || undefined
                : undefined,
            example:
              colIndex.example !== undefined
                ? String(row[colIndex.example] ?? "").trim() || undefined
                : undefined,
            note:
              colIndex.note !== undefined
                ? String(row[colIndex.note] ?? "").trim() || undefined
                : undefined,
            topicName:
              colIndex.topicName !== undefined
                ? String(row[colIndex.topicName] ?? "").trim() || undefined
                : undefined,
          });
        }

        resolve({ rows, fileName: file.name });
      } catch (err: any) {
        reject(new Error("Không thể đọc file: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Lỗi đọc file."));
    reader.readAsArrayBuffer(file);
  });
}

async function downloadTemplate(topics: AdminTopic[]) {
  // SheetJS không hỗ trợ Data Validation dropdown trực tiếp từ named range,
  // nên ta dùng kỹ thuật: ghi danh sách topics vào sheet ẩn "_ref",
  // rồi dùng formula1 trỏ vào đó.
  // Thay vào đó, dùng cách đơn giản hơn: liệt kê tên topics thành chuỗi cho formula1.

  const topicNames = topics.filter((t) => t.isActive).map((t) => t.name);
  const levelList = LEVELS.join(",");
  const typeList = WORD_TYPES.join(",");

  const wb = XLSX.utils.book_new();

  // ── Sheet "Words" ────────────────────────────────────────────────────────
  const headers = [
    "en",
    "phonetic",
    "type",
    "level",
    "meaning",
    "example",
    "note",
    "topics",
  ];
  const samples = [
    [
      "apple",
      "/ˈæp.əl/",
      "NOUN",
      "A1",
      "quả táo",
      "I eat an apple every day.",
      "",
      topicNames[0] ?? "",
    ],
    [
      "beautiful",
      "/ˈbjuː.tɪ.fəl/",
      "ADJECTIVE",
      "A2",
      "đẹp, xinh đẹp",
      "She has a beautiful smile.",
      "",
      "",
    ],
    [
      "accomplish",
      "/əˈkʌm.plɪʃ/",
      "VERB",
      "B2",
      "hoàn thành, đạt được",
      "We accomplished our goal.",
      "Formal",
      topicNames[1] ?? "",
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...samples]);

  ws["!cols"] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 10 },
    { wch: 28 },
    { wch: 38 },
    { wch: 28 },
    { wch: 30 },
  ];

  // Data Validation — SheetJS Pro hỗ trợ !dataValidations,
  // SheetJS CE (open source) cũng hỗ trợ từ v0.20+
  // Nếu không hoạt động với version cũ, dropdown vẫn hiển thị giá trị mẫu đúng
  ws["!dataValidations"] = [
    {
      // Type dropdown
      type: "list",
      sqref: "C2:C10000",
      formula1: `"${typeList}"`,
      showDropDown: false,
      showErrorMessage: true,
      error: `Giá trị hợp lệ: ${typeList}`,
      errorTitle: "Loại từ không hợp lệ",
    },
    {
      // Level dropdown
      type: "list",
      sqref: "D2:D10000",
      formula1: `"${levelList}"`,
      showDropDown: false,
      showErrorMessage: true,
      error: `Giá trị hợp lệ: ${levelList}`,
      errorTitle: "Cấp độ không hợp lệ",
    },
    ...(topicNames.length > 0
      ? [
          {
            // Topics dropdown
            type: "list" as const,
            sqref: "H2:H10000",
            formula1: `"${topicNames.join(",")}"`,
            showDropDown: false,
            showErrorMessage: false, // Cho phép nhập tự do nếu topic không có trong list
          },
        ]
      : []),
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Words");

  // ── Sheet "_ref" ẩn — liệt kê topics để người dùng tham khảo ───────────
  const refData = [
    ["Danh sách chủ đề hiện có"],
    ...topicNames.map((name) => [name]),
  ];
  const wsRef = XLSX.utils.aoa_to_sheet(refData);
  wsRef["!cols"] = [{ wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsRef, "Danh sách chủ đề");

  // ── Sheet "Hướng dẫn" ────────────────────────────────────────────────────
  const guideData = [
    ["Cột", "Mô tả"],
    ["en *", "Từ tiếng Anh (bắt buộc). Không được trùng với từ đã có."],
    ["phonetic", "Phiên âm IPA. Ví dụ: /ˈæp.əl/ (tuỳ chọn)"],
    ["type *", `Chọn từ dropdown: ${typeList}`],
    ["level *", `Chọn từ dropdown: ${levelList}`],
    ["meaning *", "Nghĩa tiếng Việt (bắt buộc)"],
    ["example", "Câu ví dụ tiếng Anh (tuỳ chọn)"],
    ["note", "Ghi chú (tuỳ chọn)"],
    [
      "topics",
      "Chọn 1 chủ đề từ dropdown. Xem sheet 'Danh sách chủ đề' để biết các chủ đề hiện có.",
    ],
    [],
    [
      "⚠️ Quan trọng",
      "Chỉ nhập dữ liệu vào sheet 'Words'. Không đổi tên cột hàng 1.",
    ],
    [
      "⚠️ Quan trọng",
      "Cột 'topics' chỉ hỗ trợ 1 chủ đề mỗi từ khi import hàng loạt.",
    ],
  ];
  const wsGuide = XLSX.utils.aoa_to_sheet(guideData);
  wsGuide["!cols"] = [{ wch: 22 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, "Hướng dẫn");

  XLSX.writeFile(wb, "word_import_template.xlsx");
}

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

      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          TabIndicatorProps={{ style: { backgroundColor: "#ed6c02" } }}
          sx={{ "& .Mui-selected": { color: "warning.main !important" } }}
        >
          <Tab label="📂 Chủ đề" />
          <Tab label="📖 Từ vựng" />
          <Tab label="⬆️ Import Excel" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {tab === 0 && <TopicsManager />}
        {tab === 1 && <WordsManager />}
        {tab === 2 && <ImportManager />}
      </Box>
    </Drawer>
  );
}

// ── Import Manager ────────────────────────────────────────────────────────────

type ImportStep = "idle" | "preview" | "importing" | "done" | "error";

function ImportManager() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>("idle");
  const [dragging, setDragging] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<{
    created: number;
    restored: number; // ← thêm
    skipped: number;
    errors: string[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch topics để map tên → id khi import, và để download template động
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);

  useEffect(() => {
    adminFetch<any>("/topics?current=1&pageSize=100")
      .then((res) => setTopics(res.result ?? []))
      .catch(() => {})
      .finally(() => setTopicsLoading(false));
  }, []);

  // Map tên topic (case-insensitive, trim) → id
  const topicNameToId = useCallback(
    (name: string): string | undefined => {
      if (!name) return undefined;
      const normalized = name.trim().toLowerCase();
      return topics.find((t) => t.name.trim().toLowerCase() === normalized)?.id;
    },
    [topics],
  );

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setParseError("Chỉ chấp nhận file .xlsx hoặc .xls");
      setStep("error");
      return;
    }
    setParseError("");
    try {
      const { rows, fileName: fn } = await parseExcel(file);
      if (rows.length === 0) {
        setParseError(
          "File không có hàng dữ liệu hợp lệ (cần có cột 'en' và 'meaning').",
        );
        setStep("error");
        return;
      }
      setParsedRows(rows);
      setFileName(fn);
      setStep("preview");
    } catch (err: any) {
      setParseError(err.message);
      setStep("error");
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleImport = async () => {
    setImporting(true);
    setStep("importing");
    try {
      const words = parsedRows.map((row) => {
        const topicId = row.topicName?.trim()
          ? topicNameToId(row.topicName)
          : undefined;

        return {
          en: row.en,
          phonetic: row.phonetic || undefined,
          type: (WORD_TYPES.includes(row.type ?? "")
            ? row.type
            : "NOUN") as string,
          level: (LEVELS.includes(row.level ?? "")
            ? row.level
            : "B2") as string,
          meaning: row.meaning,
          example: row.example || undefined,
          topicIds: topicId ? [topicId] : [],
        };
      });

      const res = await adminFetch<{
        created: number;
        restored: number;
        skipped: number;
        errors: string[];
      }>("/words/bulk", {
        method: "POST",
        body: JSON.stringify({ words }),
      });
      //@ts-ignore
      setResult({ restored: 0, ...res }); // restored từ backend, fallback 0 nếu backend cũ chưa trả về
      setStep("done");
      router.refresh(); // ← thêm dòng này
    } catch (err: any) {
      setParseError(err.message);
      setStep("error");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setStep("idle");
    setParsedRows([]);
    setFileName("");
    setParseError("");
    setResult(null);
  };

  // ── IDLE / ERROR ─────────────────────────────────────────────────────────
  if (step === "idle" || step === "error") {
    return (
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography fontWeight={700} fontSize="15px">
              Import từ vựng hàng loạt
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tải lên file Excel (.xlsx) để thêm nhiều từ cùng lúc vào hệ thống
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={
              topicsLoading ? <CircularProgress size={14} /> : <DownloadIcon />
            }
            disabled={topicsLoading}
            onClick={() => downloadTemplate(topics)}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              whiteSpace: "nowrap",
            }}
          >
            Tải file mẫu
          </Button>
        </Stack>

        {step === "error" && parseError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={reset}>
            {parseError}
          </Alert>
        )}

        {/* Drop zone */}
        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: dragging ? "warning.main" : "rgba(237,108,2,0.35)",
            borderRadius: 3,
            p: { xs: 4, sm: 6 },
            textAlign: "center",
            cursor: "pointer",
            bgcolor: dragging ? "rgba(237,108,2,0.04)" : "rgba(237,108,2,0.01)",
            transition: "all 0.18s",
            "&:hover": {
              borderColor: "warning.main",
              bgcolor: "rgba(237,108,2,0.04)",
            },
          }}
        >
          <UploadFileIcon
            sx={{
              fontSize: 52,
              color: dragging ? "warning.main" : "text.disabled",
              mb: 1.5,
            }}
          />
          <Typography
            fontWeight={600}
            fontSize="15px"
            color={dragging ? "warning.main" : "text.primary"}
          >
            {dragging ? "Thả file vào đây…" : "Kéo thả file Excel vào đây"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            hoặc{" "}
            <span style={{ color: "#ed6c02", fontWeight: 600 }}>
              nhấn để chọn file
            </span>
          </Typography>
          <Typography
            variant="caption"
            color="text.disabled"
            display="block"
            mt={1.5}
          >
            Chấp nhận: .xlsx, .xls · Tối đa 5 MB
          </Typography>
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {/* Column guide */}
        <Box mt={3}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            display="block"
            mb={1}
          >
            Cột bắt buộc:
          </Typography>
          <Stack
            direction="row"
            spacing={0.75}
            flexWrap="wrap"
            useFlexGap
            mb={0.75}
          >
            {["en *", "meaning *", "type *", "level *"].map((col) => (
              <Chip
                key={col}
                label={col}
                size="small"
                sx={{
                  bgcolor: "rgba(237,108,2,0.1)",
                  color: "warning.dark",
                  fontWeight: 600,
                  fontSize: "11px",
                }}
              />
            ))}
            {["phonetic", "example", "note", "topics"].map((col) => (
              <Chip
                key={col}
                label={col}
                size="small"
                variant="outlined"
                sx={{ borderColor: "divider", fontSize: "11px" }}
              />
            ))}
          </Stack>
          <Typography variant="caption" color="text.disabled" display="block">
            Cột <strong>topics</strong>: nhập tên chủ đề (khớp chính xác với
            danh sách chủ đề hiện có — xem sheet "Danh sách chủ đề" trong file
            mẫu)
          </Typography>
          {!topicsLoading && topics.filter((t) => t.isActive).length > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
              mt={0.75}
            >
              {topics
                .filter((t) => t.isActive)
                .map((t) => (
                  <Chip
                    key={t.id}
                    label={`${t.emoji ?? ""} ${t.name}`}
                    size="small"
                    sx={{
                      fontSize: "11px",
                      bgcolor: `${t.color}18`,
                      color: t.color ?? "text.secondary",
                    }}
                  />
                ))}
            </Stack>
          )}
        </Box>
      </Box>
    );
  }

  // ── PREVIEW ──────────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <Box sx={{ p: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Typography fontWeight={700} fontSize="15px">
              Xem trước dữ liệu
            </Typography>
            <Typography variant="caption" color="text.secondary">
              📄 {fileName} · <strong>{parsedRows.length}</strong> từ hợp lệ
            </Typography>
          </Box>
          <Button size="small" onClick={reset} sx={{ color: "text.secondary" }}>
            Chọn lại
          </Button>
        </Stack>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            mb: 2.5,
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{ "& td, & th": { fontSize: "12px" } }}
          >
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Từ (en)",
                  "Loại",
                  "Cấp",
                  "Nghĩa",
                  "Chủ đề",
                  "Ghi chú",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700,
                      bgcolor: "background.default",
                      py: 1,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedRows.slice(0, 50).map((row, i) => {
                const topicId = topicNameToId(row.topicName ?? "");
                const topicObj = topics.find((t) => t.id === topicId);
                const topicUnknown = row.topicName && !topicId;
                return (
                  <TableRow
                    key={i}
                    sx={{ "&:hover": { bgcolor: "background.default" } }}
                  >
                    <TableCell sx={{ color: "text.disabled" }}>
                      {i + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>
                      {row.en}
                    </TableCell>
                    <TableCell>
                      {row.type ? (
                        <Chip
                          label={row.type}
                          size="small"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      ) : (
                        <Chip
                          label="NOUN*"
                          size="small"
                          color="warning"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {row.level ? (
                        <Chip
                          label={row.level}
                          size="small"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      ) : (
                        <Chip
                          label="B2*"
                          size="small"
                          color="warning"
                          sx={{ fontSize: "10px", height: 18 }}
                        />
                      )}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.meaning}
                    </TableCell>
                    <TableCell>
                      {topicObj ? (
                        <Chip
                          label={`${topicObj.emoji ?? ""} ${topicObj.name}`}
                          size="small"
                          sx={{
                            fontSize: "10px",
                            height: 18,
                            bgcolor: `${topicObj.color}18`,
                            color: topicObj.color ?? undefined,
                          }}
                        />
                      ) : topicUnknown ? (
                        <Tooltip
                          title={`Không tìm thấy chủ đề "${row.topicName}" — sẽ bỏ qua`}
                        >
                          <Chip
                            label={`⚠️ ${row.topicName}`}
                            size="small"
                            color="warning"
                            sx={{ fontSize: "10px", height: 18 }}
                          />
                        </Tooltip>
                      ) : (
                        <span style={{ color: "#aaa" }}>—</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {row.note || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {parsedRows.length > 50 && (
            <Box
              sx={{
                px: 2,
                py: 1,
                bgcolor: "background.default",
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                ... và {parsedRows.length - 50} từ nữa
              </Typography>
            </Box>
          )}
        </Box>

        {/* Warnings summary */}
        {parsedRows.some((r) => r.topicName && !topicNameToId(r.topicName)) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Một số từ có tên chủ đề không khớp với danh sách hiện có — chủ đề
            của những từ đó sẽ bị bỏ qua khi import.
          </Alert>
        )}

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button onClick={reset} sx={{ color: "text.secondary" }}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleImport}
            sx={{
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
              px: 3,
            }}
          >
            Import {parsedRows.length} từ
          </Button>
        </Stack>
      </Box>
    );
  }

  // ── IMPORTING ────────────────────────────────────────────────────────────
  if (step === "importing") {
    return (
      <Box sx={{ p: 3, textAlign: "center", py: 8 }}>
        <CircularProgress sx={{ color: "warning.main" }} size={48} />
        <Typography fontWeight={600} mt={2.5}>
          Đang import {parsedRows.length} từ…
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Vui lòng không đóng cửa sổ này
        </Typography>
        <LinearProgress
          sx={{
            mt: 3,
            borderRadius: 2,
            "& .MuiLinearProgress-bar": { bgcolor: "warning.main" },
          }}
        />
      </Box>
    );
  }

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack alignItems="center" spacing={1.5} py={3}>
          <CheckCircleOutlineIcon sx={{ fontSize: 56, color: "#2e7d32" }} />
          <Typography fontWeight={700} fontSize="17px">
            Import hoàn tất!
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
          <Paper
            variant="outlined"
            sx={{
              px: 3,
              py: 2,
              textAlign: "center",
              borderRadius: 2,
              minWidth: 110,
            }}
          >
            <Typography fontSize={28} fontWeight={700} color="success.main">
              {result.created}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Từ đã thêm
            </Typography>
          </Paper>

          {/* ← Thêm card này */}
          {result.restored > 0 && (
            <Paper
              variant="outlined"
              sx={{
                px: 3,
                py: 2,
                textAlign: "center",
                borderRadius: 2,
                minWidth: 110,
              }}
            >
              <Typography fontSize={28} fontWeight={700} color="info.main">
                {result.restored}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đã khôi phục
              </Typography>
            </Paper>
          )}

          <Paper
            variant="outlined"
            sx={{
              px: 3,
              py: 2,
              textAlign: "center",
              borderRadius: 2,
              minWidth: 110,
            }}
          >
            <Typography fontSize={28} fontWeight={700} color="text.secondary">
              {result.skipped}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bỏ qua
            </Typography>
          </Paper>
        </Stack>
        {result.errors.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              {result.errors.length} dòng bị bỏ qua:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>
                  <Typography variant="caption">{e}</Typography>
                </li>
              ))}
              {result.errors.length > 10 && (
                <li>
                  <Typography variant="caption">
                    ... và {result.errors.length - 10} dòng nữa
                  </Typography>
                </li>
              )}
            </Box>
          </Alert>
        )}
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            disableElevation
            onClick={reset}
            sx={{
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
              px: 4,
            }}
          >
            Import tiếp
          </Button>
        </Stack>
      </Box>
    );
  }

  return null;
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
