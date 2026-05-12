"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import { showShareReward } from "@/lib/toss-sdk";
import { getRankByCoins } from "@/lib/ranks";

export default function ResultPage() {
  const router = useRouter();
  const { todayStatus, progress, streak, totalPoints, sessionPoints, score, refresh } = useGameState();
  const refreshCountRef = useRef(0);

  // progress 로드 완료 후 상태 판단
  // - not_started: 오늘 퀴즈 안 함 → 홈으로
  // - in_progress: Firestore 저장 미완료 → 최대 5번 폴링 후 강제 이동
  // - success/failure: 결과 페이지 표시
  useEffect(() => {
    if (progress === null) return; // 아직 로딩 중
    if (todayStatus === "not_started") {
      router.replace("/");
    }
  }, [todayStatus, progress, router]);

  // in_progress 폴링: 1.5초마다 Firestore 재조회 (최대 5회)
  useEffect(() => {
    if (progress === null || todayStatus !== "in_progress") {
      refreshCountRef.current = 0;
      return;
    }
    if (refreshCountRef.current >= 5) {
      // 5번 시도 후에도 in_progress → 강제로 홈 이동
      router.replace("/");
      return;
    }
    const timer = setTimeout(async () => {
      refreshCountRef.current++;
      await refresh();
    }, 1500);
    return () => clearTimeout(timer);
  }, [todayStatus, progress, refresh, router]);

  // 로딩 중 또는 결과 저장 대기 중
  if (progress === null || todayStatus === "not_started" || todayStatus === "in_progress") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isSuccess = todayStatus === "success";

  // 직급 승진 감지
  const prevCoins = Math.max(0, totalPoints - sessionPoints);
  const currentRank = getRankByCoins(totalPoints);
  const prevRank = getRankByCoins(prevCoins);
  const isRankUp = isSuccess && currentRank.title !== prevRank.title;

  function handleShare() {
    showShareReward(
      ({ rewardAmount, rewardUnit }) => {
        console.log(`결과 공유 완료 — 리워드: ${rewardAmount}${rewardUnit}`);
      },
      (reason, sentCount) => {
        console.log(`공유 모듈 종료: ${reason}, 공유 수: ${sentCount}`);
      },
      (error) => {
        console.error("공유 오류:", error);
      }
    );
  }

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
          <span>친구에게 공유하고 5스탬프 받기</span>
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
