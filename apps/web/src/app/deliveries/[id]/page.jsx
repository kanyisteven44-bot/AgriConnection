"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function DeliveryTrackingPage({ params }) {
  const { id } = params;
  const { data: user } = useUser();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDelivery = async () => {
      try {
        const res = await fetch(`/api/deliveries/${id}`);
        const data = await res.json();
        setDelivery(data.delivery);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDelivery();
  }, [id]);

  const steps = [
    { label: "Order Received", status: "completed", icon: "fa-check-circle" },
    {
      label: "Driver Assigned",
      status: delivery?.status !== "pending" ? "completed" : "active",
      icon: "fa-user-truck",
    },
    {
      label: "In Transit",
      status:
        delivery?.status === "in_transit" || delivery?.status === "delivered"
          ? "completed"
          : "waiting",
      icon: "fa-truck-fast",
    },
    {
      label: "Delivered",
      status: delivery?.status === "delivered" ? "completed" : "waiting",
      icon: "fa-box-check",
    },
  ];

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F7FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#2E7D32]"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#333333]">
      <nav className="bg-[#2E7D32] text-white p-8 px-12 sticky top-0 z-50 shadow-xl flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">
              Track Delivery
            </h1>
            <p className="text-[10px] font-bold text-[#C5D8C5] uppercase tracking-widest mt-1">
              Order #AC-{id}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-3 bg-white/10 px-6 py-2 rounded-2xl border border-white/10">
          <i className="fas fa-shield-check text-[#FBC02D]"></i>
          <span className="text-xs font-black uppercase tracking-widest text-[#C5D8C5]">
            Buyer Protection Active
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Side: Status & Details */}
        <div className="flex-1 space-y-10">
          <div className="bg-white p-12 rounded-[48px] shadow-sm border border-[#E8EEE5]">
            <h2 className="text-3xl font-black mb-12 flex items-center">
              <span className="w-2 h-8 bg-[#FBC02D] rounded-full mr-4"></span>
              Real-time Status
            </h2>

            <div className="relative pl-12 space-y-12">
              <div className="absolute left-6 top-2 bottom-8 w-1 bg-[#E8EEE5]"></div>
              {steps.map((step, i) => (
                <div key={i} className="relative group">
                  <div
                    className={`absolute -left-[30px] top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                      step.status === "completed"
                        ? "bg-[#2E7D32] shadow-[0_0_15px_#2E7D32]"
                        : step.status === "active"
                          ? "bg-[#FBC02D] animate-pulse"
                          : "bg-[#E8EEE5]"
                    }`}
                  >
                    <i
                      className={`fas ${step.status === "completed" ? "fa-check" : step.icon} text-xs text-white`}
                    ></i>
                  </div>
                  <div className="bg-[#F5F7FA] p-6 rounded-3xl group-hover:translate-x-2 transition-transform duration-300">
                    <h3
                      className={`text-lg font-black ${step.status === "completed" ? "text-[#2E7D32]" : "text-[#333333]"}`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-sm font-bold text-[#6B8E6B] mt-1">
                      {step.status === "completed"
                        ? "Operation successful"
                        : step.status === "active"
                          ? "In progress..."
                          : "Awaiting previous step"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#333333] p-10 rounded-[48px] text-white shadow-2xl">
            <h3 className="text-xl font-black mb-8 text-[#FBC02D]">
              Transport Information
            </h3>
            <div className="flex items-center space-x-6 mb-10">
              <div className="w-20 h-20 bg-white/10 rounded-[24px] flex items-center justify-center text-3xl">
                <i className="fas fa-truck"></i>
              </div>
              <div>
                <p className="text-2xl font-black">
                  {delivery?.transporter_name || "Assigning Driver..."}
                </p>
                <p className="text-[#C5D8C5] font-bold text-sm uppercase tracking-widest mt-1">
                  {delivery?.vehicle_type ||
                    "Scanning nearest logistics partners"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
              <div>
                <p className="text-[10px] font-black uppercase text-[#6B8E6B] tracking-[2px] mb-2">
                  Estimated Arrival
                </p>
                <p className="text-xl font-black">2.5 Hours</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-[#6B8E6B] tracking-[2px] mb-2">
                  Current Location
                </p>
                <p className="text-xl font-black">Nakuru Interchange</p>
              </div>
            </div>
            <button className="w-full bg-[#2E7D32] py-4 rounded-2xl font-black mt-10 hover:bg-[#1B5E20] transition-all shadow-xl">
              <i className="fas fa-phone-alt mr-3"></i> Call Driver
            </button>
          </div>
        </div>

        {/* Right Side: Map Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-12">
          <div className="bg-white p-6 rounded-[64px] shadow-2xl border border-[#E8EEE5] overflow-hidden flex-1 min-h-[500px] relative">
            <div className="absolute inset-0 bg-[#E8EEE5] flex flex-col items-center justify-center">
              {/* This is where a real map would render - using placeholder visual */}
              <div className="w-full h-full bg-[#FAFBFA] relative">
                <div className="absolute inset-0 opacity-20">
                  {/* Grid lines to simulate map */}
                  <div className="w-full h-full border-2 border-[#E8EEE5] grid grid-cols-12 grid-rows-12">
                    {Array(144)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="border border-[#E8EEE5]/10"
                        ></div>
                      ))}
                  </div>
                </div>
                {/* Visual Map Markers */}
                <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-[#2E7D32] rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce">
                  <i className="fas fa-truck text-white text-sm"></i>
                </div>
                <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-[#FBC02D] rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
                  <i className="fas fa-map-marker-alt text-[#2E7D32] text-sm"></i>
                </div>
                {/* Route Line Simulation */}
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d="M 250 200 Q 400 300 600 450"
                    fill="none"
                    stroke="#2E7D32"
                    strokeWidth="6"
                    strokeDasharray="10,10"
                    className="opacity-40"
                  />
                </svg>
              </div>
              <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase text-[#6B8E6B] tracking-[2px]">
                      Destination
                    </p>
                    <p className="text-lg font-black text-[#2E7D32]">
                      Eldoret North Hub
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-[#6B8E6B] tracking-[2px]">
                      Distance Left
                    </p>
                    <p className="text-lg font-black text-[#333333]">42.5 km</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[48px] border border-[#E8EEE5] shadow-sm">
            <h3 className="text-xl font-black mb-6">Product Details</h3>
            <div className="flex items-center space-x-6">
              <img
                src={delivery?.image_url || "https://via.placeholder.com/80"}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div>
                <p className="text-lg font-black text-[#2E7D32]">
                  {delivery?.product_name || "Loading Product..."}
                </p>
                <p className="text-sm font-bold text-[#6B8E6B]">
                  Quantity: 500kg
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DeliveryTrackingPage;
