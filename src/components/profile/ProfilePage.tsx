// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Paper,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import { useAppTheme } from "@/theme/ThemeContext";

// ── Theme options ─────────────────────────────────────────────────────────────

const THEMES = [
  {
    key: "default",
    label: "Đại Dương",
    bg: "#f8fafc",
    accent: "#0ea5e9",
    dark: "#020617",
  },
  {
    key: "forest",
    label: "Rừng Xanh",
    bg: "#f0fdf4",
    accent: "#16a34a",
    dark: "#052e16",
  },
  {
    key: "sunset",
    label: "Hoàng Hôn",
    bg: "#fff7ed",
    accent: "#ea580c",
    dark: "#1c0a00",
  },
  {
    key: "rose",
    label: "Hoa Hồng",
    bg: "#fff1f2",
    accent: "#e11d48",
    dark: "#1a000a",
  },
  {
    key: "violet",
    label: "Tím Ngọc",
    bg: "#faf5ff",
    accent: "#7c3aed",
    dark: "#0d0020",
  },
  {
    key: "slate",
    label: "Đá Xám",
    bg: "#f8fafc",
    accent: "#475569",
    dark: "#0f172a",
  },
] as const;

type ThemeKey = (typeof THEMES)[number]["key"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message ?? `Lỗi ${res.status}`);
  return json?.data ?? json;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        borderColor: "divider",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: `0 4px 24px ${accent}18` },
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          px: 3,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ color: accent, display: "flex" }}>{icon}</Box>
        <Typography
          fontWeight={700}
          fontSize="13px"
          letterSpacing="0.04em"
          textTransform="uppercase"
          color="text.secondary"
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Paper>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;

  const { themeKey, theme, setThemeKey } = useAppTheme();

  // ── Name edit ────────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (user?.name) setNameValue(user.name);
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setNameSaving(true);
    setNameError("");
    try {
      await clientFetch(`/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: nameValue.trim() }),
      });
      await updateSession({ name: nameValue.trim() });
      setEditingName(false);
      showToast("Đã cập nhật tên thành công!");
    } catch (e: any) {
      setNameError(e.message);
    } finally {
      setNameSaving(false);
    }
  };

  // ── Password change ──────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async () => {
    setPwError("");
    if (!pwForm.current) {
      setPwError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setPwSaving(true);
    try {
      await clientFetch(`/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          password: pwForm.next,
          currentPassword: pwForm.current,
        }),
      });
      setPwForm({ current: "", next: "", confirm: "" });
      setPwSuccess(true);
      showToast("Đổi mật khẩu thành công!");
    } catch (e: any) {
      setPwError(e.message);
    } finally {
      setPwSaving(false);
    }
  };

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => setToast(msg);

  if (!session) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const isGoogleUser = user?.provider === "GOOGLE" || !!user?.googleId;

  return (
    <Box
      sx={{
        minHeight: "100%",
        bgcolor: theme.bg,
        transition: "background-color 0.4s ease",
        pb: 6,
      }}
    >
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 140, md: 180 },
          background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.accent}cc 100%)`,
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        {[...Array(4)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
              width: 120 + i * 80,
              height: 120 + i * 80,
              top: -40 - i * 30,
              right: -40 - i * 30,
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(to top, ${theme.bg}, transparent)`,
          }}
        />
      </Box>

      {/* ── Avatar + name header ─────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, maxWidth: 760, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "flex-end" }}
          spacing={2.5}
          sx={{ mt: "-36px", mb: 4 }}
        >
          {/* Avatar */}
          <Avatar
            src={user?.image ?? undefined}
            sx={{
              width: 96,
              height: 96,
              fontSize: 32,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              bgcolor: theme.accent,
              border: `4px solid ${theme.bg}`,
              boxShadow: `0 8px 32px ${theme.accent}44`,
              flexShrink: 0,
              transition: "box-shadow 0.3s",
            }}
          >
            {getInitials(user?.name)}
          </Avatar>

          <Box flex={1} pb={0.5}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", md: "1.875rem" },
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "text.primary",
              }}
            >
              {user?.name ?? "Người dùng"}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              {isGoogleUser && (
                <Chip
                  label="Google"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "10px",
                    fontWeight: 600,
                    bgcolor: `${theme.accent}15`,
                    color: theme.accent,
                  }}
                />
              )}
              <Chip
                label={user?.role === "ADMIN" ? "Admin" : "User"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "10px",
                  fontWeight: 600,
                  bgcolor:
                    user?.role === "ADMIN" ? "#fef3c7" : "rgba(0,0,0,0.06)",
                  color: user?.role === "ADMIN" ? "#92400e" : "text.secondary",
                }}
              />
            </Stack>
          </Box>
        </Stack>

        {/* ── Sections ──────────────────────────────────────────────────── */}
        <Stack spacing={2.5}>
          {/* Thông tin cá nhân */}
          <Section
            icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
            title="Thông tin cá nhân"
            accent={theme.accent}
          >
            <Stack spacing={2.5}>
              {/* Email — read only */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  display="block"
                  mb={0.75}
                >
                  Email
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: "rgba(0,0,0,0.03)",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <EmailOutlinedIcon
                    sx={{ fontSize: 16, color: "text.disabled" }}
                  />
                  <Typography fontSize="14px" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Stack>
              </Box>

              {/* Name — editable */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  display="block"
                  mb={0.75}
                >
                  Họ và tên
                </Typography>
                {editingName ? (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <TextField
                      size="small"
                      fullWidth
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      autoFocus
                      error={!!nameError}
                      helperText={nameError}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          fontSize: "14px",
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={handleSaveName}
                      disabled={nameSaving}
                      sx={{
                        bgcolor: theme.accent,
                        color: "white",
                        borderRadius: 1.5,
                        "&:hover": { bgcolor: theme.accent, opacity: 0.85 },
                        mt: 0.5,
                      }}
                    >
                      {nameSaving ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <CheckIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingName(false);
                        setNameValue(user?.name ?? "");
                        setNameError("");
                      }}
                      sx={{
                        bgcolor: "rgba(0,0,0,0.06)",
                        borderRadius: 1.5,
                        mt: 0.5,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      px: 2,
                      py: 1.25,
                      bgcolor: "rgba(0,0,0,0.03)",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: theme.accent,
                        bgcolor: `${theme.accent}08`,
                      },
                      transition: "all 0.15s",
                    }}
                    onClick={() => setEditingName(true)}
                  >
                    <PersonOutlineIcon
                      sx={{ fontSize: 16, color: "text.disabled" }}
                    />
                    <Typography fontSize="14px" flex={1}>
                      {user?.name || "—"}
                    </Typography>
                    <EditIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                  </Stack>
                )}
              </Box>

              {/* Password — masked */}
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  display="block"
                  mb={0.75}
                >
                  Mật khẩu
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    px: 2,
                    py: 1.25,
                    bgcolor: "rgba(0,0,0,0.03)",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <LockOutlinedIcon
                    sx={{ fontSize: 16, color: "text.disabled" }}
                  />
                  <Typography
                    fontSize="14px"
                    color="text.secondary"
                    letterSpacing="0.15em"
                  >
                    {"●".repeat(10)}
                  </Typography>
                  {isGoogleUser && (
                    <Chip
                      label="Đăng nhập Google"
                      size="small"
                      sx={{
                        ml: "auto",
                        fontSize: "10px",
                        height: 18,
                        bgcolor: "rgba(0,0,0,0.05)",
                        color: "text.disabled",
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Section>

          {/* Đổi mật khẩu — ẩn nếu là Google user */}
          {!isGoogleUser && (
            <Section
              icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
              title="Đổi mật khẩu"
              accent={theme.accent}
            >
              <Stack spacing={2}>
                {[
                  {
                    field: "current" as const,
                    label: "Mật khẩu hiện tại",
                    placeholder: "Nhập mật khẩu hiện tại",
                  },
                  {
                    field: "next" as const,
                    label: "Mật khẩu mới",
                    placeholder: "Tối thiểu 6 ký tự",
                  },
                  {
                    field: "confirm" as const,
                    label: "Xác nhận mật khẩu",
                    placeholder: "Nhập lại mật khẩu mới",
                  },
                ].map(({ field, label, placeholder }) => (
                  <Box key={field}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      display="block"
                      mb={0.75}
                    >
                      {label}
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={placeholder}
                      type={showPw[field] ? "text" : "password"}
                      value={pwForm[field]}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, [field]: e.target.value }))
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setShowPw((p) => ({ ...p, [field]: !p[field] }))
                              }
                            >
                              {showPw[field] ? (
                                <VisibilityOffIcon
                                  sx={{ fontSize: 16, color: "text.disabled" }}
                                />
                              ) : (
                                <VisibilityIcon
                                  sx={{ fontSize: 16, color: "text.disabled" }}
                                />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          fontSize: "14px",
                        },
                      }}
                    />
                  </Box>
                ))}

                {pwError && (
                  <Alert severity="error" sx={{ borderRadius: 2, py: 0.5 }}>
                    {pwError}
                  </Alert>
                )}
                {pwSuccess && (
                  <Alert severity="success" sx={{ borderRadius: 2, py: 0.5 }}>
                    Đổi mật khẩu thành công!
                  </Alert>
                )}

                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleChangePassword}
                  disabled={
                    pwSaving ||
                    !pwForm.current ||
                    !pwForm.next ||
                    !pwForm.confirm
                  }
                  startIcon={
                    pwSaving ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <LockOutlinedIcon />
                    )
                  }
                  sx={{
                    bgcolor: theme.accent,
                    "&:hover": { bgcolor: theme.accent, opacity: 0.88 },
                    "&:disabled": { bgcolor: "rgba(0,0,0,0.08)" },
                    borderRadius: 2,
                    alignSelf: "flex-start",
                    px: 3,
                  }}
                >
                  {pwSaving ? "Đang lưu…" : "Cập nhật mật khẩu"}
                </Button>
              </Stack>
            </Section>
          )}

          {/* Theme picker */}
          <Section
            icon={<PaletteOutlinedIcon sx={{ fontSize: 18 }} />}
            title="Giao diện"
            accent={theme.accent}
          >
            <Typography variant="body2" color="text.secondary" mb={2}>
              Chọn bảng màu cho trang học của bạn. Thay đổi được áp dụng ngay
              lập tức.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5} useFlexGap>
              {THEMES.map((t) => (
                <Box
                  key={t.key}
                  onClick={() => setThemeKey(t.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: 1.75,
                    py: 1,
                    borderRadius: 2.5,
                    border: "2px solid",
                    borderColor: themeKey === t.key ? t.accent : "divider",
                    cursor: "pointer",
                    bgcolor:
                      themeKey === t.key ? `${t.accent}10` : "transparent",
                    transition: "all 0.15s",
                    "&:hover": {
                      borderColor: t.accent,
                      bgcolor: `${t.accent}08`,
                    },
                  }}
                >
                  {/* Color dot */}
                  <Box sx={{ display: "flex", gap: 0.4 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: t.dark,
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: t.accent,
                      }}
                    />
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: t.bg,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  </Box>
                  <Typography
                    fontSize="13px"
                    fontWeight={themeKey === t.key ? 700 : 500}
                    color={themeKey === t.key ? t.accent : "text.primary"}
                  >
                    {t.label}
                  </Typography>
                  {themeKey === t.key && (
                    <CheckIcon
                      sx={{ fontSize: 14, color: t.accent, ml: "auto" }}
                    />
                  )}
                </Box>
              ))}
            </Stack>

            {/* Live preview strip */}
            <Box
              sx={{
                mt: 2.5,
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                height: 36,
                transition: "all 0.3s",
              }}
            >
              <Box
                sx={{
                  flex: 2,
                  bgcolor: theme.dark,
                  transition: "background-color 0.4s",
                }}
              />
              <Box
                sx={{
                  flex: 3,
                  bgcolor: theme.accent,
                  transition: "background-color 0.4s",
                }}
              />
              <Box
                sx={{
                  flex: 5,
                  bgcolor: theme.bg,
                  border: "none",
                  transition: "background-color 0.4s",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.disabled"
              mt={0.75}
              display="block"
            >
              Thanh màu: nền tối · nhấn · nền sáng
            </Typography>
          </Section>
        </Stack>
      </Box>

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setToast("")}
          sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
