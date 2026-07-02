"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function BuyerDashboard() {
  const { data: userData, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch("/api/orders");
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error("Error fetching buyer data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (userLoading || loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFBFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFBFA] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#2E4D2E] text-white p-8 hidden lg:block">
        <div className="flex items-center space-x-2 mb-12">
          <i className="fas fa-leaf text-[#8BC34A] text-2xl"></i>
          <span className="text-xl font-black tracking-tight">Buyer Panel</span>
        </div>

        <nav className="space-y-6">
          <a
            href="#"
            className="flex items-center space-x-4 text-[#8BC34A] bg-white/10 p-4 rounded-2xl"
          >
            <i className="fas fa-th-large"></i>
            <span className="font-bold">My Orders</span>
          </a>
          <a
            href="/marketplace"
            className="flex items-center space-x-4 text-[#C5D8C5] hover:text-white p-4"
          >
            <i className="fas fa-shopping-cart"></i>
            <span className="font-bold">Browse Market</span>
          </a>
          <a
            href="/buyer/favorites"
            className="flex items-center space-x-4 text-[#C5D8C5] hover:text-white p-4"
          >
            <i className="fas fa-heart"></i>
            <span className="font-bold">Saved Items</span>
          </a>
          <a
            href="/buyer/history"
            className="flex items-center space-x-4 text-[#C5D8C5] hover:text-white p-4"
          >
            <i className="fas fa-history"></i>
            <span className="font-bold">Order History</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-[#2E4D2E]">My Orders</h1>
            <p className="text-[#6B8E6B] mt-2">
              Track your purchases and delivery status.
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="/marketplace"
              className="bg-[#4CAF50] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-[#43A047] transition-all"
            >
              Shop Now
            </a>
            {userData?.user?.image ? (
              <img
                src={userData.user.image}
                alt="Profile"
                className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#2E4D2E] border-2 border-white flex items-center justify-center text-white font-black text-xl shadow-md">
                {(userData?.user?.name || "B")[0].toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E8EEE5]">
            <p className="text-[#6B8E6B] font-bold text-sm mb-2 uppercase tracking-widest">
              Active Orders
            </p>
            <p className="text-3xl font-black text-[#2E4D2E]">
              {orders.filter((o) => o.status !== "delivered").length}
            </p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E8EEE5]">
            <p className="text-[#6B8E6B] font-bold text-sm mb-2 uppercase tracking-widest">
              Completed
            </p>
            <p className="text-3xl font-black text-[#2E4D2E]">
              {orders.filter((o) => o.status === "delivered").length}
            </p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E8EEE5]">
            <p className="text-[#6B8E6B] font-bold text-sm mb-2 uppercase tracking-widest">
              Total Spent
            </p>
            <p className="text-3xl font-black text-[#4CAF50]">
              KSh{" "}
              {orders.reduce((acc, curr) => acc + Number(curr.total_price), 0)}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-[#E8EEE5] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F4F7F2] text-[#6B8E6B] text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6">Order ID</th>
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEE5]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-8 py-6 font-bold text-[#2E4D2E]">
                    #AC-{order.id}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          order.image_url ||
                          "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=80&q=60"
                        }
                        alt={order.product_name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-[#2E4D2E]">
                        {order.product_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-[#4CAF50]">
                    KSh {order.total_price}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === "delivered"
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button className="text-[#4CAF50] font-bold text-sm hover:underline">
                      Track
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-8 py-12 text-center text-[#6B8E6B]"
                  >
                    You haven't placed any orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default BuyerDashboard;
