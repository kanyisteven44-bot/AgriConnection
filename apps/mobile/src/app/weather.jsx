import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from "react-native";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  ArrowLeft,
  Search,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Eye,
  Sun,
  CloudRain,
  Cloud,
  Zap,
  Layers,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");

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
];

function WeatherIcon({ condition, size = 40 }) {
  if (!condition) return <Sun size={size} color="#FBC02D" />;
  const c = condition.toLowerCase();
  if (c.includes("rain") || c.includes("shower"))
    return <CloudRain size={size} color="#64B5F6" />;
  if (c.includes("cloud")) return <Cloud size={size} color="#B0BEC5" />;
  if (c.includes("thunder") || c.includes("storm"))
    return <Zap size={size} color="#FFA726" />;
  return <Sun size={size} color="#FBC02D" />;
}

function WeatherBg({ condition }) {
  if (!condition)
    return "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80";
  const c = condition.toLowerCase();
  if (c.includes("rain"))
    return "https://images.unsplash.com/photo-1523772721666-22ad3c3b6f90?w=800&q=80";
  if (c.includes("cloud"))
    return "https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800&q=80";
  return "https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=800&q=80";
}

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentCity, setCurrentCity] = useState("Nairobi");
  const [locationError, setLocationError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [mapCoords, setMapCoords] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
  });
  const [showSatellite, setShowSatellite] = useState(false);

  const fetchWeather = useCallback(
    async (city) => {
      setLoading(true);
      setWeather(null);
      try {
        const res = await fetch(
          `/api/weather?city=${encodeURIComponent(city)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
          setCurrentCity(data.city || city);
          if (!searchHistory.includes(city) && city !== "Nairobi") {
            setSearchHistory((prev) => [city, ...prev.slice(0, 4)]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [searchHistory],
  );

  const requestLocationWeather = useCallback(async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(
          "Location permission denied. Please enable it in Settings.",
        );
        setLocationGranted(false);
        return;
      }
      setLocationGranted(true);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      setMapCoords({ latitude, longitude });
      // Reverse geocode to get city name
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode && geocode[0]) {
        const { city, subregion, region } = geocode[0];
        const cityName = city || subregion || region || "Current Location";
        setCurrentCity(cityName);
        await fetchWeather(cityName);
      } else {
        await fetchWeather("Nairobi");
      }
    } catch (err) {
      setLocationError("Could not get your location. Please search manually.");
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  }, [fetchWeather]);

  useEffect(() => {
    requestLocationWeather();
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      fetchWeather(search.trim());
      setSearch("");
    }
  };

  const bgImage = WeatherBg(weather?.condition);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A1628" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero weather display */}
        <ImageBackground
          source={{ uri: bgImage }}
          style={{ minHeight: 400 }}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View
            style={{
              backgroundColor: "rgba(0,10,30,0.65)",
              minHeight: 400,
              paddingTop: insets.top + 10,
              paddingHorizontal: 20,
              paddingBottom: 30,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 14,
                }}
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontFamily: "Poppins_700Bold",
                  color: "white",
                }}
              >
                Weather Centre
              </Text>
              <TouchableOpacity
                onPress={requestLocationWeather}
                disabled={locationLoading}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  backgroundColor: locationGranted
                    ? "#2E7D32"
                    : "rgba(255,255,255,0.15)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {locationLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MapPin size={18} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.13)",
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                height: 50,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
                marginBottom: 28,
              }}
            >
              <Search size={17} color="rgba(255,255,255,0.6)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={handleSearch}
                placeholder="Search any city or town..."
                placeholderTextColor="rgba(255,255,255,0.42)"
                returnKeyType="search"
                style={{
                  flex: 1,
                  height: 50,
                  color: "white",
                  marginLeft: 10,
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={handleSearch}
                  style={{
                    backgroundColor: "#FBC02D",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Poppins_700Bold",
                      color: "#1A1A1A",
                    }}
                  >
                    GO
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Main weather display */}
            {loading || locationLoading ? (
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <ActivityIndicator color="white" size="large" />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 12,
                    fontFamily: "Roboto_400Regular",
                  }}
                >
                  {locationLoading
                    ? "Getting your location..."
                    : "Loading weather..."}
                </Text>
              </View>
            ) : locationError ? (
              <View style={{ alignItems: "center", paddingTop: 20 }}>
                <Text
                  style={{
                    color: "#FF6B6B",
                    fontFamily: "Roboto_400Regular",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  {locationError}
                </Text>
                <TouchableOpacity
                  onPress={requestLocationWeather}
                  style={{
                    backgroundColor: "#2E7D32",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 14,
                  }}
                >
                  <Text
                    style={{ color: "white", fontFamily: "Poppins_700Bold" }}
                  >
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : weather ? (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 500 }}
              >
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                    }}
                  >
                    <MapPin size={14} color="#FBC02D" />
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins_600SemiBold",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {currentCity}
                    </Text>
                    {locationGranted && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Poppins_700Bold",
                          color: "#FBC02D",
                        }}
                      >
                        📍 LIVE
                      </Text>
                    )}
                  </View>
                  <WeatherIcon condition={weather.condition} size={64} />
                  <Text
                    style={{
                      fontSize: 84,
                      fontFamily: "Poppins_900Black",
                      color: "white",
                      lineHeight: 96,
                      marginTop: 8,
                    }}
                  >
                    {weather.temperature}°
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Roboto_400Regular",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    {weather.condition}
                  </Text>
                  {weather.feels_like && (
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Roboto_400Regular",
                        color: "rgba(255,255,255,0.55)",
                        marginTop: 4,
                      }}
                    >
                      Feels like {weather.feels_like}°C
                    </Text>
                  )}
                </View>
              </MotiView>
            ) : null}
          </View>
        </ImageBackground>

        {/* Weather details cards */}
        {weather && (
          <View style={{ backgroundColor: "#0A1628", padding: 20 }}>
            {/* Detail grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                {
                  label: "Humidity",
                  value: `${weather.humidity ?? "--"}%`,
                  icon: <Droplets size={20} color="#64B5F6" />,
                  bg: "#1A2744",
                },
                {
                  label: "Wind Speed",
                  value: `${weather.wind ?? "--"} km/h`,
                  icon: <Wind size={20} color="#80CBC4" />,
                  bg: "#1A2744",
                },
                {
                  label: "UV Index",
                  value: weather.uv_index ?? "--",
                  icon: <Sun size={20} color="#FBC02D" />,
                  bg: "#1A2744",
                },
                {
                  label: "Feels Like",
                  value: `${weather.feels_like ?? "--"}°C`,
                  icon: <Thermometer size={20} color="#EF9A9A" />,
                  bg: "#1A2744",
                },
              ].map((item, i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", delay: i * 80 }}
                  style={{
                    width: (SCREEN_W - 52) / 2,
                    backgroundColor: item.bg,
                    borderRadius: 20,
                    padding: 18,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  {item.icon}
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: "Poppins_700Bold",
                      color: "white",
                      marginTop: 10,
                    }}
                  >
                    {item.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Roboto_400Regular",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 3,
                    }}
                  >
                    {item.label}
                  </Text>
                </MotiView>
              ))}
            </View>

            {/* Farming suggestion */}
            {weather.suggestion && (
              <View
                style={{
                  backgroundColor: "#1A2744",
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 24,
                  borderLeftWidth: 4,
                  borderLeftColor: "#FBC02D",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Poppins_700Bold",
                    color: "#FBC02D",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  🌱 AI FARMING TIP
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Roboto_400Regular",
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 22,
                  }}
                >
                  {weather.suggestion}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── SATELLITE WEATHER MAP ── */}
        <View
          style={{
            backgroundColor: "#0A1628",
            paddingHorizontal: 20,
            paddingBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Poppins_700Bold",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              🛰️ Satellite Weather Map
            </Text>
            <TouchableOpacity
              onPress={() => setShowSatellite(!showSatellite)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: showSatellite ? "#2E7D32" : "#1A2744",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Layers size={13} color="white" />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Poppins_700Bold",
                  color: "white",
                }}
              >
                {showSatellite ? "Satellite" : "Map"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ borderRadius: 20, overflow: "hidden", height: 240 }}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ width: "100%", height: "100%" }}
              mapType={showSatellite ? "satellite" : "standard"}
              region={{
                latitude: mapCoords.latitude,
                longitude: mapCoords.longitude,
                latitudeDelta: 1.5,
                longitudeDelta: 1.5,
              }}
              showsUserLocation={locationGranted}
              showsMyLocationButton={false}
              zoomEnabled
              scrollEnabled
              pitchEnabled={false}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 10,
              marginBottom: 16,
            }}
          >
            {[
              { label: "🗺️ Standard", val: false },
              { label: "🛰️ Satellite", val: true },
            ].map((v) => (
              <TouchableOpacity
                key={String(v.val)}
                onPress={() => setShowSatellite(v.val)}
                style={{
                  flex: 1,
                  backgroundColor:
                    showSatellite === v.val ? "#2E7D32" : "#1A2744",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "white",
                  }}
                >
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick city search */}
        <View
          style={{
            backgroundColor: "#0A1628",
            paddingHorizontal: 20,
            paddingBottom: 40,
          }}
        >
          {searchHistory.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_700Bold",
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 10,
                }}
              >
                Recent Searches
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {searchHistory.map((city) => (
                  <TouchableOpacity
                    key={city}
                    onPress={() => fetchWeather(city)}
                    style={{
                      backgroundColor: "#1A2744",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_600SemiBold",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_700Bold",
              color: "rgba(255,255,255,0.6)",
              marginBottom: 12,
            }}
          >
            🇰🇪 Popular Kenyan Cities
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {QUICK_CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => fetchWeather(city)}
                style={{
                  backgroundColor: currentCity === city ? "#2E7D32" : "#1A2744",
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor:
                    currentCity === city ? "#2E7D32" : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_600SemiBold",
                    color:
                      currentCity === city ? "white" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
