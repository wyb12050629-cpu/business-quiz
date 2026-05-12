"use client";

interface StepIndicatorProps {
  current: number; // 0-based
  total: number;
}

export default function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            "rounded-full transition-all duration-300 h-2",
            i === current ? "w-5" : "w-2",
            i <= current ? "bg-blue-500" : "bg-gray-200",
            i < current ? "opacity-40" : "opacity-100",
          ].join(" ")}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-400">
        {current + 1}/{total}
      </span>
    </div>
  );
}
