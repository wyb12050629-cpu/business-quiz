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
  maxStreak: number;
  lastSuccessDate: string;
}

// difficulty → 스탬프 변환표: 쉬움=5, 보통=10, 어려움=15
const DIFFICULTY_POINTS: Record<string, number> = { easy: 5, medium: 10, hard: 15 };

// Firestore QuestionItem → 로컬 QuizQuestion 형식으로 변환
function firestoreToLocal(q: QuestionItem, idx: number) {
  const points =
    q.points ??
    (q.difficulty ? DIFFICULTY_POINTS[q.difficulty] : 5);
  return {
    id: idx + 1,
    question: q.question,
    options: q.options,
    answer: q.answerIndex,
    explanation: q.explanation,
    points,
    category: q.category,
    difficulty: q.difficulty,
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
      // 각 단계를 독립적인 try/catch로 분리:
      // 1번이 실패해도 2·3번은 반드시 실행되어야 result 페이지가 동작함

      // 1. 오늘 문제 로드 (실패 시 로컬 기본 데이터 유지)
      try {
        const todayQDoc = await getTodayQuestion();
        if (!cancelled && todayQDoc && todayQDoc.questions.length > 0) {
          setQuestions(todayQDoc.questions.map(firestoreToLocal));
        }
      } catch (err) {
        console.error("[useGameState] 문제 로드 실패 — 로컬 데이터 사용:", err);
      }

      if (cancelled) return;

      // 2. 오늘 진행 상황 로드 (result 페이지의 핵심 — 반드시 성공해야 함)
      try {
        const prog = await getDailyProgress(userId as string);
        if (!cancelled) setProgress(prog);
      } catch (err) {
        console.error("[useGameState] progress 로드 실패:", err);
        // progress를 null이 아닌 "실패" 마커로 설정해 무한 스피너 방지
        // → 빈 상태로 설정하면 not_started가 되어 홈으로 리다이렉트됨
        // → 여기서는 null 유지 대신 에러 상태를 알리기 위해 재시도 가능하게 둠
      }

      if (cancelled) return;

      // 3. 유저 포인트/스트릭 로드
      try {
        const pts = await getUserPoints(userId as string);
        if (!cancelled) setUserPoints(pts);
      } catch (err) {
        console.error("[useGameState] userPoints 로드 실패:", err);
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
    maxStreak: userPoints?.maxStreak ?? 0,
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
    async (points: number = 5) => {
      if (!userId) return;

      // React state(progress)는 이전 렌더의 스냅샷이라 stale할 수 있음.
      // Firestore 쓰기가 완료되기 전에 다음 문제로 빠르게 넘어가면
      // progress.currentStep이 이전 단계 값을 가리켜 saveStepResult가
      // 잘못된 step을 저장하고 isSuccess가 영원히 false가 되는 버그 발생.
      // → 항상 Firestore에서 최신 step을 직접 읽어 stale closure를 원천 차단.
      let currentProgress: DailyProgress;
      try {
        currentProgress = await getDailyProgress(userId);
        setProgress(currentProgress);
      } catch (err) {
        console.error("[useGameState] handleCorrect - progress 조회 실패:", err);
        return;
      }

      const step = currentProgress.currentStep; // 1-indexed, 항상 최신값
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
    [userId, totalQuestions] // progress 제거 — 항상 Firestore 직접 조회하므로 불필요
  );

  // ── 다음 문제로 즉시 이동 (낙관적 업데이트) ─────────
  // Firestore 응답을 기다리지 않고 UI를 즉시 다음 문제로 전환
  const advanceStep = useCallback(() => {
    setProgress((prev) => {
      if (!prev) return prev;
      return { ...prev, currentStep: prev.currentStep + 1 };
    });
  }, []);

  // ── Firestore 상태 강제 새로고침 ────────────────────
  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const prog = await getDailyProgress(userId);
      setProgress(prog);
      const pts = await getUserPoints(userId);
      if (pts) setUserPoints(pts);
    } catch (err) {
      console.error("[useGameState] refresh 실패:", err);
    }
  }, [userId]);

  // ── 보너스 스탬프 지급 (광고 시청 리워드 등) ────────
  const addBonusStamps = useCallback(async (amount: number) => {
    if (!userId) return;
    try {
      const pts = await updateUserPoints(userId, amount, false);
      setUserPoints(pts);
    } catch (err) {
      console.error("[useGameState] addBonusStamps 실패:", err);
    }
  }, [userId]);

  // ── 오답 처리 (광고/공유 거부 or "내일 다시 도전하기") ───
  // usedChance=true → saveStepResult 내부에서 isFailed=true, isCompleted=true 세팅됨
  // → todayStatus가 "failure"로 바뀌어 result 페이지로 이동
  const handleFailure = useCallback(async () => {
    if (!userId) return;

    // handleCorrect와 동일하게 항상 Firestore에서 최신 step을 읽어 stale closure 방지
    let currentProgress: DailyProgress;
    try {
      currentProgress = await getDailyProgress(userId);
      setProgress(currentProgress);
    } catch (err) {
      console.error("[useGameState] handleFailure - progress 로드 실패:", err);
      return;
    }

    const step = currentProgress.currentStep;

    try {
      // usedChance=true: 이 문제에서 재도전 기회를 소진했으므로 하루 도전 종료
      const updated = await saveStepResult(userId, step, false, true, 0, totalQuestions);
      setProgress(updated);
      await updateUserPoints(userId, updated.totalPointsToday, false);
      const pts = await getUserPoints(userId);
      setUserPoints(pts);
    } catch (err) {
      console.error("[useGameState] handleFailure 실패:", err);
    }
  }, [userId, totalQuestions]);

  return {
    // 상태
    todayStatus,
    progress,
    streak,
    totalPoints,
    sessionPoints,
    score,
    questions,       // 전체 문제 배열 (quiz 페이지 로컬 스텝용)
    currentQuestion,
    totalQuestions,
    currentStepIndex: clampedIndex,

    // 액션
    startQuiz,
    handleCorrect,
    handleFailure,
    addBonusStamps,
    advanceStep,
    refresh,
  };
}
