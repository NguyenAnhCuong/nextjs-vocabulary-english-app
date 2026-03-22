// src/components/InstallBanner.tsx
"use client";

import { useState } from "react";
import { Box, Button, Typography, IconButton, Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";
import { usePWAInstall } from "./hooks/usePWAInstall";

export default function InstallBanner() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Không hiện nếu: đã cài, đã bỏ qua, không hỗ trợ
  if (isInstalled || dismissed || !isInstallable) return null;

  const handleInstall = async () => {
    const accepted = await install();
    if (!accepted) setDismissed(true);
  };

  return (
    <Slide direction="up" in={true} mountOnEnter>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 0, sm: 16 },
          left: { xs: 0, sm: 16 },
          right: { xs: 0, sm: "auto" },
          zIndex: 1400,
          bgcolor: "#1a1f2e",
          color: "white",
          borderRadius: { xs: "16px 16px 0 0", sm: 3 },
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
          maxWidth: { sm: 360 },
          // Safe area bottom
          paddingBottom: {
            xs: "calc(env(safe-area-inset-bottom) + 16px)",
            sm: 2,
          },
        }}
      >
        {/* App icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#6c8fff22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          📖
        </Box>

        {/* Text */}
        <Box flex={1} minWidth={0}>
          <Typography fontSize="13px" fontWeight={600}>
            Cài WordWise về máy
          </Typography>
          <Typography fontSize="11px" color="rgba(255,255,255,0.6)">
            Truy cập nhanh, dùng được offline
          </Typography>
        </Box>

        {/* Buttons */}
        <Button
          size="small"
          variant="contained"
          onClick={handleInstall}
          startIcon={<GetAppIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: "#6c8fff",
            color: "white",
            fontWeight: 600,
            fontSize: "12px",
            px: 1.5,
            "&:hover": { bgcolor: "#5a7aee" },
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          Cài ngay
        </Button>

        <IconButton
          size="small"
          onClick={() => setDismissed(true)}
          sx={{ color: "rgba(255,255,255,0.5)", p: 0.5, flexShrink: 0 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Slide>
  );
}
