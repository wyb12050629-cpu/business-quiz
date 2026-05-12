"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getDailyProgress,
  saveStepResult,
  updateUserPoints,
  getUserPoints,
  getTodayQuestion,
  DailyProgress,
  UserPoints,
  QuestionItem,
} from "@/lib/firestore";
import { quizData } from "@/lib/quiz-data";

// ────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────
export type TodayStatus = "not_started" | "in_progress" | "success" | "failure";

export interface StreakData {
  count: number;
  lastSuccessDate: string;
}

// Firestore QuestionItem → 로컬 QuizQuestion 형식으로 변환
function firestoreToLocal(q: QuestionItem, idx: number) {
  return {
    id: idx + 1,
    question: q.question,
    options: q.options,
    answer: q.answerIndex,
    explanation: q.explanation,
    points: 10, // Firestore에 포인트 필드 없으면 기본 10P
    category: q.category,
  };
}

// ────────────────────────────────────────────────
// 훅
// ────────────────────────────────────────────────
export function useGameState() {
  const { userId, loading: authLoading } = useAuth();

  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [questions, setQuestions] = useState(quizData); // 기본값: 로컬 데이터
  const [hydrated, setHydrated] = useState(false);

  // ── 초기 로드 ────────────────────────────────
  useEffect(() => {
    // 인증 완료 대기
    if (authLoading) return;

    // 인증이 완료됐지만 userId가 없으면 (극히 드문 경우) 로딩만 해제
    if (!userId) {
      setHydrated(true);
      return;
    }

    // Firestore 무응답 대비 안전 타임아웃 (8초)
    const abortController = new AbortController();
    const safetyTimer = setTimeout(() => {
      abortController.abort();
      console.warn("[useGameState] Firestore 응답 없음 — 타임아웃으로 로딩 해제");
      setHydrated(true);
    }, 8000);

    async function load() {
      try {
        // 1. 오늘 문제 로드 (Firestore → 없으면 로컬 데이터)
        const todayQDoc = await getTodayQuestion();
        if (!abortController.signal.aborted && todayQDoc && todayQDoc.questions.length > 0) {
          setQuestions(todayQDoc.questions.map(firestoreToLocal));
        }

        if (abortController.signal.aborted) return;

        // 2. 오늘 진행 상황 로드
        const prog = await getDailyProgress(userId as string);
        if (!abortController.signal.aborted) setProgress(prog);

        if (abortController.signal.aborted) return;

        // 3. 유저 포인트/스트릭 로드
        const pts = await getUserPoints(userId as string);
        if (!abortController.signal.aborted) setUserPoints(pts);
      } catch (err) {
        console.error("[useGameState] 로드 실패:", err);
      } finally {
        clearTimeout(safetyTimer);
        if (!abortController.signal.aborted) setHydrated(true);
      }
    }

    load();

    return () => {
      abortController.abort();
      clearTimeout(safetyTimer);
    };
  }, [userId, authLoading]);

  // ── 파생 상태 ────────────────────────────────
  const totalQuestions = questions.length;

  // Firestore currentStep은 1-indexed (1~N: 진행중, N+1: 완료)
  const currentStepIndex = Math.max(0, (progress?.currentStep ?? 1) - 1);
  const clampedIndex = Math.min(currentStepIndex, totalQuestions - 1);
  const currentQuestion = questions[clampedIndex];

  const todayStatus: TodayStatus = (() => {
    if (!progress) return "not_started";
    if (progress.isSuccess) return "success";
    if (progress.isFailed) return "failure";
    if (progress.isCompleted) return "success";
    if (progress.currentStep > 1 || progress.stepResults.length > 0) return "in_progress";
    return "not_started";
  })();

  const streak: StreakData = {
    count: userPoints?.streak ?? 0,
    lastSuccessDate: userPoints?.lastSuccessDate ?? "",
  };

  const totalPoints = userPoints?.totalPoints ?? 0;
  const sessionPoints = progress?.totalPointsToday ?? 0;
  const score = progress?.stepResults.filter((r) => r.isCorrect).length ?? 0;

  // ── 퀴즈 시작 ────────────────────────────────
  const startQuiz = useCallback(async () => {
    if (!userId) return;
    try {
      const prog = await getDailyProgress(userId);
      setProgress(prog);
    } catch (err) {
      console.error("[useGameState] startQuiz 실패:", err);
    }
  }, [userId]);

  // ── 정답 처리 ─────────────────────────────────
  const handleCorrect = useCallback(
    async (points: number = 10) => {
      if (!userId || !progress) return;
      const step = progress.currentStep; // 1-indexed
      const isLast = step >= totalQuestions;

      try {
        const updated = await saveStepResult(userId, step, true, false, points, totalQuestions);
        setProgress(updated);

        if (isLast) {
          const pts = await updateUserPoints(userId, updated.totalPointsToday, true);
          setUserPoints(pts);
        }
      } catch (err) {
        console.error("[useGameState] handleCorrect 실패:", err);
      }
    },
    [userId, progress, totalQuestions]
  );

  // ── 오답 처리 (기회 사용 후 또 틀림 or 기회 거부) ───
  const handleFailure = useCallback(async () => {
    if (!userId || !progress) return;
    const step = progress.currentStep;

    try {
      const updated = await saveStepResult(userId, step, false, false, 0, totalQuestions);
      setProgress(updated);
      await updateUserPoints(userId, updated.totalPointsToday, false);
      const pts = await getUserPoints(userId);
      setUserPoints(pts);
    } catch (err) {
      console.error("[useGameState] handleFailure 실패:", err);
    }
  }, [userId, progress, totalQuestions]);

  return {
    // 상태
    todayStatus,
    progress,
    streak,
    totalPoints,
    sessionPoints,
    score,
    hydrated,
    currentQuestion,
    totalQuestions,
    currentStepIndex: clampedIndex,

    // 액션
    startQuiz,
    handleCorrect,
    handleFailure,
  };
}
