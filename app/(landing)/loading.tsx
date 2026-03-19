export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
      <div className="flex flex-col items-center gap-4">
        {/* Brand mark */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lilac to-purple-500 flex items-center justify-center shadow-lg shadow-lilac/30 animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-0.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-lilac to-purple-500 rounded-full animate-[shimmer-move_1.2s_ease-in-out_infinite]" style={{ width: "60%", backgroundSize: "200% 100%" }} />
        </div>
      </div>
    </div>
  );
}
