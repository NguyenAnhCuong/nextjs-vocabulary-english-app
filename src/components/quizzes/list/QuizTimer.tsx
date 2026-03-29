"use client";
// src/components/quiz/session/QuizTimer.tsx

import { useEffect, useRef, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import { formatTime } from "@/lib/quizUtils";

interface QuizTimerProps {
  totalSeconds: number;
  onExpire: () => void;
  paused?: boolean;
}

export default function QuizTimer({ totalSeconds, onExpire, paused = false }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpire();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, onExpire]);

  const pct = (timeLeft / totalSeconds) * 100;
  const color =
    timeLeft > 300 ? "success.main" :
    timeLeft > 60  ? "warning.main" : "error.main";

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.75}
        sx={{
          px: 1.5, py: 0.75,
          border: "1.5px solid",
          borderColor: timeLeft <= 60 ? "error.main" : timeLeft <= 300 ? "warning.main" : "success.light",
          borderRadius: 2,
          bgcolor: timeLeft <= 60 ? "error.50" : "transparent",
          animation: timeLeft <= 30 ? "pulse 1s infinite" : "none",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.6 },
          },
        }}
      >
        <TimerIcon sx={{ fontSize: 18, color }} />
        <Typography
          fontFamily="monospace"
          fontWeight={800}
          fontSize={20}
          sx={{ color, letterSpacing: 1 }}
        >
          {formatTime(timeLeft)}
        </Typography>
      </Stack>
      {/* Mini progress */}
      <Box sx={{ height: 2, bgcolor: "divider", borderRadius: 1, mt: 0.5, overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            bgcolor: color,
            transition: "width 1s linear, bgcolor 0.5s",
          }}
        />
      </Box>
    </Box>
  );
}
