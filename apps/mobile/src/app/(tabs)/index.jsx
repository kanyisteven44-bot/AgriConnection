import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ImageBackground,
  Dimensions,
  Animated,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import {
  CloudRain,
  Wind,
  Droplets,
  ShoppingBag,
  Brain,
  Microscope,
  BookOpen,
  MapPin,
  TrendingUp,
  Package,
  Truck,
  Bell,
  ChevronRight,
  Sparkles,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const fmt = (n) => {
  if (!n && n !== 0) return "--";
  if (n >= 1000000) return `KSh ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `KSh ${(n / 1000).toFixed(1)}k`;
  return `KSh ${n}`;
};

function StatCard({ label, value, icon, bg, delay }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        delay,
        speed: 12,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity, width: (SCREEN_W - 56) / 2 }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 22,
          padding: 18,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 14,
          elevation: 4,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: bg,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontSize: 11,
            fontFamily: "Roboto_500Medium",
            color: "#888",
            marginTop: 2,
          }}
        >
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

function QuickBtn({ label, icon, bg, color, onPress, delay }) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scale, {
          toValue: 0.93,
          useNativeDriver: true,
          speed: 30,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
        }).start()
      }
      onPress={onPress}
      style={{ alignItems: "center", width: (SCREEN_W - 80) / 4 }}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 20,
            backgroundColor: bg,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 8,
            shadowColor: color,
            shadowOpacity: 0.22,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Poppins_600SemiBold",
            color: "#444",
            textAlign: "center",
            lineHeight: 14,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function FarmerHome() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsCity, setGpsCity] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);

  const getGpsWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;
      setLocationGranted(true);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geocode = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (geocode?.[0]) {
        const cityName =
          geocode[0].city || geocode[0].subregion || geocode[0].region || null;
        if (cityName) {
          setGpsCity(cityName);
          return cityName;
        }
      }
    } catch {}
    return null;
  }, []);

  const fetchAll = useCallback(async () => {
    if (!auth) {
      setLoading(false);
      return;
    }
    setRefreshing(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/stats"),
      ]);
      const profileData = await profileRes.json();
      const statsData = await statsRes.json();
      setProfile(profileData);
      setStats(statsData.stats);
      setRole(statsData.role);
      setRecent(statsData.recent || []);

      // Try GPS first, fall back to profile location
      const gpsCityName = await getGpsWeather();
      const loc = gpsCityName || profileData?.user?.location || "Nairobi";
      const wRes = await fetch(`/api/weather?city=${encodeURIComponent(loc)}`);
      const wData = await wRes.json();
      setWeather(wData);
    } catch (err) {
      console.error("fetchAll error", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [auth, getGpsWeather]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── UNAUTHENTICATED HERO ── */
  if (!auth) {
    return (
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80",
        }}
        style={{ flex: 1 }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(5,30,5,0.62)" }}>
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              padding: 28,
              paddingBottom: insets.bottom + 48,
            }}
          >
            <MotiView
              from={{ opacity: 0, translateY: 40 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
            >
              <View
                style={{
                  backgroundColor: "#FBC02D",
                  alignSelf: "flex-start",
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                  borderRadius: 20,
                  marginBottom: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                    letterSpacing: 1,
                  }}
                >
                  🌍 KENYA'S #1 AGRI PLATFORM
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 38,
                  fontFamily: "Poppins_900Black",
                  color: "white",
                  lineHeight: 48,
                  marginBottom: 14,
                }}
              >
                Grow Smarter.{"\n"}Sell Faster.{"\n"}Earn Better.
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "Roboto_400Regular",
                  color: "rgba(255,255,255,0.8)",
                  lineHeight: 24,
                  marginBottom: 36,
                }}
              >
                Complete digital ecosystem for farmers, buyers, suppliers &
                transporters.
              </Text>
              <View style={{ gap: 12, marginBottom: 36 }}>
                <TouchableOpacity
                  onPress={() => signIn()}
                  style={{
                    backgroundColor: "#2E7D32",
                    paddingVertical: 18,
                    borderRadius: 18,
                    alignItems: "center",
                    shadowColor: "#2E7D32",
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Poppins_700Bold",
                      fontSize: 17,
                    }}
                  >
                    Get Started — It's Free
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => signIn()}
                  style={{
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.5)",
                    paddingVertical: 16,
                    borderRadius: 18,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Poppins_600SemiBold",
                      fontSize: 15,
                    }}
                  >
                    Explore Marketplace
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", gap: 28 }}>
                {[
                  ["10K+", "Farmers"],
                  ["50K+", "Products"],
                  ["99%", "Satisfaction"],
                ].map(([val, lbl], i) => (
                  <View key={i}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Poppins_700Bold",
                        color: "#FBC02D",
                      }}
                    >
                      {val}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {lbl}
                    </Text>
                  </View>
                ))}
              </View>
            </MotiView>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const statCards =
    role === "farmer" || role === "supplier"
      ? [
          {
            label: "Products",
            value: stats?.products ?? "--",
            icon: <Package size={22} color="#2E7D32" />,
            bg: "#E8F5E9",
            delay: 0,
          },
          {
            label: "Orders",
            value: stats?.orders ?? "--",
            icon: <ShoppingBag size={22} color="#1565C0" />,
            bg: "#E3F2FD",
            delay: 80,
          },
          {
            label: "Revenue",
            value: stats?.revenue != null ? fmt(stats.revenue) : "--",
            icon: <TrendingUp size={22} color="#E65100" />,
            bg: "#FFF3E0",
            delay: 160,
          },
          {
            label: "Deliveries",
            value: stats?.deliveries ?? "--",
            icon: <Truck size={22} color="#6A1B9A" />,
            bg: "#F3E5F5",
            delay: 240,
          },
        ]
      : [
          {
            label: "Orders",
            value: stats?.orders ?? "--",
            icon: <ShoppingBag size={22} color="#1565C0" />,
            bg: "#E3F2FD",
            delay: 0,
          },
          {
            label: "Deliveries",
            value: stats?.deliveries ?? "--",
            icon: <Truck size={22} color="#6A1B9A" />,
            bg: "#F3E5F5",
            delay: 80,
          },
        ];

  const quickActions = [
    {
      label: "AI\nAdvisor",
      icon: <Brain size={26} color="#2E7D32" />,
      bg: "#E8F5E9",
      color: "#2E7D32",
      route: "/(tabs)/ai",
    },
    {
      label: "Disease\nDetect",
      icon: <Microscope size={26} color="#E65100" />,
      bg: "#FFF3E0",
      color: "#E65100",
      route: "/disease",
    },
    {
      label: "Agri\nMap",
      icon: <MapPin size={26} color="#1565C0" />,
      bg: "#E3F2FD",
      color: "#1565C0",
      route: "/farmers-map",
    },
    {
      label: "Finance\nTracker",
      icon: <TrendingUp size={26} color="#6A1B9A" />,
      bg: "#F3E5F5",
      color: "#6A1B9A",
      route: "/finance",
    },
  ];

  const firstName = (profile?.user?.name || auth?.user?.name || "Farmer").split(
    " ",
  )[0];
  const displayCity =
    gpsCity || weather?.city || profile?.user?.location || "Kenya";

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAll}
            tintColor="#2E7D32"
          />
        }
      >
        {/* ── HERO HEADER IMAGE ── */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
          }}
          style={{ minHeight: 220 }}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View
            style={{
              backgroundColor: "rgba(5,40,5,0.70)",
              paddingTop: insets.top + 16,
              paddingHorizontal: 20,
              paddingBottom: 100,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 500 }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Roboto_400Regular",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {GREETING()} 👋
                </Text>
                <Text
                  style={{
                    fontSize: 26,
                    fontFamily: "Poppins_700Bold",
                    color: "white",
                    marginTop: 2,
                  }}
                >
                  {firstName}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Roboto_400Regular",
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 2,
                  }}
                >
                  Let's grow your farm today 🌱
                </Text>
              </MotiView>
              <MotiView
                from={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 200 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/notifications")}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      backgroundColor: "rgba(255,255,255,0.14)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Bell size={19} color="white" />
                  </TouchableOpacity>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 13,
                      overflow: "hidden",
                      borderWidth: 2,
                      borderColor: "#FBC02D",
                    }}
                  >
                    {profile?.user?.profile_photo || auth?.user?.image ? (
                      <Image
                        source={{
                          uri:
                            profile?.user?.profile_photo || auth?.user?.image,
                        }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#2E7D32",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontFamily: "Poppins_700Bold",
                            fontSize: 17,
                          }}
                        >
                          {firstName[0]}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </MotiView>
            </View>
          </View>
        </ImageBackground>

        {/* ── TAPPABLE WEATHER CARD ── */}
        <View
          style={{ marginTop: -80, paddingHorizontal: 20, marginBottom: 22 }}
        >
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 250 }}
          >
            <TouchableOpacity
              onPress={() => router.push("/weather")}
              activeOpacity={0.92}
            >
              <ImageBackground
                source={{
                  uri: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&q=70",
                }}
                style={{ borderRadius: 28, overflow: "hidden" }}
                imageStyle={{ resizeMode: "cover" }}
              >
                <BlurView
                  intensity={14}
                  tint="dark"
                  style={{ borderRadius: 28 }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(5,30,5,0.65)",
                      padding: 22,
                      borderRadius: 28,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            backgroundColor: "#FBC02D",
                            alignSelf: "flex-start",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 10,
                            marginBottom: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: "#1A1A1A",
                              fontSize: 9,
                              fontFamily: "Poppins_700Bold",
                              letterSpacing: 1,
                            }}
                          >
                            {locationGranted
                              ? "📍 GPS WEATHER"
                              : "☁ LIVE WEATHER"}{" "}
                            — TAP FOR MORE
                          </Text>
                        </View>
                        {loading ? (
                          <Skeleton
                            colorMode="dark"
                            width={120}
                            height={56}
                            radius={12}
                          />
                        ) : (
                          <Text
                            style={{
                              fontSize: 54,
                              fontFamily: "Poppins_900Black",
                              color: "white",
                              lineHeight: 60,
                            }}
                          >
                            {weather?.temperature ?? "--"}°C
                          </Text>
                        )}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            marginTop: 6,
                          }}
                        >
                          <MapPin size={12} color="#FBC02D" />
                          <Text
                            style={{
                              fontSize: 13,
                              fontFamily: "Roboto_500Medium",
                              color: "rgba(255,255,255,0.85)",
                            }}
                          >
                            {weather?.condition || "—"} · {displayCity}
                          </Text>
                        </View>
                      </View>
                      <View style={{ gap: 8 }}>
                        {[
                          {
                            icon: <Droplets size={12} color="#FBC02D" />,
                            val: `${weather?.humidity ?? "--"}%`,
                            lbl: "Humid",
                          },
                          {
                            icon: <Wind size={12} color="#FBC02D" />,
                            val: `${weather?.wind ?? "--"}km/h`,
                            lbl: "Wind",
                          },
                          {
                            icon: <CloudRain size={12} color="#FBC02D" />,
                            val: "Rain",
                            lbl: "Alert",
                          },
                        ].map((w, i) => (
                          <View
                            key={i}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 5,
                              backgroundColor: "rgba(255,255,255,0.12)",
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 10,
                            }}
                          >
                            {w.icon}
                            <Text
                              style={{
                                fontSize: 11,
                                fontFamily: "Roboto_500Medium",
                                color: "white",
                              }}
                            >
                              {w.val} {w.lbl}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {weather?.suggestion ? (
                      <View
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: 14,
                          padding: 12,
                          marginTop: 16,
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <Sparkles
                          size={14}
                          color="#FBC02D"
                          style={{ marginTop: 2 }}
                        />
                        <Text
                          style={{
                            flex: 1,
                            color: "rgba(255,255,255,0.93)",
                            fontSize: 12,
                            fontFamily: "Roboto_400Regular",
                            lineHeight: 19,
                          }}
                        >
                          <Text
                            style={{
                              color: "#FBC02D",
                              fontFamily: "Poppins_600SemiBold",
                            }}
                          >
                            AI Tip:{" "}
                          </Text>
                          {weather.suggestion}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </BlurView>
              </ImageBackground>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* ── STATS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              Your Overview
            </Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#2E7D32",
                }}
              >
                Details
              </Text>
              <ChevronRight size={14} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  colorMode="light"
                  width={(SCREEN_W - 56) / 2}
                  height={100}
                  radius={22}
                />
              ))}
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {statCards.map((c, i) => (
                <StatCard key={i} {...c} />
              ))}
            </View>
          )}
        </View>

        {/* ── AI BANNER ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.push("/advisor")}
            activeOpacity={0.92}
          >
            <ImageBackground
              source={{
                uri: "https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=600&q=70",
              }}
              style={{ borderRadius: 24, overflow: "hidden" }}
            >
              <View
                style={{
                  backgroundColor: "rgba(5,30,5,0.80)",
                  padding: 22,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 18,
                }}
              >
                <View
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 20,
                    backgroundColor: "#FBC02D",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Brain size={32} color="#1A1A1A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Poppins_700Bold",
                      color: "#FBC02D",
                      letterSpacing: 1,
                      marginBottom: 4,
                    }}
                  >
                    ✦ AI-POWERED
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Poppins_700Bold",
                      color: "white",
                    }}
                  >
                    Smart Farm Advisor
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Roboto_400Regular",
                      color: "rgba(255,255,255,0.7)",
                      marginTop: 4,
                    }}
                  >
                    Instant crop & disease answers →
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {quickActions.map((a, i) => (
              <QuickBtn
                key={i}
                label={a.label}
                icon={a.icon}
                bg={a.bg}
                color={a.color}
                onPress={() => a.route && router.push(a.route)}
                delay={i * 70}
              />
            ))}
          </View>
        </View>

        {/* ── RECENT ACTIVITY ── */}
        {recent.length > 0 && (
          <View
            style={{ paddingHorizontal: 20, marginBottom: insets.bottom + 110 }}
          >
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
                marginBottom: 14,
              }}
            >
              Recent Activity
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 22,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 14,
                elevation: 4,
              }}
            >
              {recent.map((item, i) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderBottomWidth: i < recent.length - 1 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: "#E8F5E9",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <ShoppingBag size={18} color="#2E7D32" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#1A1A1A",
                      }}
                      numberOfLines={1}
                    >
                      {item.product_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                        marginTop: 2,
                      }}
                    >
                      KSh {item.total_price} · {item.status}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor:
                        item.status === "delivered"
                          ? "#E8F5E9"
                          : item.status === "cancelled"
                            ? "#FFEBEE"
                            : "#FFF8E1",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Poppins_600SemiBold",
                        color:
                          item.status === "delivered"
                            ? "#2E7D32"
                            : item.status === "cancelled"
                              ? "#C62828"
                              : "#E65100",
                      }}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {recent.length === 0 && (
          <View style={{ height: insets.bottom + 110 }} />
        )}
      </ScrollView>
    </View>
  );
}
