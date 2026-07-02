"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function FarmerDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    deliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, productsRes, ordersRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/products?sellerId=current"),
          fetch("/api/orders"),
        ]);

        const [pData, prData, oData] = await Promise.all([
          profileRes.json(),
          productsRes.json(),
          ordersRes.json(),
        ]);

        setProfile(pData);
        const prodCount = prData.products?.length || 0;
        const ords = oData.orders || [];
        const rev = ords.reduce(
          (acc, curr) =>
            acc + (curr.status === "delivered" ? Number(curr.total_price) : 0),
          0,
        );
        const deliv = ords.filter(
          (o) => o.status === "confirmed" || o.status === "shipped",
        ).length;

        setStats({
          products: prodCount,
          orders: ords.length,
          revenue: rev,
          deliveries: deliv,
        });

        if (pData.user?.location) {
          const wRes = await fetch(`/api/weather?city=${pData.user.location}`);
          const wData = await wRes.json();
          setWeather(wData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: "fa-th-large", active: true, href: "#" },
    { name: "Products", icon: "fa-wheat-awn", href: "/farmer/products" },
    { name: "Orders", icon: "fa-box", href: "/farmer/orders" },
    { name: "Earnings", icon: "fa-wallet", href: "/farmer/earnings" },
    { name: "Weather", icon: "fa-cloud", href: "/farmer/weather" },
    { name: "AI Assistant", icon: "fa-robot", href: "/farmer/advisor" },
    { name: "Learning Hub", icon: "fa-book-open", href: "/learning" },
    { name: "Deliveries", icon: "fa-truck", href: "/farmer/deliveries" },
    { name: "Settings", icon: "fa-cog", href: "/farmer/settings" },
  ];

  if (userLoading || loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#2E7D32]"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex font-sans text-[#333333]">
      {/* Sidebar */}
      <aside className="w-80 bg-[#2E7D32] text-white p-10 hidden lg:flex flex-col shadow-2xl">
        <div className="flex items-center space-x-3 mb-16">
          <div className="bg-white p-2 rounded-xl">
            <i className="fas fa-leaf text-[#2E7D32] text-xl"></i>
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            AgriFarmer
          </span>
        </div>

        <nav className="space-y-3 flex-1">
          {menuItems.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`flex items-center space-x-4 p-4 rounded-[20px] transition-all duration-300 font-bold ${
                item.active
                  ? "bg-white/15 text-[#FBC02D] shadow-inner border border-white/5"
                  : "text-[#C5D8C5] hover:bg-white/10 hover:text-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.active ? "bg-[#FBC02D] text-[#2E7D32]" : ""}`}
              >
                <i className={`fas ${item.icon}`}></i>
              </div>
              <span className="text-sm tracking-wide">{item.name}</span>
            </a>
          ))}
        </nav>

        <div className="pt-10 border-t border-white/10">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black uppercase tracking-[2px] text-[#FBC02D]">
                Storage Limit
              </p>
              <p className="text-[10px] font-bold">85%</p>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FBC02D] w-[85%] rounded-full shadow-[0_0_10px_#FBC02D]"></div>
            </div>
          </div>
          <a
            href="/account/logout"
            className="mt-8 flex items-center space-x-4 p-4 text-[#FBC02D] font-black hover:scale-105 transition-transform"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-4xl font-black text-[#333333] tracking-tight">
              Good Morning, {user?.name || "Farmer"}!
            </h1>
            <p className="text-[#6B8E6B] mt-2 font-medium">
              Optimize your farm operations with real-time insights.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <button className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-[#E8EEE5] text-[#2E7D32] hover:bg-[#F5F7FA] transition-all">
                <i className="fas fa-bell"></i>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-4 border-[#F5F7FA]"></span>
              </button>
            </div>
            <div className="flex items-center space-x-4 bg-white p-2 pr-6 rounded-2xl shadow-xl border border-[#E8EEE5]">
              {profile?.user?.profile_photo ? (
                <img
                  src={profile.user.profile_photo}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover shadow-inner"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white font-black text-lg shadow-inner">
                  {(user?.name || "F")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-black text-[#333333] leading-none">
                  {user?.name || "Farmer"}
                </p>
                <p className="text-[10px] font-bold text-[#6B8E6B] uppercase tracking-wider mt-1">
                  {user?.role || "farmer"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            {
              label: "Total Products",
              value: stats.products,
              color: "text-[#2E7D32]",
              icon: "fa-seedling",
            },
            {
              label: "Orders Received",
              value: stats.orders,
              color: "text-[#66BB6A]",
              icon: "fa-shopping-cart",
            },
            {
              label: "Total Earnings",
              value: `KSh ${stats.revenue.toLocaleString()}`,
              color: "text-[#FBC02D]",
              icon: "fa-wallet",
            },
            {
              label: "Pending Delivery",
              value: stats.deliveries,
              color: "text-[#333333]",
              icon: "fa-truck",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-[48px] shadow-sm border border-[#E8EEE5] hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-[#F5F7FA] rounded-2xl flex items-center justify-center text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white transition-all shadow-inner">
                  <i className={`fas ${card.icon} text-xl`}></i>
                </div>
                <div className="text-[10px] font-black text-[#6B8E6B] uppercase tracking-[2px]">
                  Overview
                </div>
              </div>
              <p className="text-3xl font-black text-[#333333] mb-2">
                {card.value}
              </p>
              <p className="text-xs font-bold text-[#6B8E6B] uppercase tracking-widest">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Weather & Recommendations */}
            <div className="bg-[#2E7D32] rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[2s]"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-[#FBC02D] p-3 rounded-2xl text-[#2E7D32]">
                      <i className="fas fa-cloud-sun-rain text-xl"></i>
                    </div>
                    <span className="text-sm font-black uppercase tracking-[3px]">
                      Climate Insights
                    </span>
                  </div>
                  <div className="flex items-end space-x-6 mb-8">
                    <p className="text-7xl font-black">
                      {weather?.temperature || "23"}°C
                    </p>
                    <div className="pb-2">
                      <p className="text-2xl font-bold">
                        {weather?.condition || "Rainy"}
                      </p>
                      <p className="text-[#C5D8C5] font-medium">
                        {profile?.user?.location || "Your Region"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <p className="text-sm font-bold flex items-center">
                      <i className="fas fa-magic text-[#FBC02D] mr-3"></i>
                      AI Suggestion:{" "}
                      <span className="text-white ml-1 font-black">
                        {weather?.suggestion ||
                          "Rain expected tomorrow — delay irrigation by 24 hours."}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col justify-between items-end">
                  <div className="grid grid-cols-2 gap-8 text-right">
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">
                        Rain Probability
                      </p>
                      <p className="text-2xl font-black">
                        {weather?.humidity || "65"}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-60">
                        Wind Speed
                      </p>
                      <p className="text-2xl font-black">
                        {weather?.wind || "12"}km/h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart Placeholder */}
            <div className="bg-white p-10 rounded-[48px] border border-[#E8EEE5] shadow-sm">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black text-[#333333]">
                  Earnings Performance
                </h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-[#F5F7FA] rounded-xl text-xs font-black text-[#6B8E6B] hover:bg-[#E8EEE5]">
                    Weekly
                  </button>
                  <button className="px-4 py-2 bg-[#2E7D32] rounded-xl text-xs font-black text-white shadow-lg">
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between space-x-4">
                {[45, 60, 40, 80, 55, 90, 70, 85, 60, 75, 50, 95].map(
                  (val, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div
                        className="w-full bg-[#F5F7FA] group-hover:bg-[#2E7D32] rounded-t-xl transition-all duration-500 cursor-pointer shadow-sm group-hover:shadow-[0_0_20px_#2E7D32]"
                        style={{ height: `${val}%` }}
                      ></div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#333333] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}k
                      </div>
                    </div>
                  ),
                )}
              </div>
              <div className="flex justify-between mt-6 text-[10px] font-black text-[#6B8E6B] uppercase tracking-widest opacity-60">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar Activity */}
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-[#333333]">
                Recent Activity
              </h3>
              <i className="fas fa-history text-[#6B8E6B]"></i>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: "Payment Received",
                  time: "2 hours ago",
                  icon: "fa-check-circle",
                  color: "text-green-500",
                },
                {
                  title: "New Order: 50kg Potatoes",
                  time: "5 hours ago",
                  icon: "fa-shopping-basket",
                  color: "text-orange-500",
                },
                {
                  title: "Delivery In Transit",
                  time: "Yesterday",
                  icon: "fa-truck",
                  color: "text-blue-500",
                },
                {
                  title: "Market Price Alert: Corn UP",
                  time: "2 days ago",
                  icon: "fa-arrow-up",
                  color: "text-[#FBC02D]",
                },
              ].map((act, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl border border-[#E8EEE5] shadow-sm flex items-center space-x-6 hover:translate-x-2 transition-transform duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${act.color} bg-[#F5F7FA]`}
                  >
                    <i className={`fas ${act.icon}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#333333]">
                      {act.title}
                    </p>
                    <p className="text-xs font-medium text-[#6B8E6B] mt-1">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-[#333333] rounded-[48px] p-10 text-white shadow-2xl">
              <h3 className="text-xl font-black mb-8 text-[#FBC02D]">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/farmer/products/new"
                  className="bg-white/10 p-6 rounded-3xl border border-white/5 flex flex-col items-center hover:bg-[#2E7D32] transition-all"
                >
                  <i className="fas fa-plus-circle text-2xl mb-3"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">
                    Add Product
                  </span>
                </a>
                <a
                  href="/farmer/records"
                  className="bg-white/10 p-6 rounded-3xl border border-white/5 flex flex-col items-center hover:bg-[#2E7D32] transition-all"
                >
                  <i className="fas fa-file-invoice text-2xl mb-3"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">
                    Log Sales
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FarmerDashboard;
