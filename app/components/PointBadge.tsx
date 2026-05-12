"use client";

interface PointBadgeProps {
  value: number;
  size?: "sm" | "md" | "lg";
}

export default function PointBadge({ value, size = "md" }: PointBadgeProps) {
  const sizeClass = {
    sm: "text-sm px-3 py-1",
    md: "text-base px-4 py-2",
    lg: "text-xl px-5 py-2.5 font-bold",
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-blue-50 text-blue-500 ${sizeClass}`}>
      <span>💼</span>
      <span>{value.toLocaleString()}</span>
    </div>
  );
}
