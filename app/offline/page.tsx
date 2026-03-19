// app/offline/page.tsx — Shown by service worker when offline
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: "#1a0b2e" }}>
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-lilac to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-lilac/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M1 6s4-4 11-4 11 4 11 4" /><path d="M5 10s2.5-2.5 7-2.5 7 2.5 7 2.5" />
          <path d="M9 14s1-1 3-1 3 1 3 1" /><line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" strokeLinecap="round" />
          <line x1="2" y1="2" x2="22" y2="22" strokeWidth="2" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">You&apos;re Offline</h1>
      <p className="text-white/50 text-sm mb-6 max-w-xs leading-relaxed">
        No internet connection detected. Some pages may still be available from cache.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="h-11 px-6 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] transition-all"
      >
        Try Again
      </button>
      <p className="text-white/20 text-xs mt-4">
        Previously visited pages are available below-the-fold via cache.
      </p>
    </div>
  );
}
