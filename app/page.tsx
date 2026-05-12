"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameState, TodayStatus } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import PointBadge from "@/app/components/PointBadge";
import RankCard from "@/app/components/RankCard";
import { showRewardedAd } from "@/lib/toss-sdk";

export default function HomePage() {
  const router = useRouter();
  const {
    todayStatus,
    streak,
    totalPoints,
    sessionPoints,
    score,
    totalQuestions,
    currentStepIndex,
    progress,
    startQuiz,
    addBonusStamps,
  } = useGameState();

  const [adState, setAdState] = useState<"idle" | "loading" | "done">("idle");

  async function handleStart() {
    await startQuiz();
    router.push("/quiz");
  }

  function handleStampAd() {
    setAdState("loading");
    showRewardedAd(
      async () => {
        // 리워드 획득 → 스탬프 50개 지급
        await addBonusStamps(50);
        setAdState("done");
      },
      () => {
        // 광고 닫힘 (리워드 없음)
        if (adState !== "done") setAdState("idle");
      },
      () => {
        // 광고 실패
        setAdState("idle");
      }
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-5 pt-14 pb-8 gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          직장인 상식 퀴즈 풀기 📚
        </h1>
        <button onClick={() => router.push("/points")} className="active:scale-95 transition-all">
          <PointBadge value={totalPoints} size="sm" />
        </button>
      </div>

      {/* 스트릭 카드 */}
      {streak.count > 0 && <StreakCard count={streak.count} />}

      {/* 오늘 도전 상태 카드 */}
      <TodayChallengeCard
        status={todayStatus}
        currentStep={currentStepIndex}
        totalQuestions={totalQuestions}
        score={score}
        failedAtStep={progress?.failedAtStep ?? null}
        sessionPoints={sessionPoints}
        onStart={handleStart}
        onContinue={() => router.push("/quiz")}
      />

      {/* 안내 */}
      <div className="rounded-2xl p-4 bg-gray-100">
        <p className="text-sm font-semibold mb-1 text-gray-900">
          💡 이렇게 진행돼요
        </p>
        <ul className="text-xs space-y-1 text-slate-600">
          <li>• 총 {totalQuestions}문제, 문제당 최대 5스탬프</li>
          <li>• 틀리면 광고 보기 or 친구 공유로 재도전 가능</li>
          <li>• 매일 완료하면 스트릭이 쌓여요 🔥</li>
        </ul>
      </div>

      {/* 내 직급 (RankCard + 광고 버튼) */}
      <div>
        <p className="text-xs font-semibold mb-2 text-gray-400">내 직급</p>
        <RankCard
          totalStamps={totalPoints}
          onWatchAd={handleStampAd}
          adState={adState}
        />
      </div>

      {/* 면책 문구 */}
      <div className="mt-auto pt-2 pb-1">
        <p className="text-center text-xs leading-relaxed text-gray-300">
          본 퀴즈는 학습 참고용 서비스입니다.{"\n"}
          내용에 오류가 있을 수 있으며, 법적 상담·조언·해석의{"\n"}
          근거로 사용할 수 없습니다.
        </p>
      </div>
    </div>
  );
}

// ── 오늘 도전 상태 카드 ──────────────────────────
interface TodayChallengeCardProps {
  status: TodayStatus;
  currentStep: number;
  totalQuestions: number;
  score: number;
  failedAtStep: number | null;
  sessionPoints: number;
  onStart: () => void;
  onContinue: () => void;
}

function TodayChallengeCard({
  status,
  currentStep,
  totalQuestions,
  score,
  failedAtStep,
  sessionPoints,
  onStart,
  onContinue,
}: TodayChallengeCardProps) {
  return (
    <div className="card">
      <p className="text-xs font-semibold mb-3 text-gray-400">오늘의 도전</p>

      {status === "not_started" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-bold text-base text-gray-900">총 {totalQuestions}문제 도전</p>
              <p className="text-sm text-gray-400">직장인 상식을 테스트해 보세요!</p>
            </div>
          </div>
          <button onClick={onStart} className="btn-primary">도전 시작하기</button>
        </>
      )}

      {status === "in_progress" && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="font-bold text-base text-gray-900">
                진행 중 — {currentStep + 1}/{totalQuestions}번 문제
              </p>
              <p className="text-sm text-gray-400">
                {score}문제 맞힘 · {sessionPoints} 스탬프 획득
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full mb-4 bg-gray-200">
            <div
              className="h-2 rounded-full transition-all bg-blue-500"
              style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
            />
          </div>
          <button onClick={onContinue} className="btn-primary">이어하기</button>
        </>
      )}

      {status === "success" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-lg text-gray-900">오늘 퀴즈 완료!</p>
          <p className="text-sm mt-1 text-gray-400">
            {score}/{totalQuestions} 정답 · +{sessionPoints} 스탬프 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block bg-blue-50">
            <span className="text-sm font-semibold text-blue-500">
              내일 또 도전하면 스트릭이 이어져요 🔥
            </span>
          </div>
        </div>
      )}

      {status === "failure" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">😢</div>
          <p className="font-bold text-lg text-gray-900">
            {failedAtStep !== null ? `${failedAtStep}번 문제에서 멈췄어요` : "오늘 도전 종료"}
          </p>
          <p className="text-sm mt-1 text-gray-400">
            {score}문제 맞힘 · {sessionPoints} 스탬프 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block bg-rose-50">
            <span className="text-sm font-semibold text-rose-600">
              내일 다시 1번부터 도전할 수 있어요
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
