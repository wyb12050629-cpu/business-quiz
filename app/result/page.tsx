"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import { showShareReward } from "@/lib/toss-sdk";

export default function ResultPage() {
  const router = useRouter();
  const { todayStatus, progress, streak, totalPoints, sessionPoints, score, totalQuestions, hydrated } = useGameState();

  useEffect(() => {
    if (!hydrated) return;
    if (todayStatus === "not_started" || todayStatus === "in_progress") {
      router.replace("/");
    }
  }, [hydrated, todayStatus, router]);

  if (!hydrated || todayStatus === "not_started" || todayStatus === "in_progress") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isSuccess = todayStatus === "success";

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
      {/* 이모지 & 타이틀 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">{isSuccess ? "🎉" : "😢"}</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#191f28" }}>
          {isSuccess ? "퀴즈 완료!" : "오늘은 여기까지!"}
        </h1>
        <p className="text-sm" style={{ color: "#8b95a1" }}>
          {isSuccess
            ? "모든 문제를 풀었어요. 대단해요!"
            : `${progress?.failedAtStep ?? "?"}번 문제에서 오늘 도전이 끝났어요`}
        </p>
      </div>

      {/* 점수 카드 */}
      <div className="card mb-4">
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div className="px-2">
            <p className="text-2xl font-bold" style={{ color: "#3182f6" }}>{score}</p>
            <p className="text-xs mt-1" style={{ color: "#8b95a1" }}>정답</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold" style={{ color: "#191f28" }}>
              {sessionPoints}<span className="text-sm font-semibold ml-0.5">P</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "#8b95a1" }}>오늘 획득</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>
              {totalPoints}<span className="text-sm font-semibold ml-0.5">P</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "#8b95a1" }}>누적</p>
          </div>
        </div>
      </div>

      {/* 성공: 스트릭 */}
      {isSuccess && streak.count > 0 && (
        <div className="mb-4">
          <StreakCard count={streak.count} />
        </div>
      )}

      {/* 실패: 내일 안내 */}
      {!isSuccess && (
        <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#fff1f2" }}>
          <p className="text-sm font-semibold mb-1" style={{ color: "#e11d48" }}>😢 내일 다시 도전해요</p>
          <p className="text-xs" style={{ color: "#9f1239" }}>
            내일은 1번 문제부터 다시 시작돼요. 오늘 틀린 문제를 복습해 보세요!
          </p>
        </div>
      )}

      {/* 버튼 */}
      <div className="mt-auto space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ backgroundColor: "#3182f6" }}
        >
          <span>🔗</span>
          <span>친구에게 공유하기</span>
        </button>
        <button
          onClick={() => router.push("/points")}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-all"
          style={{ backgroundColor: "#f2f4f6", color: "#4e5968" }}
        >
          <span>⭐</span>
          <span>포인트 내역 보기</span>
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 text-sm font-medium active:scale-95 transition-all"
          style={{ color: "#8b95a1" }}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
