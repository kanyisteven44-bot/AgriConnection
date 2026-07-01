"use client";
import { useState, useEffect, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const QUICK_CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Kitale",
  "Garissa",
  "Nyeri",
  "Meru",
  "Machakos",
  "Kericho",
  "Kakamega",
  "Lamu",
  "Nanyuki",
  "Kisii",
  "Embu",
  "Isiolo",
  "Voi",
  "Malindi",
  "Bungoma",
  "Kilifi",
  "Busia",
];

function WeatherIcon({ condition = "", size = 60 }) {
  const c = condition.toLowerCase();
  const style = { fontSize: size };
  if (c.includes("rain") || c.includes("shower"))
    return <span style={style}>🌧️</span>;
  if (c.includes("thunder") || c.includes("storm"))
    return <span style={style}>⛈️</span>;
  if (c.includes("cloud")) return <span style={style}>⛅</span>;
  if (c.includes("fog") || c.includes("mist"))
    return <span style={style}>🌫️</span>;
  if (c.includes("snow")) return <span style={style}>❄️</span>;
  return <span style={style}>☀️</span>;
}

function getBg(condition = "") {
  const c = condition.toLowerCase();
  if (c.includes("rain")) return "from-[#1A237E] to-[#283593]";
  if (c.includes("cloud")) return "from-[#37474F] to-[#546E7A]";
  if (c.includes("thunder")) return "from-[#1A1A2E] to-[#16213E]";
  return "from-[#0A3D62] to-[#1565C0]";
}

export default function WeatherWebPage() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: -1.2921, lng: 36.8219 });
  const [mapType, setMapType] = useState("satellite");

  const fetchWeather = useCallback(
    async (city) => {
      if (!city?.trim()) return;
      setLoading(true);
      setWeather(null);
      setLocationError(null);
      try {
        const res = await fetch(
          `/api/weather?city=${encodeURIComponent(city.trim())}`,
        );
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          setCurrentCity(data.city || city);
          if (!searchHistory.includes(city) && city !== currentCity) {
            setSearchHistory((prev) => [
              city,
              ...prev.filter((c) => c !== city).slice(0, 6),
            ]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [searchHistory, currentCity],
  );

  // Update mapCenter when GPS location is received
  const requestGpsWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser doesn't support geolocation. Please search for your city manually.",
      );
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.county ||
            data.address?.state ||
            "Nairobi";
          setLocationGranted(true);
          setCurrentCity(city);
          await fetchWeather(city);
        } catch {
          setLocationError(
            "Could not detect city from your location. Please search manually.",
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationError(
          "Location access denied. Please allow location access in your browser or search for your city below.",
        );
        setLocationLoading(false);
      },
      { timeout: 10000 },
    );
  }, [fetchWeather]);

  // Auto-request location on load
  useEffect(() => {
    requestGpsWeather();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      fetchWeather(search.trim());
      setSearch("");
    }
  };

  const bg = getBg(weather?.condition);

  return (
    <div className="min-h-screen bg-[#0A1628] font-sans">
      {/* Nav */}
      <nav className="bg-white/5 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2E7D32] rounded-xl flex items-center justify-center">
            <i className="fas fa-leaf text-white" />
          </div>
          <span className="font-black text-white text-lg">AgriConnection</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/marketplace"
            className="text-white/60 text-sm font-medium hover:text-white transition-colors"
          >
            Marketplace
          </a>
          <a
            href="/farmer/dashboard"
            className="bg-[#2E7D32] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#1B5E20] transition-all"
          >
            Dashboard
          </a>
        </div>
      </nav>

      {/* Hero weather card */}
      <div className={`bg-gradient-to-br ${bg} transition-all duration-1000`}>
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Location request banner */}
          {!locationGranted && !weather && !locationLoading && (
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <div className="text-3xl">📍</div>
              <div className="flex-1">
                <p className="font-black text-white mb-1">
                  Allow Location Access for Accurate Weather
                </p>
                <p className="text-white/65 text-sm mb-4 leading-relaxed">
                  AgriConnection needs your location to show real-time weather
                  for your exact farm or area. This helps with AI farming
                  suggestions tailored to where you are.
                </p>
                {locationError ? (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-300 text-sm mb-3">
                    {locationError}
                  </div>
                ) : null}
                <button
                  onClick={requestGpsWeather}
                  disabled={locationLoading}
                  className="bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-all text-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {locationLoading ? (
                    <>
                      <span className="animate-spin">⏳</span> Detecting
                      location...
                    </>
                  ) : (
                    <>
                      <span>📍</span> Allow My Location
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-10">
            <div className="bg-white/12 border border-white/20 rounded-2xl flex items-center px-5 h-14 gap-4 focus-within:bg-white/18 transition-all">
              <i className="fas fa-search text-white/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search any city, town or county in Kenya..."
                className="flex-1 bg-transparent text-white placeholder-white/40 outline-none font-medium text-base"
              />
              {loading && (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {search && (
                <button
                  type="submit"
                  className="bg-[#FBC02D] text-[#1A1A1A] font-black text-sm px-4 py-1.5 rounded-xl hover:bg-[#F9A825] transition-all"
                >
                  GO
                </button>
              )}
              <button
                type="button"
                onClick={requestGpsWeather}
                disabled={locationLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${locationGranted ? "bg-[#2E7D32] text-white" : "bg-white/15 text-white/75 hover:bg-white/25"}`}
                title="Use my current location"
              >
                {locationLoading ? "⏳" : "📍"}{" "}
                {locationGranted ? "GPS" : "My Location"}
              </button>
            </div>
          </form>

          {/* Main weather display */}
          {locationLoading ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 animate-bounce">📍</div>
              <p className="text-white/70 text-lg font-medium">
                Detecting your location...
              </p>
              <p className="text-white/45 text-sm mt-2">
                Getting accurate weather for your area
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70 text-lg font-medium">
                Loading weather for {currentCity}...
              </p>
            </div>
          ) : weather ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <i className="fas fa-map-marker-alt text-[#FBC02D]" />
                <span className="text-white font-bold text-xl">
                  {currentCity || weather.city}
                </span>
                {locationGranted && (
                  <span className="bg-[#FBC02D] text-[#1A1A1A] text-xs font-black px-3 py-1 rounded-full">
                    📍 LIVE GPS
                  </span>
                )}
              </div>
              <div className="flex justify-center mb-4">
                <WeatherIcon condition={weather.condition} size={80} />
              </div>
              <div
                className="text-white font-black mb-2"
                style={{ fontSize: "100px", lineHeight: "1" }}
              >
                {weather.temperature}°
              </div>
              <p className="text-white/85 text-2xl font-medium mb-1">
                {weather.condition}
              </p>
              {weather.feels_like && (
                <p className="text-white/50 text-base">
                  Feels like {weather.feels_like}°C
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-7xl mb-5">🌍</div>
              <p className="text-white text-xl font-black mb-2">
                Search for Weather
              </p>
              <p className="text-white/50 text-base">
                Enter any city or town to see current conditions
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Weather Details */}
      {weather && (
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Detail cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Humidity",
                value: `${weather.humidity ?? "--"}%`,
                icon: "💧",
                color: "#64B5F6",
              },
              {
                label: "Wind Speed",
                value: `${weather.wind ?? "--"} km/h`,
                icon: "💨",
                color: "#80CBC4",
              },
              {
                label: "UV Index",
                value: weather.uv_index ?? "--",
                icon: "☀️",
                color: "#FBC02D",
              },
              {
                label: "Feels Like",
                value: `${weather.feels_like ?? "--"}°C`,
                icon: "🌡️",
                color: "#EF9A9A",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/8 border border-white/10 rounded-2xl p-5"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="text-2xl font-black text-white mb-1">
                  {item.value}
                </p>
                <p className="text-white/50 text-sm">{item.label}</p>
              </div>
            ))}
          </div>

          {/* AI Farming Tip */}
          {weather.suggestion && (
            <div className="bg-[#FBC02D]/15 border border-[#FBC02D]/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌱</div>
                <div>
                  <p className="text-[#FBC02D] font-black text-sm uppercase tracking-wider mb-2">
                    AI Farming Tip for {currentCity}
                  </p>
                  <p className="text-white/85 leading-relaxed">
                    {weather.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── SATELLITE WEATHER MAP ── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white font-black text-lg">
                🛰️ Satellite Weather Map
              </p>
              <div className="flex gap-2">
                {[
                  { label: "🗺️ Road", val: "roadmap" },
                  { label: "🛰️ Satellite", val: "satellite" },
                ].map((v) => (
                  <button
                    key={v.val}
                    onClick={() => setMapType(v.val)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mapType === v.val ? "bg-[#2E7D32] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ height: 320 }}
            >
              <APIProvider
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
              >
                <Map
                  center={mapCenter}
                  zoom={8}
                  mapTypeId={mapType}
                  disableDefaultUI={false}
                  zoomControl={true}
                  gestureHandling="cooperative"
                  style={{ width: "100%", height: "100%" }}
                />
              </APIProvider>
            </div>
            <p className="text-white/40 text-xs mt-2 text-center">
              {locationGranted
                ? "📍 Showing your current location"
                : "📍 Showing Kenya — enable GPS for your exact location"}
            </p>
          </div>

          {/* Recent searches */}
          {searchHistory.length > 0 && (
            <div className="mb-8">
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-4">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-3">
                {searchHistory.map((city) => (
                  <button
                    key={city}
                    onClick={() => fetchWeather(city)}
                    className="bg-white/10 border border-white/15 text-white/80 text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/20 transition-all"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Cities Grid */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-5">
          🇰🇪 All Kenyan Counties & Cities
        </p>
        <div className="flex flex-wrap gap-3">
          {QUICK_CITIES.map((city) => (
            <button
              key={city}
              onClick={() => fetchWeather(city)}
              className={`text-sm font-bold px-4 py-2.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                currentCity === city
                  ? "bg-[#2E7D32] border-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/30"
                  : "bg-white/8 border-white/12 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
