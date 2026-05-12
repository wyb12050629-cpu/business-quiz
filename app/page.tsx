"use client";

import { useRouter } from "next/navigation";
import { useGameState, TodayStatus } from "@/hooks/useGameState";
import StreakCard from "@/app/components/StreakCard";
import PointBadge from "@/app/components/PointBadge";

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
  } = useGameState();

  async function handleStart() {
    await startQuiz();
    router.push("/quiz");
  }

  return (
    <div className="flex flex-col min-h-screen px-5 pt-14 pb-8 gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: "#191f28" }}>
          비즈니스 퀴즈 📚
        </h1>
        <button
          onClick={() => router.push("/points")}
          className="active:scale-95 transition-all"
        >
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
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#f2f4f6" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#191f28" }}>
          💡 이렇게 진행돼요
        </p>
        <ul className="text-xs space-y-1" style={{ color: "#4e5968" }}>
          <li>• 총 {totalQuestions}문제, 문제당 최대 15P</li>
          <li>• 틀리면 광고 보기 or 친구 공유로 재도전 가능</li>
          <li>• 매일 완료하면 스트릭이 쌓여요 🔥</li>
        </ul>
      </div>

      {/* 면책 문구 */}
      <div className="mt-auto pt-2 pb-1">
        <p className="text-center text-xs leading-relaxed" style={{ color: "#b0b8c1" }}>
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
      <p className="text-xs font-semibold mb-3" style={{ color: "#8b95a1" }}>
        오늘의 도전
      </p>

      {status === "not_started" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="font-bold text-base" style={{ color: "#191f28" }}>
                총 {totalQuestions}문제 도전
              </p>
              <p className="text-sm" style={{ color: "#8b95a1" }}>
                비즈니스 지식을 테스트해 보세요!
              </p>
            </div>
          </div>
          <button onClick={onStart} className="btn-primary">
            도전 시작하기
          </button>
        </>
      )}

      {status === "in_progress" && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚡</span>
            <div>
              <p className="font-bold text-base" style={{ color: "#191f28" }}>
                진행 중 — {currentStep + 1}/{totalQuestions}번 문제
              </p>
              <p className="text-sm" style={{ color: "#8b95a1" }}>
                {score}문제 맞힘 · {sessionPoints}P 획득
              </p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: "#e5e8eb" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(currentStep / totalQuestions) * 100}%`,
                backgroundColor: "#3182f6",
              }}
            />
          </div>
          <button onClick={onContinue} className="btn-primary">
            이어하기
          </button>
        </>
      )}

      {status === "success" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-bold text-lg" style={{ color: "#191f28" }}>오늘 퀴즈 완료!</p>
          <p className="text-sm mt-1" style={{ color: "#8b95a1" }}>
            {score}/{totalQuestions} 정답 · +{sessionPoints}P 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block" style={{ backgroundColor: "#ebf3ff" }}>
            <span className="text-sm font-semibold" style={{ color: "#3182f6" }}>
              내일 또 도전하면 스트릭이 이어져요 🔥
            </span>
          </div>
        </div>
      )}

      {status === "failure" && (
        <div className="text-center py-3">
          <div className="text-4xl mb-2">😢</div>
          <p className="font-bold text-lg" style={{ color: "#191f28" }}>
            {failedAtStep !== null ? `${failedAtStep}번 문제에서 멈췄어요` : "오늘 도전 종료"}
          </p>
          <p className="text-sm mt-1" style={{ color: "#8b95a1" }}>
            {score}문제 맞힘 · {sessionPoints}P 획득
          </p>
          <div className="mt-3 py-2 px-4 rounded-xl inline-block" style={{ backgroundColor: "#fff1f2" }}>
            <span className="text-sm font-semibold" style={{ color: "#e11d48" }}>
              내일 다시 1번부터 도전할 수 있어요
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
