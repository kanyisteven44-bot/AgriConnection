import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  LogOut,
  ChevronRight,
  Settings,
  Phone,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  Bell,
  Shield,
  HelpCircle,
  TrendingUp,
  Leaf,
  Search,
} from "lucide-react-native";

const ROLE_CONFIG = {
  farmer: { label: "🌾 Farmer", color: "#2E7D32", bg: "#E8F5E9" },
  buyer: { label: "🛒 Buyer", color: "#1565C0", bg: "#E3F2FD" },
  supplier: { label: "📦 Supplier", color: "#E65100", bg: "#FFF3E0" },
  transporter: { label: "🚚 Transporter", color: "#6A1B9A", bg: "#F3E5F5" },
  expert: { label: "🔬 Expert", color: "#00838F", bg: "#E0F7FA" },
  admin: { label: "⚙️ Admin", color: "#555", bg: "#F5F5F5" },
  consumer: { label: "👤 Consumer", color: "#888", bg: "#F5F5F5" },
};

const BADGES = [
  {
    emoji: "🏆",
    label: "Top Farmer",
    color: "#E65100",
    bg: "#FFF3E0",
    earned: true,
  },
  {
    emoji: "⭐",
    label: "Trusted Seller",
    color: "#F9A825",
    bg: "#FFF8E1",
    earned: true,
  },
  {
    emoji: "🌱",
    label: "Green Farmer",
    color: "#2E7D32",
    bg: "#E8F5E9",
    earned: true,
  },
  {
    emoji: "🚚",
    label: "Fast Delivery",
    color: "#1565C0",
    bg: "#E3F2FD",
    earned: false,
  },
  {
    emoji: "💬",
    label: "Communicator",
    color: "#6A1B9A",
    bg: "#F3E5F5",
    earned: false,
  },
];

export default function MobileProfile() {
  const insets = useSafeAreaInsets();
  const { auth, signOut, signIn } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    Promise.all([fetch("/api/profile"), fetch("/api/stats")])
      .then(async ([pRes, sRes]) => {
        const pData = await pRes.json();
        const sData = await sRes.json();
        setProfile(pData);
        setStats(sData.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [auth]);

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F7FA",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          paddingTop: insets.top,
        }}
      >
        <Text style={{ fontSize: 40, marginBottom: 16 }}>👤</Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Sign in to View Profile
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Roboto_400Regular",
            color: "#888",
            textAlign: "center",
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          Access your account, orders, and settings.
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: "#2E7D32",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Poppins_700Bold",
              fontSize: 16,
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = profile?.user || auth?.user || {};
  const role = user.role || "consumer";
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.consumer;
  const avatarChar = (user.name || "A")[0].toUpperCase();

  const statItems = [
    {
      label: "Products",
      value: stats?.products ?? stats?.orders ?? 0,
      icon: Package,
      color: "#2E7D32",
    },
    {
      label: "Orders",
      value: stats?.orders ?? 0,
      icon: ShoppingBag,
      color: "#1565C0",
    },
    {
      label: "Deliveries",
      value: stats?.deliveries ?? 0,
      icon: Truck,
      color: "#6A1B9A",
    },
  ];

  const menuItems = [
    {
      label: "My Products",
      icon: Package,
      color: "#2E7D32",
      bg: "#E8F5E9",
      route: "/my-products",
    },
    {
      label: "Order History",
      icon: ShoppingBag,
      color: "#1565C0",
      bg: "#E3F2FD",
      route: "/my-orders",
    },
    {
      label: "Find Users",
      icon: Search,
      color: "#E65100",
      bg: "#FFF3E0",
      route: "/search",
    },
    {
      label: "Farmers Map",
      icon: MapPin,
      color: "#00838F",
      bg: "#E0F7FA",
      route: "/farmers-map",
    },
    {
      label: "Notifications",
      icon: Bell,
      color: "#F9A825",
      bg: "#FFF8E1",
      route: "/(tabs)/notifications",
    },
    {
      label: "Farm Finance",
      icon: TrendingUp,
      color: "#6A1B9A",
      bg: "#F3E5F5",
      route: "/finance",
    },
    {
      label: "Account Settings",
      icon: Settings,
      color: "#555",
      bg: "#F5F5F5",
      route: "/account-settings",
    },
    {
      label: "Privacy & Security",
      icon: Shield,
      color: "#6A1B9A",
      bg: "#F3E5F5",
      route: "/privacy-security",
    },
    {
      label: "Help & Support",
      icon: HelpCircle,
      color: "#00838F",
      bg: "#E0F7FA",
      route: "/help-support",
    },
  ];

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F7FA",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#2E7D32" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F0F4F0" }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=70",
        }}
        style={{
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          overflow: "hidden",
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 32,
            backgroundColor: "rgba(10,50,10,0.75)",
            alignItems: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 100 }}
          >
            <TouchableOpacity
              style={{
                width: 92,
                height: 92,
                borderRadius: 28,
                overflow: "hidden",
                borderWidth: 3,
                borderColor: "#FBC02D",
                marginBottom: 12,
              }}
            >
              {user.profile_photo || user.image ? (
                <Image
                  source={{ uri: user.profile_photo || user.image }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#2E7D32",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 36,
                      fontFamily: "Poppins_700Bold",
                      color: "white",
                    }}
                  >
                    {avatarChar}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </MotiView>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            {user.name || "AgriUser"}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.7)",
              marginTop: 2,
            }}
          >
            {user.email}
          </Text>
          <View
            style={{
              backgroundColor: roleConf.bg,
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 20,
              marginTop: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: roleConf.color,
              }}
            >
              {roleConf.label}
            </Text>
          </View>
          {user.is_verified && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Poppins_700Bold",
                  color: "#FBC02D",
                }}
              >
                ✅ Verified Account
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>

      {/* Stats Row */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          marginHorizontal: 20,
          marginTop: -20,
          borderRadius: 20,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {statItems.map((s, i) => {
          const IconComp = s.icon;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: "center",
                borderRightWidth: i < statItems.length - 1 ? 1 : 0,
                borderRightColor: "#F0F0F0",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                }}
              >
                {s.value}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Roboto_400Regular",
                  color: "#888",
                  marginTop: 2,
                }}
              >
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* ── ACHIEVEMENTS SECTION ── */}
      <View style={{ paddingTop: 20, paddingLeft: 20 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            marginBottom: 12,
          }}
        >
          🏅 Achievements
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 10, paddingRight: 20 }}
        >
          {BADGES.map((badge, i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: i * 80 }}
            >
              <View
                style={{
                  backgroundColor: badge.earned ? badge.bg : "#F0F0F0",
                  borderRadius: 18,
                  padding: 14,
                  alignItems: "center",
                  width: 90,
                  opacity: badge.earned ? 1 : 0.4,
                  borderWidth: 1.5,
                  borderColor: badge.earned ? badge.color + "55" : "#E0E0E0",
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 6 }}>
                  {badge.emoji}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Poppins_600SemiBold",
                    color: badge.earned ? badge.color : "#888",
                    textAlign: "center",
                  }}
                >
                  {badge.label}
                </Text>
                {badge.earned && (
                  <View
                    style={{
                      marginTop: 5,
                      backgroundColor: badge.color,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 8,
                        fontFamily: "Poppins_700Bold",
                        color: "white",
                      }}
                    >
                      EARNED
                    </Text>
                  </View>
                )}
              </View>
            </MotiView>
          ))}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        {/* Contact Info */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            padding: 16,
            marginBottom: 14,
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_600SemiBold",
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            Contact Information
          </Text>
          <View style={{ gap: 12 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#E8F5E9",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Phone size={16} color="#2E7D32" />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  color: "#333",
                }}
              >
                {user.phone || "Not provided"}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "#E8F5E9",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MapPin size={16} color="#2E7D32" />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  color: "#333",
                }}
              >
                {user.location || "Location not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Farm Info for Farmers */}
        {role === "farmer" && profile?.farm && (
          <View
            style={{
              backgroundColor: "#E8F5E9",
              borderRadius: 20,
              padding: 16,
              marginBottom: 14,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Leaf size={18} color="#2E7D32" />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#2E7D32",
                }}
              >
                Farm Details
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              {profile.farm.size && (
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Roboto_400Regular",
                    color: "#444",
                  }}
                >
                  📐 Size: {profile.farm.size}
                </Text>
              )}
              {profile.farm.crops_grown && (
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Roboto_400Regular",
                    color: "#444",
                  }}
                >
                  🌱 Crops: {profile.farm.crops_grown}
                </Text>
              )}
              {profile.farm.livestock_info && (
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Roboto_400Regular",
                    color: "#444",
                  }}
                >
                  🐄 Livestock: {profile.farm.livestock_info}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 20,
            marginBottom: 14,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          {menuItems.map((item, i) => {
            const IconComp = item.icon;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => item.route && router.push(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: i < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: item.bg,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 14,
                  }}
                >
                  <IconComp size={18} color={item.color} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: "Roboto_500Medium",
                    color: "#1A1A1A",
                  }}
                >
                  {item.label}
                </Text>
                <ChevronRight
                  size={18}
                  color={item.route ? "#2E7D32" : "#CCC"}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => signOut(),
              },
            ]);
          }}
          style={{
            backgroundColor: "#FFEBEE",
            borderRadius: 20,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: insets.bottom + 20,
          }}
        >
          <LogOut size={20} color="#C62828" />
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Poppins_600SemiBold",
              color: "#C62828",
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
