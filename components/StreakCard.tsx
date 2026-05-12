"use client";

import { Flame } from "lucide-react";

interface StreakCardProps {
  streak: number;
  maxStreak: number;
}

export default function StreakCard({ streak, maxStreak }: StreakCardProps) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">연속 성공</p>
            <p className="text-xl font-bold text-orange-600">{streak}일</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">최장 기록</p>
          <p className="text-lg font-bold text-amber-600">{maxStreak}일</p>
        </div>
      </div>
    </div>
  );
}
