"use client";

interface StreakCardProps {
  count: number;
  maxStreak: number;
}

export default function StreakCard({ count, maxStreak }: StreakCardProps) {
  const emoji = count >= 30 ? "🔥🔥🔥" : count >= 14 ? "🔥🔥" : "🔥";

  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-orange-50">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-bold text-sm text-orange-700">
          연속 {count}일째 성공 중!
        </p>
        <p className="text-xs text-orange-500">
          {count > 0 && count % 7 === 0
            ? `🎁 ${count}일 달성! 보너스 10스탬프 받았어요`
            : `역대 최고 ${Math.max(count, maxStreak)}일 · 7일마다 보너스 10스탬프 🔥`}
        </p>
      </div>
    </div>
  );
}
