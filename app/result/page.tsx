"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import { showShareReward, SHARE_MODULE_ID } from "@/lib/toss-sdk";
import { getRankByCoins } from "@/lib/ranks";

export default function ResultPage() {
  const router = useRouter();
  const { todayStatus, progress, streak, totalPoints, sessionPoints, score, refresh } = useGameState();
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // ── ref로 최신 값 추적 (setInterval 내부 stale closure 방지) ──
  const todayStatusRef = useRef(todayStatus);
  const refreshRef = useRef(refresh);
  const routerRef = useRef(router);
  useEffect(() => { todayStatusRef.current = todayStatus; }, [todayStatus]);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);
  useEffect(() => { routerRef.current = router; }, [router]);

  // 10초 안에 progress가 로드되지 않으면 타임아웃 → "다시 시도" 버튼 표시
  useEffect(() => {
    if (progress !== null) return;
    const timer = setTimeout(() => setLoadTimedOut(true), 10000);
    return () => clearTimeout(timer);
  }, [progress]);

  // progress 로드 후 리다이렉트 판단
  useEffect(() => {
    if (progress === null) return;
    if (todayStatus === "not_started") {
      router.replace("/");
    }
  }, [todayStatus, progress, router]);

  // in_progress 폴링: setInterval 기반 — progress 변화에 의존하지 않아 안정적
  // refresh()가 실패해도 interval이 계속 돌며 재시도함
  useEffect(() => {
    if (progress === null || todayStatus !== "in_progress") return;

    let count = 0;
    const MAX = 8; // 최대 8회 × 1.5초 = 12초

    const interval = setInterval(async () => {
      count++;
      const status = todayStatusRef.current;

      if (status === "success" || status === "failure") {
        clearInterval(interval);
        return;
      }
      if (count >= MAX) {
        clearInterval(interval);
        routerRef.current.replace("/");
        return;
      }
      try {
        await refreshRef.current();
      } catch {
        // 실패해도 다음 interval에서 재시도
      }
    }, 1500);

    return () => clearInterval(interval);
  // progress와 todayStatus가 처음 in_progress일 때 한 번만 시작
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress === null ? "null" : todayStatus === "in_progress" ? "polling" : "done"]);

  // ── 로딩 중 ──────────────────────────────────────────
  if (progress === null) {
    if (loadTimedOut) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-8">
          <p className="text-4xl">😵</p>
          <p className="text-base font-bold text-gray-800">결과를 불러오지 못했어요</p>
          <p className="text-sm text-center text-gray-400">네트워크 상태를 확인하고<br />다시 시도해 주세요</p>
          <button
            onClick={async () => {
              setIsRetrying(true);
              setLoadTimedOut(false);
              await refresh();
              setIsRetrying(false);
            }}
            disabled={isRetrying}
            className="mt-2 px-6 py-3 rounded-2xl bg-blue-500 text-white text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
          >
            {isRetrying ? "불러오는 중..." : "다시 시도"}
          </button>
          <button
            onClick={() => router.replace("/")}
            className="text-sm text-gray-400"
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">결과를 불러오고 있어요...</p>
      </div>
    );
  }

  // ── 저장 대기 중 (in_progress 폴링 중) ──────────────
  if (todayStatus === "not_started" || todayStatus === "in_progress") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs text-gray-400">결과를 저장하고 있어요...</p>
      </div>
    );
  }

  // ── 결과 표시 ────────────────────────────────────────
  const isSuccess = todayStatus === "success";

  function handleShare() {
    showShareReward(
      () => { /* 리워드 지급은 toss-sdk 내부에서 처리 */ },
      undefined,
      undefined,
      SHARE_MODULE_ID,
    );
  }

  // 직급 승진 감지
  const prevCoins = Math.max(0, totalPoints - sessionPoints);
  const currentRank = getRankByCoins(totalPoints);
  const prevRank = getRankByCoins(prevCoins);
  const isRankUp = isSuccess && currentRank.title !== prevRank.title;

  return (
    <div className="flex flex-col min-h-screen px-5 pt-14 pb-10">
      {/* 직급 승진 배너 */}
      {isRankUp && (
        <div className="rounded-2xl p-4 mb-4 text-center bg-yellow-50 border border-yellow-200">
          <p className="text-2xl mb-1">🎊</p>
          <p className="text-sm font-bold text-yellow-800">
            {prevRank.emoji} {prevRank.title} → {currentRank.emoji} {currentRank.title}
          </p>
          <p className="text-xs text-yellow-600 mt-0.5">직급이 올랐어요! 축하해요!</p>
        </div>
      )}

      {/* 이모지 & 타이틀 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">{isSuccess ? "🎉" : "😢"}</div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          {isSuccess ? "퀴즈 완료!" : "오늘은 여기까지!"}
        </h1>
        {isSuccess ? (
          <p className="text-base font-semibold text-blue-500">
            오늘 총 {sessionPoints}스탬프 지급!
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            {progress.failedAtStep ?? "?"}번 문제에서 오늘 도전이 끝났어요
          </p>
        )}
      </div>

      {/* 점수 카드 */}
      <div className="card mb-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div className="px-2">
            <p className="text-2xl font-bold text-blue-500">{score}</p>
            <p className="text-xs mt-1 text-gray-400">정답</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold text-gray-900">
              {sessionPoints}<span className="text-sm font-semibold ml-0.5">S</span>
            </p>
            <p className="text-xs mt-1 text-gray-400">오늘 획득</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold text-amber-400">
              {totalPoints}<span className="text-sm font-semibold ml-0.5">S</span>
            </p>
            <p className="text-xs mt-1 text-gray-400">누적</p>
          </div>
        </div>
      </div>

      {/* 현재 직급 */}
      <div className="card mb-4 flex items-center gap-3">
        <span className="text-3xl">{currentRank.emoji}</span>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">현재 직급</p>
          <p className="font-bold text-base text-gray-900">{currentRank.title}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${currentRank.badgeBg} ${currentRank.badgeText}`}>
          💼 {totalPoints.toLocaleString()}S
        </span>
      </div>

      {/* 성공: 스트릭 */}
      {isSuccess && streak.count > 0 && (
        <div className="mb-4">
          <StreakCard count={streak.count} maxStreak={streak.maxStreak} />
        </div>
      )}

      {/* 실패: 내일 안내 */}
      {!isSuccess && (
        <div className="rounded-2xl p-4 mb-4 bg-rose-50">
          <p className="text-sm font-semibold mb-1 text-rose-600">😢 내일 다시 도전해요</p>
          <p className="text-xs text-rose-800">
            내일은 1번 문제부터 다시 시작돼요. 오늘 틀린 문제를 복습해 보세요!
          </p>
        </div>
      )}

      {/* 버튼 */}
      <div className="mt-auto space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 active:scale-95 transition-all bg-blue-500"
        >
          <span>🔗</span>
          <span>친구에게 결과 공유하고 5스탬프 받기</span>
        </button>
        <button
          onClick={() => router.push("/points")}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-all bg-gray-100 text-slate-600"
        >
          <span>💼</span>
          <span>커리어 현황 보기</span>
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 text-sm font-medium active:scale-95 transition-all text-gray-400"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
