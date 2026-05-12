"use client";

import { useRouter } from "next/navigation";
import { useGameState } from "@/hooks/useGameState";
import { MAX_POINTS } from "@/lib/quiz-data";

export default function PointsPage() {
  const router = useRouter();
  const { totalPoints, streak } = useGameState();

  // 오늘 최대 획득 가능 포인트 대비 퍼센트
  const completionRate = Math.min(100, Math.round((totalPoints / (MAX_POINTS * 5)) * 100));

  return (
    <div className="flex flex-col min-h-screen px-5 pt-12 pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 active:scale-95 transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#191f28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: "#191f28" }}>내 포인트</h1>
      </div>

      {/* 총 포인트 */}
      <div
        className="rounded-3xl p-6 mb-4 text-center"
        style={{ background: "linear-gradient(135deg, #3182f6 0%, #1b64da 100%)" }}
      >
        <p className="text-white/70 text-sm mb-1">누적 포인트</p>
        <p className="text-white text-5xl font-bold mb-1">
          {totalPoints.toLocaleString()}
        </p>
        <p className="text-white/70 text-sm">P</p>
      </div>

      {/* 스트릭 현황 */}
      <div className="card mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color: "#8b95a1" }}>연속 도전</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-base" style={{ color: "#191f28" }}>
                {streak.count}일 연속
              </p>
              <p className="text-xs" style={{ color: "#8b95a1" }}>
                {streak.lastSuccessDate
                  ? `마지막 성공: ${streak.lastSuccessDate}`
                  : "아직 기록 없음"}
              </p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
          >
            {streak.count >= 7 ? "🏆 주간 달성" : streak.count >= 3 ? "🔥 달리는 중" : "⚡ 시작"}
          </div>
        </div>
      </div>

      {/* 달성도 */}
      <div className="card mb-4">
        <p className="text-xs font-semibold mb-3" style={{ color: "#8b95a1" }}>포인트 달성도</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "#191f28" }}>
            목표 달성률
          </span>
          <span className="text-sm font-bold" style={{ color: "#3182f6" }}>
            {completionRate}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#e5e8eb" }}>
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${completionRate}%`, backgroundColor: "#3182f6" }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "#8b95a1" }}>
          하루 최대 {MAX_POINTS}P · 매일 풀수록 포인트가 쌓여요
        </p>
      </div>

      {/* 안내 */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#f2f4f6" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "#191f28" }}>
          💡 포인트 안내
        </p>
        <ul className="text-xs space-y-1" style={{ color: "#4e5968" }}>
          <li>• 문제 정답 시 10~15P 지급</li>
          <li>• 포인트 현금화 기능은 준비 중이에요</li>
          <li>• 광고 시청 또는 공유로 재도전 기회를 얻을 수 있어요</li>
        </ul>
      </div>
    </div>
  );
}
