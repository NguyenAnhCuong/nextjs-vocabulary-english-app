// src/app/learning/topic/[topicId]/page.tsx
// Server Component: fetch cards → Client Component: show dialog + session

import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import { fetchCardsByTopic } from "@/services/flashcard.service";
import type { ApiResponse } from "@/lib/api";
import LearnPageClient from "@/components/vocabulary/flashcard/LearnPageClient";

interface TopicDetail {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
}

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function LearnTopicPage({ params }: PageProps) {
  const { topicId } = await params;

  // Fetch topic info + cards parallel
  const [topicRes, cards] = await Promise.all([
    serverFetch<ApiResponse<TopicDetail>>(`/topics/${topicId}`).catch(
      () => null,
    ),
    fetchCardsByTopic(topicId).catch(() => []),
  ]);

  const topic = topicRes?.data;
  if (!topic) notFound();

  return (
    <LearnPageClient
      cards={cards}
      source={{
        type: "topic",
        topicId: topic.id,
        topicName: topic.name,
        color: topic.color ?? "#6c8fff",
        emoji: topic.emoji ?? "📂",
      }}
    />
  );
}
