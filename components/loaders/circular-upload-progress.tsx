"use client";

interface CircularUploadProgressProps {
  /** 0–100 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function CircularUploadProgress({
  progress,
  size = 48,
  strokeWidth = 4,
  className = "",
}: CircularUploadProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212,165,255,0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d4a5ff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s ease" }}
        />
      </svg>
      {/* Percentage label */}
      <span
        className="absolute text-lilac font-semibold"
        style={{ fontSize: size * 0.22 }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  );
}