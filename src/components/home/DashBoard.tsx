"use client";

import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  LinearProgress,
  CircularProgress,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { signIn } from "next-auth/react";

// Mock data cho các trình độ
const levelData = [
  { id: "A1", label: "Beginner", progress: 500, total: 500, color: "#facc15" },
  { id: "A2", label: "Elementary", progress: 23, total: 500, color: "#4ade80" },
  {
    id: "B1",
    label: "Intermediate",
    progress: 156,
    total: 500,
    color: "#60a5fa",
  },
  {
    id: "B2",
    label: "Upper-Intermediate",
    progress: 23,
    total: 500,
    color: "#4b5563",
  },
  { id: "C1", label: "Advanced", progress: 0, total: 500, color: "#f87171" },
  { id: "C2", label: "Proficiency", progress: 0, total: 500, color: "#a855f7" },
];

export default function Dashboard() {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 1, md: 3 } }}>
      {/* SECTION 1: TOP CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Daily Progress */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 5,
              color: "white",
              position: "relative",
              overflow: "hidden",
              minHeight: 200,

              backgroundImage: `url("/assets/gif/banner-black-cat.gif")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay để chữ dễ đọc */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.55))",
              }}
            />

            {/* Content */}
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ width: "100%", textAlign: "left" }}
              >
                ● Daily Progress
              </Typography>

              <Box textAlign="center" mb={5}>
                <Typography variant="h4" fontWeight={800}>
                  Day 1
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Repeat Words */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 5,
              bgcolor: "#fbbf24", // Amber
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              minHeight: 200,
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{ width: "100%", textAlign: "left" }}
            >
              ★ Repeat Words
            </Typography>

            <Box sx={{ position: "relative", display: "inline-flex", mt: 2 }}>
              {/* Background circle */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={110}
                thickness={5}
                sx={{
                  color: "rgba(255,255,255,0.3)",
                }}
              />

              {/* Progress */}
              <CircularProgress
                variant="determinate"
                value={(13 / 118) * 100}
                size={110}
                thickness={5}
                sx={{
                  color: "white",
                  position: "absolute",
                  left: 0,
                }}
              />

              {/* Center text */}
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" fontWeight={800}>
                  13/118
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 2: MAIN ACTION BUTTON */}
      <Button
        fullWidth
        variant="contained"
        startIcon={<PlayArrowIcon />}
        sx={{
          py: 2,
          mb: 4,
          borderRadius: 4,
          bgcolor: "#84cc16",
          fontSize: "1.1rem",
          fontWeight: 700,
          textTransform: "none",
          "&:hover": { bgcolor: "#65a30d" },
        }}
        onClick={() => signIn()}
      >
        Learn New Words
      </Button>

      {/* SECTION 3: PROGRESS BY LEVELS */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <AssessmentIcon fontSize="small" color="action" />
        <Typography variant="h6" fontWeight={700} color="text.secondary">
          My Progress on Topics
        </Typography>
      </Box>

      <Stack spacing={2}>
        {levelData.map((level) => (
          <Paper
            key={level.id}
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* Level Icon Square */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                bgcolor: level.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography variant="h5" fontWeight={800} color="white">
                {level.id}
              </Typography>
            </Box>

            {/* Level Info */}
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography fontWeight={700}>{level.label}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {level.progress}/{level.total}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(level.progress / level.total) * 100}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  bgcolor: "#f1f5f9",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: level.color,
                    borderRadius: 5,
                  },
                }}
              />
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
