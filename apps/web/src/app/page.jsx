"use client";
import { useState, useEffect, useRef } from "react";
import useUser from "@/utils/useUser";

function useCounter(target, duration, started) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let val = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      val += step;
      if (val >= target) {
        setCount(target);
        clearInterval(t);
      } else setCount(Math.floor(val));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration, started]);
  return count;
}

const FEATURES = [
  {
    icon: "fa-robot",
    title: "AI Farm Advisor",
    desc: "24/7 intelligent crop disease detection, pest alerts and smart planting recommendations powered by advanced AI.",
    color: "bg-[#E8F5E9]",
    ic: "#2E7D32",
  },
  {
    icon: "fa-cloud-sun-rain",
    title: "GPS Weather Intelligence",
    desc: "Real-time weather at your exact GPS location. Rain alerts, UV index, wind speed and personalized AI farming tips.",
    color: "bg-[#E3F2FD]",
    ic: "#1565C0",
  },
  {
    icon: "fa-store",
    title: "Direct Marketplace",
    desc: "Sell directly to buyers without middlemen. List produce, set your price and receive M-Pesa payments instantly.",
    color: "bg-[#FFF3E0]",
    ic: "#E65100",
  },
  {
    icon: "fa-truck",
    title: "Smart Logistics",
    desc: "Book verified transporters in minutes. Live GPS tracking of your delivery from farm to buyer.",
    color: "bg-[#F3E5F5]",
    ic: "#6A1B9A",
  },
  {
    icon: "fa-comments",
    title: "Farmer Community",
    desc: "Connect with 10,000+ farmers. Share experiences, ask experts and grow together across all 47 counties.",
    color: "bg-[#E0F7FA]",
    ic: "#00838F",
  },
  {
    icon: "fa-chart-line",
    title: "Finance Tracker",
    desc: "Track every shilling — income, expenses, harvests. Smart reports show exactly where your money goes.",
    color: "bg-[#FFF8E1]",
    ic: "#F9A825",
  },
];

const ROLES = [
  {
    emoji: "🌾",
    role: "Farmers",
    desc: "List produce, get AI advice, GPS weather, manage finances and book transport.",
    perks: ["AI Disease Detection", "GPS Weather", "Direct Buyer Access"],
  },
  {
    emoji: "🛒",
    role: "Buyers",
    desc: "Find verified farmers, compare prices, order in bulk and track delivery live.",
    perks: ["Verified Sellers", "Bulk Ordering", "Live Tracking"],
  },
  {
    emoji: "🚚",
    role: "Transporters",
    desc: "Receive delivery requests, navigate GPS routes and earn income per successful job.",
    perks: ["GPS Routes", "Job Alerts", "Earnings Dashboard"],
  },
  {
    emoji: "🔬",
    role: "Experts",
    desc: "Answer farmer questions, conduct video consultations and build your reputation.",
    perks: ["Video Calls", "Consultation Fees", "Expert Badge"],
  },
  {
    emoji: "📦",
    role: "Suppliers",
    desc: "List seeds, fertilizers and equipment. Connect with thousands of active farmers.",
    perks: ["Farm Input Market", "Bulk Deals", "Analytics"],
  },
  {
    emoji: "🥬",
    role: "Consumers",
    desc: "Buy fresh produce from verified farms. Track your food from field to your door.",
    perks: ["Farm-Fresh", "Delivery Tracking", "Quality Guarantee"],
  },
];

const TESTIMONIALS = [
  {
    name: "James Kamau",
    role: "Maize Farmer, Nakuru",
    text: "Before AgriConnection, I sold maize at KSh 2,800/bag through middlemen. Now I get KSh 3,500 direct to buyers. My income grew 25% in 3 months.",
    av: "JK",
  },
  {
    name: "Mary Wanjiku",
    role: "Vegetable Supplier, Nairobi",
    text: "The AI disease detector saved my tomato farm. It identified blight before it spread and told me exactly which treatment to use. Saved 80% of my crop.",
    av: "MW",
  },
  {
    name: "Peter Ochieng",
    role: "Livestock Buyer, Kisumu",
    text: "I find verified livestock sellers across 15 counties. The GPS location shows exactly which farms are closest to me. Truly incredible platform.",
    av: "PO",
  },
];

function HomePage() {
  const { data: user } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countersStarted, setCountersStarted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const statsRef = useRef(null);

  const farmersCount = useCounter(15240, 2000, countersStarted);
  const productsCount = useCounter(48500, 2000, countersStarted);
  const countiesCount = useCounter(47, 1500, countersStarted);
  const successCount = useCounter(98, 1800, countersStarted);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/products?limit=8");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCountersStarted(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const getDashboardHref = () => {
    if (!user) return "/account/signin";
    const map = {
      farmer: "/farmer/dashboard",
      buyer: "/buyer/dashboard",
      admin: "/admin/dashboard",
    };
    return map[user.role] || "/farmer/dashboard";
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A] overflow-x-hidden">
      {/* NAV */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-[#E8EEE5] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-3">
            <img
              src="https://raw.createusercontent.com/67b58c49-6247-4e0b-ad44-dd03c1cbf914/"
              alt="AgriConnection Logo"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-black text-[#2E7D32] tracking-tight">
              AgriConnection
            </span>
          </a>
          <div className="hidden lg:flex items-center gap-8 text-sm font-bold">
            {[
              ["Home", "/"],
              ["Marketplace", "/marketplace"],
              ["Weather", "/weather"],
              ["Find Users", "/search"],
              ["Learning", "/learning"],
            ].map(([l, h]) => (
              <a
                key={l}
                href={h}
                className="text-[#555] hover:text-[#2E7D32] transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <a
                href={getDashboardHref()}
                className="bg-[#2E7D32] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1B5E20] transition-all"
              >
                My Dashboard
              </a>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="text-[#2E7D32] font-bold hover:underline"
                >
                  Login
                </a>
                <a
                  href="/account/signup"
                  className="bg-[#2E7D32] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-[#1B5E20] transition-all"
                >
                  Join Free
                </a>
              </>
            )}
          </div>
          <button
            className="lg:hidden text-[#2E7D32] text-xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`} />
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E8EEE5] px-6 py-4 space-y-3">
            {[
              ["Marketplace", "/marketplace"],
              ["Weather", "/weather"],
              ["Learning", "/learning"],
            ].map(([l, h]) => (
              <a
                key={l}
                href={h}
                className="block text-sm font-bold text-[#555] py-2"
              >
                {l}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <a
                href="/account/signin"
                className="flex-1 text-center border-2 border-[#2E7D32] text-[#2E7D32] py-2.5 rounded-xl font-bold text-sm"
              >
                Login
              </a>
              <a
                href="/account/signup"
                className="flex-1 text-center bg-[#2E7D32] text-white py-2.5 rounded-xl font-bold text-sm"
              >
                Join Free
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80"
            className="w-full h-full object-cover"
            alt="Farm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2B0A]/92 via-[#0A2B0A]/72 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#FBC02D]/20 border border-[#FBC02D]/40 px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 bg-[#FBC02D] rounded-full" />
              <span className="text-[#FBC02D] text-sm font-black tracking-wider">
                KENYA'S #1 AGRICULTURE PLATFORM
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
              Grow <span className="text-[#FBC02D]">Smarter</span>.<br />
              Sell <span className="text-[#81C784]">Faster</span>.<br />
              Earn Better.
            </h1>
            <p className="text-lg text-white/75 leading-relaxed mb-10 max-w-lg">
              Connecting 15,000+ farmers, buyers, suppliers and transporters
              across Kenya. GPS weather, AI advisor, live marketplace and
              instant M-Pesa payments — all in one place.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <a
                href="/account/signup"
                className="bg-[#2E7D32] text-white px-8 py-4 rounded-2xl text-base font-black shadow-2xl hover:bg-[#1B5E20] transition-all hover:-translate-y-1"
              >
                🌱 Get Started Free
              </a>
              <a
                href="/marketplace"
                className="bg-white/15 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-2xl text-base font-black hover:bg-white/25 transition-all"
              >
                🛒 Explore Marketplace
              </a>
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                ["🛡️", "Verified ID"],
                ["💳", "M-Pesa Payments"],
                ["📍", "GPS Weather"],
                ["🤖", "AI Assistant"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-white/65 text-sm font-medium"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="bg-[#1B5E20] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                value: farmersCount.toLocaleString() + "+",
                label: "Farmers Registered",
                icon: "fa-users",
              },
              {
                value: productsCount.toLocaleString() + "+",
                label: "Products Listed",
                icon: "fa-boxes",
              },
              {
                value: countiesCount + "/47",
                label: "Counties Covered",
                icon: "fa-map-marked-alt",
              },
              {
                value: successCount + "%",
                label: "Delivery Success Rate",
                icon: "fa-truck-loading",
              },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${s.icon} text-[#FBC02D] text-xl`} />
                </div>
                <p className="text-4xl font-black text-white mb-1">{s.value}</p>
                <p className="text-sm text-white/55 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-[#F4F7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#2E7D32] text-sm font-black tracking-widest uppercase">
              Everything You Need
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mt-3 mb-5">
              Built for Kenyan Farmers
            </h2>
            <p className="text-[#6B6B6B] text-lg max-w-2xl mx-auto leading-relaxed">
              Every feature is designed around real challenges farmers face —
              from crop diseases to finding buyers and tracking weather at your
              exact GPS location.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <i
                    className={`fas ${f.icon} text-xl`}
                    style={{ color: f.ic }}
                  />
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A] mb-3 group-hover:text-[#2E7D32] transition-colors">
                  {f.title}
                </h3>
                <p className="text-[#6B6B6B] leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#2E7D32] text-sm font-black tracking-widest uppercase">
              Simple Process
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mt-3">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Register with First Name, Last Name, National ID, phone number, email, location and profile photo. Choose your role.",
                icon: "fa-user-plus",
              },
              {
                step: "02",
                title: "Verify Your Identity",
                desc: "Upload your National ID photo and allow location access. Verified users get a trusted badge visible to all buyers and sellers.",
                icon: "fa-id-card",
              },
              {
                step: "03",
                title: "Start Connecting",
                desc: "List produce, find buyers, book transport, get GPS weather and AI crop advice — all from your personalized dashboard.",
                icon: "fa-handshake",
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-[#E8F5E9] rounded-3xl flex items-center justify-center mx-auto">
                    <i className={`fas ${step.icon} text-3xl text-[#2E7D32]`} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#FBC02D] rounded-full flex items-center justify-center text-xs font-black text-[#1A1A1A]">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#1A1A1A] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#6B6B6B] leading-relaxed text-sm max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section className="py-24 bg-[#F4F7F2]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-[#2E7D32] text-sm font-black tracking-widest uppercase">
                Live Listings
              </span>
              <h2 className="text-4xl font-black text-[#1A1A1A] mt-2">
                Fresh from the Farm
              </h2>
              <div className="h-1.5 w-16 bg-[#FBC02D] mt-4 rounded-full" />
            </div>
            <a
              href="/marketplace"
              className="flex items-center gap-2 bg-[#2E7D32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition-all"
            >
              View All <i className="fas fa-arrow-right" />
            </a>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-white rounded-3xl border border-[#E8EEE5]"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-[#6B6B6B] text-lg font-medium mb-6">
                No products listed yet — be the first seller!
              </p>
              <a
                href="/account/signup"
                className="inline-block bg-[#2E7D32] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1B5E20] transition-all"
              >
                Start Selling
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((p) => (
                <a
                  href="/marketplace"
                  key={p.id}
                  className="bg-white rounded-3xl overflow-hidden border border-[#E8EEE5] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group block"
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={
                        p.image_url ||
                        "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&q=70"
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      alt={p.name}
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-[#2E7D32] uppercase">
                      {p.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-[#1A1A1A] mb-1 group-hover:text-[#2E7D32] transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-[#6B6B6B] text-xs mb-3">
                      by {p.seller_name || "Local Farmer"}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-black text-[#2E7D32]">
                        KSh {p.price}
                        <span className="text-xs text-[#9BA8A0] font-normal">
                          /{p.unit}
                        </span>
                      </p>
                      <span className="text-xs text-[#6B6B6B]">
                        📍 {p.location || "Kenya"}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="py-24 bg-[#1B5E20]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Who Is AgriConnection For?
            </h2>
            <p className="text-white/65 text-lg max-w-2xl mx-auto">
              The platform adapts to your role — your dashboard, features and
              tools all change automatically based on who you are.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur border border-white/15 rounded-3xl p-7 hover:bg-white/15 transition-all"
              >
                <div className="text-4xl mb-4">{r.emoji}</div>
                <h3 className="text-xl font-black text-white mb-2">{r.role}</h3>
                <p className="text-white/65 text-sm leading-relaxed mb-5">
                  {r.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {r.perks.map((p) => (
                    <span
                      key={p}
                      className="bg-[#FBC02D]/20 text-[#FBC02D] text-xs font-bold px-3 py-1 rounded-full"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/account/signup"
              className="inline-block bg-[#FBC02D] text-[#1A1A1A] px-10 py-4 rounded-2xl font-black text-lg hover:bg-[#F9A825] transition-all hover:-translate-y-1 shadow-xl"
            >
              Join AgriConnection Free →
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#2E7D32] text-sm font-black tracking-widest uppercase">
              Real Stories
            </span>
            <h2 className="text-4xl font-black text-[#1A1A1A] mt-3">
              Farmers Are Succeeding
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-[#F4F7F2] rounded-3xl p-8 border border-[#E8EEE5]"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <i key={j} className="fas fa-star text-[#FBC02D] text-sm" />
                  ))}
                </div>
                <p className="text-[#444] leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#2E7D32] rounded-xl flex items-center justify-center font-black text-white">
                    {t.av}
                  </div>
                  <div>
                    <p className="font-black text-[#1A1A1A] text-sm">
                      {t.name}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F4F7F2]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-[#6B6B6B] text-lg mb-10 max-w-xl mx-auto">
            Join 15,000+ farmers already earning more, losing less and growing
            smarter with AgriConnection.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/account/signup"
              className="bg-[#2E7D32] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#1B5E20] transition-all hover:-translate-y-1"
            >
              Create Free Account
            </a>
            <a
              href="/marketplace"
              className="border-2 border-[#2E7D32] text-[#2E7D32] px-10 py-4 rounded-2xl font-black text-lg hover:bg-[#E8F5E9] transition-all"
            >
              Browse Marketplace
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center">
                  <i className="fas fa-leaf text-white text-lg" />
                </div>
                <span className="text-xl font-black tracking-tight">
                  AgriConnection
                </span>
              </div>
              <p className="text-white/55 leading-relaxed max-w-sm mb-6">
                Kenya's most trusted smart agriculture ecosystem — connecting
                farmers, buyers, suppliers and transporters in one platform.
              </p>
              <div className="flex gap-4">
                {[
                  "fa-facebook",
                  "fa-twitter",
                  "fa-instagram",
                  "fa-youtube",
                ].map((icon) => (
                  <a
                    key={icon}
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white/60 hover:bg-[#2E7D32] hover:text-white transition-all"
                  >
                    <i className={`fab ${icon} text-sm`} />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black mb-6 text-[#FBC02D] uppercase tracking-widest text-xs">
                Quick Links
              </h4>
              <ul className="space-y-3 text-white/55 text-sm">
                {[
                  ["Marketplace", "/marketplace"],
                  ["Weather Centre", "/weather"],
                  ["AI Advisor", "/farmer/advisor"],
                  ["Learning Hub", "/learning"],
                  ["Find Users", "/search"],
                  ["Admin Panel", "/admin/dashboard"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <a href={h} className="hover:text-white transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-6 text-[#FBC02D] uppercase tracking-widest text-xs">
                Newsletter
              </h4>
              <p className="text-white/55 text-sm mb-4">
                Get weekly farming tips, market prices and weather alerts free.
              </p>
              {newsletterSent ? (
                <div className="bg-[#2E7D32]/30 border border-[#2E7D32] rounded-xl px-4 py-3 text-sm text-[#81C784] font-bold">
                  ✅ Subscribed!
                </div>
              ) : (
                <div className="flex">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-white/10 border border-white/15 text-white placeholder-white/30 px-4 py-3 rounded-l-xl text-sm focus:outline-none focus:border-[#2E7D32]"
                  />
                  <button
                    onClick={() => {
                      if (newsletterEmail.includes("@"))
                        setNewsletterSent(true);
                    }}
                    className="bg-[#2E7D32] px-4 py-3 rounded-r-xl hover:bg-[#1B5E20] transition-all"
                  >
                    <i className="fas fa-paper-plane text-white text-sm" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2026 AgriConnection. All rights reserved.
            </p>
            <div className="flex gap-6 text-white/40 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/contact" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
