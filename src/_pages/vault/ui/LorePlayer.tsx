"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { VisuallyHidden } from "@/shared/ui";

import styles from "./LorePlayer.module.css";

type Status = "idle" | "playing" | "paused" | "ended";

/** 한국어 음성 합성이 1초에 읽는 글자 수(공백 포함, 보통 빠르기). 전체 길이를 어림합니다. */
const CHARS_PER_SECOND = 7;

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  playing: "이야기를 읽고 있습니다",
  paused: "잠시 멈췄습니다",
  ended: "이야기를 끝까지 읽었습니다",
};

const noop = () => () => {};
const isSupported = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** 문장 단위로 나눕니다. 긴 글을 한 번에 읽히면 일부 브라우저가 15초쯤에서 멈춥니다. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/**
 * 이야기 듣기: 유물 설명을 브라우저 음성 합성(Web Speech API, 한국어 목소리)으로 읽어 줍니다. 외부 음성 파일은 없습니다.
 * 재생 버튼은 누름 상태(aria-pressed)로 재생·일시 정지를 알리고, 진행 막대는 읽은 만큼(aria-valuenow)을 알립니다.
 * 음성 합성을 지원하지 않는 브라우저에서는 버튼 대신 안내를 보여 줍니다.
 */
export function LorePlayer({ text, title = "이야기 듣기" }: { text: string; title?: string }) {
  const supported = useSyncExternalStore(noop, isSupported, () => true);
  const [status, setStatus] = useState<Status>("idle");
  const [spoken, setSpoken] = useState(0);
  const tokenRef = useRef(0);
  const duration = Math.max(1, Math.round(text.length / CHARS_PER_SECOND));
  const progress = status === "ended" ? 1 : Math.min(1, spoken / text.length);

  // 화면을 떠나면 읽기를 멈춥니다.
  useEffect(
    () => () => {
      if (isSupported()) window.speechSynthesis.cancel();
    },
    [],
  );

  const start = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++tokenRef.current;
    const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith("ko"));
    let offset = 0;
    const sentences = splitSentences(text);
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      const base = offset;
      offset += sentence.length + 1;
      utterance.lang = "ko-KR";
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        if (token === tokenRef.current) setSpoken(base);
      };
      utterance.onboundary = (event) => {
        if (token === tokenRef.current) setSpoken(base + event.charIndex);
      };
      utterance.onend = () => {
        if (token !== tokenRef.current) return;
        setSpoken(base + sentence.length + 1);
        if (index === sentences.length - 1) setStatus("ended");
      };
      synth.speak(utterance);
    });
    setSpoken(0);
    setStatus("playing");
  };

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (status === "playing") {
      synth.pause();
      setStatus("paused");
    } else if (status === "paused") {
      synth.resume();
      setStatus("playing");
    } else {
      start();
    }
  };

  const elapsed = Math.round(progress * duration);

  return (
    <div className={styles.player}>
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {supported && (
          <button
            type="button"
            className={styles.play}
            aria-pressed={status === "playing"}
            aria-label="이야기 읽어 주기"
            onClick={toggle}
          >
            <span aria-hidden="true" className={styles.icon} data-playing={status === "playing"} />
          </button>
        )}
      </div>
      {supported ? (
        <div className={styles.track}>
          <span className={styles.time} lang="en">
            {clock(elapsed)}
          </span>
          <div
            className={styles.bar}
            role="progressbar"
            aria-label="이야기 진행"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuetext={`${clock(elapsed)} / 약 ${clock(duration)}`}
          >
            <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
          </div>
          <span className={styles.time} lang="en">
            {clock(duration)}
          </span>
        </div>
      ) : (
        <p className={styles.note}>이 브라우저는 읽어 주기(음성 합성)를 지원하지 않습니다.</p>
      )}
      <span role="status">
        <VisuallyHidden>{STATUS_TEXT[status]}</VisuallyHidden>
      </span>
    </div>
  );
}
