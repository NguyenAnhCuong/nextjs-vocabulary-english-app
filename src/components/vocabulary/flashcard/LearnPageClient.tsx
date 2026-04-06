"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import StartSessionDialog from "./StartSessionDialog";
import FlashCardSession from "./FlashCardSession";
import type { FlashCard, SessionSource } from "@/types/flashcard";
import { loadSessionProgress } from "@/types/flashcard";

type Phase = "dialog" | "session";

interface LearnPageClientProps {
  cards: FlashCard[];
  source: SessionSource;
}

export default function LearnPageClient({
  cards,
  source,
}: LearnPageClientProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("dialog");
  const [startIndex, setStartIndex] = useState(0);

  // Kiểm tra tiến độ đã lưu để truyền vào dialog
  const saved =
    typeof window !== "undefined" ? loadSessionProgress(source) : null;

  // Lấy callback refreshProgress từ window (được set bởi TopicTab/LevelTab trước khi navigate)
  const getSessionCompleteCallback = () => {
    if (typeof window === "undefined") return undefined;
    return (window as any).__onSessionComplete as (() => void) | undefined;
  };

  const handleStart = (fromIndex: number) => {
    setStartIndex(fromIndex);
    setPhase("session");
  };

  const handleExit = () => {
    // Dọn dẹp window callback
    if (typeof window !== "undefined")
      delete (window as any).__onSessionComplete;
    router.push("/learning");
  };

  const handleSessionComplete = () => {
    // Gọi refreshProgress ở VocabularyPage thông qua window callback
    const cb = getSessionCompleteCallback();
    cb?.();
  };

  if (cards.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap={2}
      >
        <Typography fontSize={48}>📭</Typography>
        <Typography color="text.secondary">
          Chưa có từ nào trong mục này.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Dialog phase */}
      {phase === "dialog" && (
        <>
          {/* Nền mờ khi dialog mở */}
          <Box sx={{ height: "100%", bgcolor: "background.default" }} />
          <StartSessionDialog
            open={true}
            source={source}
            totalCards={cards.length}
            onStart={handleStart}
            onClose={handleExit}
          />
        </>
      )}

      {/* Session phase */}
      {phase === "session" && (
        <FlashCardSession
          cards={cards}
          source={source}
          initialIndex={startIndex}
          onExit={handleExit}
          onSessionComplete={handleSessionComplete}
        />
      )}
    </Box>
  );
}
