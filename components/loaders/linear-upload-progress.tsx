"use client";

interface LinearUploadProgressProps {
  /** 0–100 */
  progress: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function LinearUploadProgress({
  progress,
  label,
  showPercentage = true,
  className = "",
}: LinearUploadProgressProps) {
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs text-muted-lavender truncate max-w-[70%]">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs text-lilac font-semibold ml-auto">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #b67ee8, #d4a5ff)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}