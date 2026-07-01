import { NAV_ITEMS } from "@/constants/adminDashboard";

export function Sidebar({
  activeSection,
  setActiveSection,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  return (
    <>
      <aside
        className={`${mobileMenuOpen ? "flex" : "hidden"} lg:flex flex-col w-72 bg-[#1A1A1A] text-white p-8 min-h-screen shadow-2xl fixed lg:relative z-40 lg:z-auto`}
      >
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#FBC02D] rounded-xl flex items-center justify-center font-black text-[#1A1A1A] text-lg">
            🛡️
          </div>
          <div>
            <p className="font-black text-base tracking-tight">AgriAdmin</p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
              Control Panel
            </p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveSection(item.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left ${
                activeSection === item.key
                  ? "bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/25"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-6 border-t border-white/10">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-white text-sm font-bold transition-all"
          >
            <span>←</span> Back to App
          </a>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
