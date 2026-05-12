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
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            backgroundColor:
              i < current
                ? "#3182f6"
                : i === current
                ? "#3182f6"
                : "#e5e8eb",
            opacity: i < current ? 0.4 : 1,
          }}
        />
      ))}
      <span className="ml-2 text-sm font-medium" style={{ color: "#8b95a1" }}>
        {current + 1}/{total}
      </span>
    </div>
  );
}
