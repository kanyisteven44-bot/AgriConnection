"use client";
import { useState, useCallback } from "react";

const ROLE_CONFIG = {
  farmer: {
    color: "bg-green-100 text-green-700",
    emoji: "🌾",
    label: "Farmer",
  },
  buyer: { color: "bg-blue-100 text-blue-700", emoji: "🛒", label: "Buyer" },
  supplier: {
    color: "bg-orange-100 text-orange-700",
    emoji: "📦",
    label: "Supplier",
  },
  transporter: {
    color: "bg-purple-100 text-purple-700",
    emoji: "🚛",
    label: "Transporter",
  },
  expert: {
    color: "bg-teal-100 text-teal-700",
    emoji: "👨‍🔬",
    label: "Expert",
  },
  consumer: {
    color: "bg-slate-100 text-slate-700",
    emoji: "🧑",
    label: "Consumer",
  },
  admin: { color: "bg-red-100 text-red-700", emoji: "🛡️", label: "Admin" },
};

export default function UserSearchPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (q, r) => {
      const sq = q !== undefined ? q : query;
      const sr = r !== undefined ? r : role;
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams({ search: sq.trim(), role: sr });
        const res = await fetch(`/api/users/search?${params}`);
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.users || []);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [query, role],
  );

  const roles = [
    "",
    "farmer",
    "buyer",
    "supplier",
    "transporter",
    "expert",
    "consumer",
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-[#1B5E20] text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <a
            href="/"
            className="text-white/60 text-sm font-bold hover:text-white mb-4 inline-flex items-center gap-2"
          >
            ← Back to App
          </a>
          <h1 className="text-3xl font-black mb-2">Find Users</h1>
          <p className="text-white/70 text-sm mb-6">
            Search across {10000}+ farmers, buyers, experts, and more on
            AgriConnection.
          </p>

          {/* Search bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch()}
                placeholder="Search by name..."
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-[#1A1A1A] font-medium focus:outline-none focus:ring-2 focus:ring-[#FBC02D] text-sm"
              />
            </div>
            <button
              onClick={() => doSearch()}
              disabled={loading}
              className="bg-[#FBC02D] text-[#1A1A1A] px-8 py-4 rounded-2xl font-black hover:bg-[#F9A825] transition-all disabled:opacity-50"
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          {/* Role filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {roles.map((r) => {
              const cfg = ROLE_CONFIG[r];
              return (
                <button
                  key={r || "all"}
                  onClick={() => {
                    setRole(r);
                    doSearch(query, r);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all ${role === r ? "bg-[#FBC02D] text-[#1A1A1A]" : "bg-white/15 text-white hover:bg-white/25"}`}
                >
                  {cfg ? `${cfg.emoji} ${cfg.label}` : "All Roles"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !searched && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-xl font-black text-[#1A1A1A] mb-2">
              Search for AgriConnection Members
            </h2>
            <p className="text-[#9BA8A0] text-sm">
              Find farmers, buyers, suppliers, transporters, and agricultural
              experts.
            </p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-black text-[#1A1A1A] mb-2">
              No users found
            </h2>
            <p className="text-[#9BA8A0] text-sm">
              Try a different name or role filter.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm font-bold text-[#9BA8A0] mb-5">
              {results.length} user{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((user) => {
                const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.consumer;
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-3xl p-6 border border-[#E8EEE5] shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {user.profile_photo ? (
                        <img
                          src={user.profile_photo}
                          className="w-14 h-14 rounded-2xl object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center text-2xl">
                          {cfg.emoji}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-[#1A1A1A] truncate">
                            {user.name}
                          </p>
                          {user.is_verified && (
                            <span className="text-xs">✅</span>
                          )}
                        </div>
                        {user.location && (
                          <p className="text-xs text-[#9BA8A0] mt-0.5 flex items-center gap-1">
                            <span>📍</span>
                            {user.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${cfg.color}`}
                      >
                        {user.role}
                      </span>
                      <span className="text-[10px] text-[#9BA8A0] font-bold">
                        Since {new Date(user.created_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
