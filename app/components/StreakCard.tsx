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
          오늘도 퀴즈를 완료해서 스트릭을 이어가세요
        </p>
      </div>
    </div>
  );
}
