"use client";

import { Star } from "lucide-react";

interface PointsCounterProps {
  points: number;
}

export default function PointsCounter({ points }: PointsCounterProps) {
  return (
    <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-2">
      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      <span className="text-sm font-bold text-yellow-700">
        {points.toLocaleString()} P
      </span>
    </div>
  );
}
