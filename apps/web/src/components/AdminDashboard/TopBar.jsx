import { NAV_ITEMS } from "@/constants/adminDashboard";

export function TopBar({
  user,
  currentNav,
  mobileMenuOpen,
  setMobileMenuOpen,
  onRefresh,
}) {
  return (
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#E8EEE5] text-xl"
          onClick={() => setMobileMenuOpen(true)}
        >
          ☰
        </button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            {currentNav?.icon} {currentNav?.label}
          </h1>
          <p className="text-[#9BA8A0] text-sm font-bold mt-1">
            AgriConnection · Admin Panel
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[#E8EEE5]">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-black text-[#2E4D2E]">
            System Online
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="hidden sm:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[#E8EEE5] text-xs font-black text-[#555] hover:bg-[#E8F5E9] transition-all"
        >
          🔄 Refresh
        </button>
        <div className="w-10 h-10 bg-[#FBC02D] rounded-xl flex items-center justify-center font-black text-[#1A1A1A]">
          {(user?.name || "A")[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
}
