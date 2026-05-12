"use client";

interface PointBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

export default function PointBadge({ value, size = "md" }: PointBadgeProps) {
  const displayPoints = value;

  const sizeClass = {
    sm: "text-sm px-3 py-1",
    md: "text-base px-4 py-2",
    lg: "text-xl px-5 py-2.5 font-bold",
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
      style={{ backgroundColor: "#EBF3FF", color: "#3182f6" }}
    >
      <span>⭐</span>
      <span>{displayPoints.toLocaleString()}P</span>
    </div>
  );
}
