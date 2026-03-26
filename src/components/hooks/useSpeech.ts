// src/hooks/useSpeech.ts
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseSpeechOptions {
  lang?: string; // "en-US" | "en-GB" | "en-AU"
  rate?: number; // 0.5 – 2.0, default 0.9
  pitch?: number; // 0 – 2, default 1
  volume?: number; // 0 – 1, default 1
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { lang = "en-US", rate = 0.9, pitch = 1, volume = 1 } = options;
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;

      // Dừng giọng đang đọc nếu có
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Chọn giọng tiếng Anh tốt nhất có sẵn
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(
          (v) => v.lang.startsWith("en") && v.localService === false, // online voices chất hơn
        ) ?? voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [supported, lang, rate, pitch, volume],
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking, supported };
}
