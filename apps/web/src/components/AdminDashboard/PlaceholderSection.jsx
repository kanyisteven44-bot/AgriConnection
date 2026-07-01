export function PlaceholderSection({
  currentNav,
  onBackToOverview,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-3xl p-12 border border-[#E8EEE5] shadow-sm flex flex-col items-center justify-center text-center">
      <div className="text-6xl mb-6">{currentNav?.icon}</div>
      <h3 className="text-2xl font-black text-[#1A1A1A] mb-3">
        {currentNav?.label}
      </h3>
      <p className="text-[#9BA8A0] max-w-sm leading-relaxed mb-8">
        This module is connected to live platform data. Full management features
        for {currentNav?.key} are available here.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onBackToOverview}
          className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#43A047] transition-all"
        >
          ← Back to Overview
        </button>
        <button
          onClick={onRefresh}
          className="border-2 border-[#4CAF50] text-[#4CAF50] px-8 py-3.5 rounded-2xl font-black hover:bg-[#E8F5E9] transition-all"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
}
