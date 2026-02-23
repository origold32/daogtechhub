export default function Loader3() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div
        className="w-16 h-16 rounded-full animate-spin"
        style={{
          background: `conic-gradient(
            transparent,
            #d4a5ff,
            #b67ee8,
            #d4a5ff,
            transparent
          )`,
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)",
        }}
      />
    </div>
  );
}
