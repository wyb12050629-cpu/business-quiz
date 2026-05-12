"use client";

interface StreakCardProps {
  count: number;
}

export default function StreakCard({ count }: StreakCardProps) {
  if (count === 0) return null;

  const emoji =
    count >= 30 ? "🔥🔥🔥" : count >= 14 ? "🔥🔥" : count >= 7 ? "🔥" : "⚡";

  return (
    <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-orange-50">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="font-bold text-sm text-orange-700">
          {count}일 연속 성공 중!
        </p>
        <p className="text-xs text-orange-500">
          {count % 7 === 0
            ? `🎁 ${count}일 달성! 보너스 10스탬프 받았어요`
            : `7일마다 추가 10스탬프 — ${7 - (count % 7)}일 남았어요`}
        </p>
      </div>
    </div>
  );
}
