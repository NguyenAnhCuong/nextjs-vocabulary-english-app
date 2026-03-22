// src/app/vocabulary/page.tsx
// Server Component — fetch tất cả dữ liệu song song rồi truyền xuống Client Component

import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { fetchVocabPageData } from "@/services/vocabulary.service";
import VocabularyPage from "@/components/vocabulary/Vocabulary";

export const metadata = {
  title: "Học Từ Vựng | WordWise",
};

// Loading fallback
function VocabSkeleton() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
    >
      <CircularProgress />
    </Box>
  );
}

export default async function VocabPage() {
  // Fetch tất cả dữ liệu song song — topics, levels, favourites, ownWords, stats
  const data = await fetchVocabPageData();

  return (
    <Suspense fallback={<VocabSkeleton />}>
      <VocabularyPage data={data} />
    </Suspense>
  );
}
