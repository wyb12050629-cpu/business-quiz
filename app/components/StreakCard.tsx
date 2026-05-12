"use client";

interface StreakCardProps {
  count: number;
  maxStreak: number;
}

export default function StreakCard({ count, maxStreak }: StreakCardProps) {
  if (count === 0) {
    return (
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-gray-100">
        <span className="text-2xl">💪</span>
        <div>
          <p className="font-bold text-sm text-gray-700">오늘부터 다시 시작해요!</p>
          {maxStreak > 0 && (
            <p className="text-xs text-gray-400">역대 최고 {maxStreak}일</p>
          )}
        </div>
      </div>
    );
  }

  const emoji =
    count >= 30 ? "🔥🔥🔥" : count >= 14 ? "🔥🔥" : "🔥";

  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-orange-50">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-bold text-sm text-orange-700">
          연속 {count}일째 성공 중!
        </p>
        <p className="text-xs text-orange-500">
          {count % 7 === 0
            ? `🎁 ${count}일 달성! 보너스 10스탬프 받았어요`
            : `역대 최고 ${Math.max(count, maxStreak)}일 · 7일마다 보너스 10스탬프 🔥`}
        </p>
      </div>
    </div>
  );
}
