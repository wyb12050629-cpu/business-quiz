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
  // hydrated는 항상 true — 화면을 즉시 표시하고 데이터는 백그라운드 로드

  // ── 초기 로드 ────────────────────────────────
  useEffect(() => {
    if (authLoading || !userId) return;

    let cancelled = false;

    async function load() {
      try {
        // 1. 오늘 문제 로드 (Firestore → 없으면 로컬 데이터)
        const todayQDoc = await getTodayQuestion();
        if (!cancelled && todayQDoc && todayQDoc.questions.length > 0) {
          setQuestions(todayQDoc.questions.map(firestoreToLocal));
        }

        if (cancelled) return;

        // 2. 오늘 진행 상황 로드
        const prog = await getDailyProgress(userId as string);
        if (!cancelled) setProgress(prog);

        if (cancelled) return;

        // 3. 유저 포인트/스트릭 로드
        const pts = await getUserPoints(userId as string);
        if (!cancelled) setUserPoints(pts);
      } catch (err) {
        console.error("[useGameState] 로드 실패:", err);
      }
    }

    load();

    return () => { cancelled = true; };
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
    currentQuestion,
    totalQuestions,
    currentStepIndex: clampedIndex,

    // 액션
    startQuiz,
    handleCorrect,
    handleFailure,
  };
}
