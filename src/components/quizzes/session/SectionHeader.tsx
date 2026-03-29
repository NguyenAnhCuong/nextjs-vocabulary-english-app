// src/components/quiz/session/SectionHeader.tsx
// Server Component — no interactivity needed

import { Box, Typography } from "@mui/material";

interface SectionHeaderProps {
  icon: string;
  title: string;
  subtitle: string;
  count: number;
}

export default function SectionHeader({ icon, title, subtitle, count }: SectionHeaderProps) {
  return (
    <Box
      sx={{
        mb: 2.5, p: "14px 20px",
        background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
        borderRadius: 2.5,
        border: "1px solid #bfdbfe",
        display: "flex", alignItems: "center", gap: 1.5,
      }}
    >
      <Typography fontSize={28} lineHeight={1}>{icon}</Typography>
      <Box>
        <Typography fontWeight={800} fontSize={15} color="primary.dark">{title}</Typography>
        <Typography variant="caption" color="primary.main">
          {subtitle} · <strong>{count} câu</strong>
        </Typography>
      </Box>
    </Box>
  );
}
