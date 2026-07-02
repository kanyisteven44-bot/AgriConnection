"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function MarketplacePage() {
  const { data: user } = useUser();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const categories = [
    { name: "All Produce", value: "" },
    { name: "Vegetables", value: "vegetables" },
    { name: "Cereals", value: "cereals" },
    { name: "Fruits", value: "fruits" },
    { name: "Seeds", value: "seeds" },
    { name: "Fertilizers", value: "fertilizers" },
    { name: "Equipment", value: "equipment" },
  ];

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?category=${category}&query=${search}`;
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = "/account/signin";
      return;
    }
    setPurchaseLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          quantity: 1,
          payment_method: "mpesa",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        alert("Payment initiated! Check your phone for M-Pesa prompt.");
        window.location.href = `/deliveries/${data.order.id}`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#333333]">
      {/* Dynamic Nav */}
      <nav className="bg-[#2E7D32] text-white py-6 px-12 sticky top-0 z-[100] shadow-2xl flex justify-between items-center">
        <a href="/" className="flex items-center space-x-3 group">
          <div className="bg-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <i className="fas fa-leaf text-[#2E7D32] text-xl"></i>
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter">
            AgriMarket
          </span>
        </a>

        <div className="flex-1 max-w-2xl mx-12">
          <div className="bg-white/10 border border-white/20 rounded-2xl flex items-center px-6 focus-within:bg-white/20 transition-all">
            <i className="fas fa-search text-[#C5D8C5]"></i>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && fetchProducts()}
              placeholder="Search premium harvest, seeds, tools..."
              className="bg-transparent border-none outline-none flex-1 px-4 py-3 font-bold text-white placeholder-[#C5D8C5]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <a
            href="/search"
            className="flex items-center space-x-2 cursor-pointer hover:text-[#FBC02D] transition-colors"
          >
            <i className="fas fa-users"></i>
            <span className="text-sm font-black uppercase tracking-widest hidden md:block">
              Find Users
            </span>
          </a>
          <div className="flex items-center space-x-2 cursor-pointer hover:text-[#FBC02D] transition-colors">
            <i className="fas fa-shopping-cart"></i>
            <span className="text-sm font-black uppercase tracking-widest">
              Cart
            </span>
            <span className="bg-[#FBC02D] text-[#2E7D32] text-[10px] font-black px-2 py-0.5 rounded-full">
              0
            </span>
          </div>
          {user ? (
            user.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-12 h-12 rounded-2xl border-4 border-white/10 shadow-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 border-4 border-white/10 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {(user.name || "U")[0].toUpperCase()}
              </div>
            )
          ) : (
            <a
              href="/account/signin"
              className="bg-[#FBC02D] text-[#2E7D32] px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
            >
              Sign In
            </a>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-80 space-y-10">
          <div>
            <h3 className="text-[10px] font-black text-[#6B8E6B] uppercase tracking-[3px] mb-6">
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`w-full text-left px-8 py-4 rounded-3xl font-black transition-all border ${
                    category === cat.value
                      ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-2xl -translate-y-1"
                      : "bg-white text-[#6B8E6B] border-[#E8EEE5] hover:bg-[#F5F7FA]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-[#E8EEE5] shadow-sm">
            <h3 className="text-[10px] font-black text-[#6B8E6B] uppercase tracking-[3px] mb-8">
              Price Filter
            </h3>
            <input
              type="range"
              className="w-full h-2 bg-[#F5F7FA] rounded-full appearance-none cursor-pointer accent-[#2E7D32]"
            />
            <div className="flex justify-between mt-4 text-xs font-black text-[#2E7D32]">
              <span>KSh 0</span>
              <span>KSh 100k+</span>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tight">
                {category
                  ? `${categories.find((c) => c.value === category).name}`
                  : "All Produce"}
              </h2>
              <p className="text-[#6B8E6B] font-bold mt-2 uppercase text-[10px] tracking-widest">
                Showing {products.length} fresh results
              </p>
            </div>
            <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-[#E8EEE5]">
              <button className="w-10 h-10 bg-[#F5F7FA] rounded-xl flex items-center justify-center text-[#2E7D32]">
                <i className="fas fa-th-large"></i>
              </button>
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-[#6B8E6B]">
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[450px] bg-white rounded-[48px] animate-pulse border border-[#E8EEE5]"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-[48px] overflow-hidden shadow-sm hover:shadow-[0_20px_60px_-15px_rgba(46,125,50,0.15)] transition-all duration-500 border border-[#E8EEE5] cursor-pointer group flex flex-col"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={
                        product.image_url ||
                        "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&q=70"
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-[#2E7D32] shadow-sm uppercase tracking-widest">
                      {product.category}
                    </div>
                    <div className="absolute bottom-6 right-6 bg-[#FBC02D] px-3 py-1.5 rounded-xl shadow-xl flex items-center space-x-2">
                      <i className="fas fa-star text-[#2E7D32] text-xs"></i>
                      <span className="text-xs font-black text-[#2E7D32]">
                        4.8
                      </span>
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black text-[#333333] mb-3 group-hover:text-[#2E7D32] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[#6B8E6B] text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-auto space-y-6">
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-black text-[#2E7D32]">
                          KSh {product.price}
                          <span className="text-[10px] text-[#6B8E6B] uppercase font-bold ml-1">
                            /{product.unit}
                          </span>
                        </p>
                        <div className="flex items-center text-[#6B8E6B] text-[10px] font-black uppercase tracking-widest">
                          <i className="fas fa-map-marker-alt text-[#FBC02D] mr-2"></i>{" "}
                          {product.location}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="bg-[#F5F7FA] text-[#2E7D32] font-black py-4 rounded-2xl hover:bg-[#E8EEE5] transition-all text-xs uppercase tracking-widest">
                          Cart
                        </button>
                        <button className="bg-[#2E7D32] text-white font-black py-4 rounded-2xl shadow-xl hover:bg-[#1B5E20] transition-all text-xs uppercase tracking-widest">
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modern Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#2E7D32]/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[64px] overflow-hidden shadow-2xl flex flex-col lg:flex-row relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-10 right-10 w-14 h-14 bg-[#F5F7FA] rounded-full flex items-center justify-center text-[#2E7D32] hover:bg-white hover:scale-110 transition-all z-10 shadow-lg"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="w-full lg:w-1/2 h-[400px] lg:h-auto relative">
              <img
                src={selectedProduct.image_url}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-12 left-12 text-white">
                <span className="bg-[#FBC02D] text-[#2E7D32] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[2px]">
                  Verified Farmer
                </span>
                <h2 className="text-5xl font-black mt-6 leading-tight">
                  {selectedProduct.name}
                </h2>
              </div>
            </div>

            <div className="w-full lg:w-1/2 p-16 flex flex-col bg-[#FAFBFA]">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-[#6B8E6B] uppercase tracking-[3px] mb-2">
                    Current Price
                  </p>
                  <p className="text-5xl font-black text-[#2E7D32]">
                    KSh {selectedProduct.price}{" "}
                    <span className="text-lg text-[#6B8E6B] font-bold uppercase">
                      /{selectedProduct.unit}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#6B8E6B] uppercase tracking-[3px] mb-2">
                    Available Stock
                  </p>
                  <p className="text-2xl font-black text-[#333333]">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-10 flex-1">
                <div>
                  <h4 className="text-[10px] font-black text-[#2E7D32] uppercase tracking-[3px] mb-4">
                    Description & Quality
                  </h4>
                  <p className="text-[#333333] leading-relaxed font-medium text-lg italic">
                    "{selectedProduct.description}"
                  </p>
                </div>

                <div className="p-8 bg-white rounded-[40px] border border-[#E8EEE5] shadow-sm flex items-center space-x-6">
                  <div className="w-16 h-16 bg-[#2E7D32] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#2E7D32]/20">
                    {selectedProduct.seller_name?.[0]}
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#333333]">
                      {selectedProduct.seller_name}
                    </p>
                    <p className="text-xs font-bold text-[#6B8E6B] flex items-center mt-1">
                      <i className="fas fa-certificate text-[#FBC02D] mr-2"></i>
                      Top Rated Local Producer
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="bg-white text-[#2E7D32] border-2 border-[#2E7D32] font-black py-6 rounded-[32px] hover:bg-[#F5F7FA] transition-all uppercase tracking-widest text-xs">
                  Add to Cart
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                  className="bg-[#2E7D32] text-white font-black py-6 rounded-[32px] shadow-2xl hover:bg-[#1B5E20] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center uppercase tracking-widest text-xs"
                >
                  {purchaseLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  ) : (
                    "Buy with M-Pesa"
                  )}
                </button>
              </div>
              <p className="text-center text-[10px] text-[#6B8E6B] font-bold uppercase tracking-[2px] mt-8">
                Secure Direct Farmer Payment • 24/7 Support
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplacePage;
