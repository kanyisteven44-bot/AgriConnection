"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

function LearningPage() {
  const { data: user } = useUser();

  const categories = [
    {
      title: "Crop Farming",
      icon: "fa-seedling",
      color: "bg-green-500",
      count: "124 Lessons",
    },
    {
      title: "Livestock",
      icon: "fa-cow",
      color: "bg-orange-500",
      count: "85 Lessons",
    },
    {
      title: "Agribusiness",
      icon: "fa-money-bill-trend-up",
      color: "bg-blue-500",
      count: "62 Lessons",
    },
    {
      title: "Marketing",
      icon: "fa-chart-line",
      color: "bg-purple-500",
      count: "45 Lessons",
    },
    {
      title: "Smart Farming",
      icon: "fa-robot",
      color: "bg-indigo-500",
      count: "38 Lessons",
    },
    {
      title: "Sustainability",
      icon: "fa-leaf",
      color: "bg-teal-500",
      count: "51 Lessons",
    },
  ];

  const articles = [
    {
      title: "Maximizing Maize Yields in Dry Seasons",
      author: "Dr. Jane Kariuki",
      time: "15 min read",
      category: "Crop Farming",
      image:
        "https://images.unsplash.com/photo-1551009175-8a68da93d5f9?auto=format&fit=crop&w=400&q=80",
    },
    {
      title: "Introduction to Hydroponic Fodder",
      author: "Expert Ahmed",
      time: "10 min read",
      category: "Smart Farming",
      image:
        "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=400&q=80",
    },
    {
      title: "Managing Poultry Diseases in Winter",
      author: "Vet. Samuel",
      time: "12 min read",
      category: "Livestock",
      image:
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#333333]">
      <nav className="bg-[#2E7D32] text-white py-12 px-6 md:px-12 text-center md:text-left relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <i className="fas fa-book-open text-[15rem]"></i>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Learning Center
          </h1>
          <p className="text-xl text-[#C5D8C5] max-w-2xl font-medium">
            Expert guides, tutorials, and insights to help you grow your farming
            enterprise.
          </p>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Search */}
        <div className="mb-20 max-w-2xl mx-auto relative -mt-24 z-20">
          <div className="bg-white p-4 rounded-[32px] shadow-2xl border border-[#E8EEE5] flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-2xl flex items-center justify-center text-[#2E7D32]">
              <i className="fas fa-search"></i>
            </div>
            <input
              placeholder="Search for farming topics, guides, experts..."
              className="flex-1 outline-none text-lg font-bold bg-transparent placeholder-[#6B8E6B]"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-24">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-black">Browse Categories</h2>
            <a
              href="#"
              className="text-[#2E7D32] font-black text-sm uppercase tracking-widest border-b-2 border-[#FBC02D]"
            >
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[48px] shadow-sm border border-[#E8EEE5] group hover:shadow-2xl transition-all cursor-pointer"
              >
                <div
                  className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-8 shadow-lg text-white group-hover:scale-110 transition-transform`}
                >
                  <i className={`fas ${cat.icon} text-2xl`}></i>
                </div>
                <h3 className="text-2xl font-black mb-2">{cat.title}</h3>
                <p className="text-sm font-bold text-[#6B8E6B] tracking-wider uppercase">
                  {cat.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div className="bg-white rounded-[64px] overflow-hidden shadow-xl border border-[#E8EEE5] flex flex-col relative group">
            <img
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80"
              className="w-full h-[450px] object-cover group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
              <span className="bg-[#FBC02D] text-[#333333] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest w-fit mb-6 shadow-xl">
                Top Recommendation
              </span>
              <h3 className="text-4xl font-black text-white mb-6 leading-tight">
                Mastering Sustainable Irrigation Systems
              </h3>
              <div className="flex items-center space-x-6 text-white font-bold text-sm mb-10">
                <div className="flex items-center">
                  <i className="fas fa-user-tie text-[#FBC02D] mr-2"></i> Prof.
                  Peter Maina
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-[#FBC02D] mr-2"></i> 45 min
                  Masterclass
                </div>
              </div>
              <button className="bg-white text-[#2E7D32] px-12 py-5 rounded-[24px] font-black text-lg shadow-2xl hover:bg-[#FBC02D] hover:text-white transition-all transform group-hover:-translate-y-2">
                Watch Full Course
              </button>
            </div>
          </div>

          <div className="space-y-10">
            <h2 className="text-3xl font-black mb-4">Latest Insights</h2>
            {articles.map((art, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[32px] border border-[#E8EEE5] shadow-sm flex space-x-6 hover:shadow-xl transition-all group cursor-pointer"
              >
                <img
                  src={art.image}
                  className="w-32 h-32 rounded-2xl object-cover shadow-inner group-hover:rotate-3 transition-transform"
                />
                <div className="flex-1 py-2">
                  <span className="text-[10px] font-black text-[#2E7D32] uppercase tracking-[2px]">
                    {art.category}
                  </span>
                  <h4 className="text-xl font-black text-[#333333] mt-2 mb-4 group-hover:text-[#2E7D32] transition-colors">
                    {art.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs font-bold text-[#6B8E6B]">
                    <span>By {art.author}</span>
                    <span>{art.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full bg-[#F5F7FA] text-[#2E7D32] font-black py-6 rounded-[24px] border border-[#E8EEE5] hover:bg-[#2E7D32] hover:text-white transition-all">
              Load More Knowledge
            </button>
          </div>
        </div>

        {/* Expert Call to Action */}
        <div className="bg-[#333333] rounded-[64px] p-16 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="absolute left-0 top-0 w-64 h-64 bg-[#2E7D32] rounded-full blur-[100px] opacity-20 -ml-32 -mt-32"></div>
          <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">
            Can't find what you're looking for? <br />{" "}
            <span className="text-[#FBC02D]">Talk to an expert directly.</span>
          </h2>
          <p className="text-xl text-[#C5D8C5] mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Book a 1-on-1 video consultation with certified agricultural
            specialists for personalized farm diagnostics.
          </p>
          <a
            href="/experts"
            className="bg-[#2E7D32] text-white px-16 py-5 rounded-[24px] text-lg font-black shadow-2xl hover:bg-[#1B5E20] transition-all transform hover:scale-105 inline-block"
          >
            Find an Expert
          </a>
        </div>
      </main>
    </div>
  );
}

export default LearningPage;
