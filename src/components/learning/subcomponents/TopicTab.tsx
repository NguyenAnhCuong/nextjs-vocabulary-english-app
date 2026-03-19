"use client";

import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
} from "@mui/material";
import { TOPICS } from "@/types/vocabulary";

const FILTERS = ["Tất cả", "Đang học", "Hoàn thành", "Mới", "📌 Đã lưu"];

export default function TopicTab() {
  const [filter, setFilter] = useState("Tất cả");

  const filtered = TOPICS.filter((t) => {
    if (filter === "Tất cả") return true;
    if (filter === "Mới") return t.isNew;
    if (filter === "Hoàn thành") return t.progress === 100;
    if (filter === "Đang học") return t.progress > 0 && t.progress < 100;
    return true;
  });

  const popular = filtered.filter((_, i) => i < 6);
  const other = filtered.filter((_, i) => i >= 6);

  return (
    <Box>
      {/* Filter chips */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        mb={3}
        useFlexGap
      >
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ mr: 0.5 }}
        >
          Lọc:
        </Typography>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            size="small"
            onClick={() => setFilter(f)}
            variant={filter === f ? "filled" : "outlined"}
            color={filter === f ? "primary" : "default"}
            sx={{
              borderColor: filter === f ? "primary.main" : "divider",
              cursor: "pointer",
              fontSize: "12px",
            }}
          />
        ))}
      </Stack>

      {/* Popular topics */}
      <SectionLabel>Chủ đề phổ biến</SectionLabel>
      <Grid container spacing={1.5} mb={1}>
        {popular.map((topic, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={topic.id}>
            <TopicCard topic={topic} delay={i * 40} />
          </Grid>
        ))}
      </Grid>

      {other.length > 0 && (
        <>
          <SectionLabel sx={{ mt: 2.5 }}>Chủ đề khác</SectionLabel>
          <Grid container spacing={1.5}>
            {other.map((topic, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }} key={topic.id}>
                <TopicCard topic={topic} delay={i * 40} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}

function SectionLabel({
  children,
  sx,
}: {
  children: React.ReactNode;
  sx?: object;
}) {
  return (
    <Typography
      variant="caption"
      fontWeight={600}
      textTransform="uppercase"
      letterSpacing="0.08em"
      color="text.secondary"
      display="block"
      mb={1.5}
      sx={sx}
    >
      {children}
    </Typography>
  );
}

function TopicCard({
  topic,
  delay,
}: {
  topic: (typeof TOPICS)[0];
  delay: number;
}) {
  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "visible",
        animation: `fadeUp 0.35s ease ${delay}ms both`,
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: topic.color,
          borderRadius: "12px 12px 0 0",
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.09)",
          borderColor: "transparent",
        },
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
    >
      <CardActionArea sx={{ height: "100%", borderRadius: "inherit" }}>
        <CardContent sx={{ p: 2 }}>
          {topic.isNew && (
            <Chip
              label="Mới"
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                fontSize: "10px",
                height: 20,
                background: "#fff3e0",
                color: "#e65100",
                fontWeight: 600,
              }}
            />
          )}
          <Typography fontSize={28} mb={1.25} display="block" lineHeight={1}>
            {topic.emoji}
          </Typography>
          <Typography fontWeight={600} fontSize="14px" mb={0.5}>
            {topic.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {topic.count} từ
          </Typography>
          <LinearProgress
            variant="determinate"
            value={topic.progress}
            sx={{
              mt: 1.25,
              height: 3,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.07)",
              "& .MuiLinearProgress-bar": {
                bgcolor: topic.color,
                borderRadius: 2,
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.disabled"
            mt={0.75}
            display="block"
          >
            {topic.progress}% hoàn thành
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
