import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  Bell,
  ShoppingBag,
  Truck,
  CloudRain,
  MessageCircle,
  DollarSign,
  CheckCheck,
  Info,
  ArrowLeft,
} from "lucide-react-native";

const TYPE_CONFIG = {
  order: { icon: ShoppingBag, color: "#1565C0", bg: "#E3F2FD", emoji: "🛍️" },
  delivery: { icon: Truck, color: "#6A1B9A", bg: "#F3E5F5", emoji: "🚚" },
  weather: { icon: CloudRain, color: "#00838F", bg: "#E0F7FA", emoji: "🌦️" },
  message: {
    icon: MessageCircle,
    color: "#2E7D32",
    bg: "#E8F5E9",
    emoji: "💬",
  },
  payment: { icon: DollarSign, color: "#E65100", bg: "#FFF3E0", emoji: "💰" },
  info: { icon: Info, color: "#555", bg: "#F5F5F5", emoji: "ℹ️" },
};

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "New Order Received",
    message: "John Buyer has ordered 50kg of tomatoes from you.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    type: "weather",
    title: "Weather Alert",
    message:
      "Heavy rain expected tomorrow morning. Delay irrigation and protect seedlings.",
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    type: "delivery",
    title: "Delivery in Progress",
    message:
      "Driver James is on the way with your order #1034. ETA: 45 minutes.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 4,
    type: "payment",
    title: "Payment Received",
    message:
      "KSh 4,800 received via M-Pesa for order #1029. Funds available now.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 5,
    type: "message",
    title: "New Message",
    message: "Expert Dr. Kamau replied to your crop disease question.",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    id: 6,
    type: "info",
    title: "Market Price Update",
    message:
      "Tomato prices in Nairobi market up 12% this week. Good time to sell!",
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export default function Notifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, signIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");

  const fetchNotifications = useCallback(async () => {
    if (!auth) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const combined = [
          ...(data.notifications || []),
          ...DEMO_NOTIFICATIONS,
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotifications(
          combined.length > 0
            ? data.notifications?.length > 0
              ? data.notifications
              : DEMO_NOTIFICATIONS
            : DEMO_NOTIFICATIONS,
        );
      } else {
        setNotifications(DEMO_NOTIFICATIONS);
      }
    } catch {
      setNotifications(DEMO_NOTIFICATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch {}
  };

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const unread = notifications.filter((n) => !n.is_read).length;
  const FILTERS = ["All", "Unread", "Orders", "Weather", "Deliveries"];
  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.is_read;
    if (filter === "Orders") return n.type === "order" || n.type === "payment";
    if (filter === "Weather") return n.type === "weather";
    if (filter === "Deliveries") return n.type === "delivery";
    return true;
  });

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0F4F0",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          paddingTop: insets.top,
        }}
      >
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🔔</Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Sign in for Notifications
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
          Get real-time alerts for orders, deliveries, weather, and more.
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      {/* Premium Header */}
      <View
        style={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 20,
          paddingBottom: 18,
          backgroundColor: "#1B5E20",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              Notifications
            </Text>
            {unread > 0 && (
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Roboto_400Regular",
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 1,
                }}
              >
                {unread} unread alert{unread > 1 ? "s" : ""}
              </Text>
            )}
          </View>
          {unread > 0 && (
            <TouchableOpacity
              onPress={markAllRead}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
              }}
            >
              <CheckCheck size={15} color="white" />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Poppins_600SemiBold",
                  color: "white",
                }}
              >
                All Read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: filter === f ? "#2E7D32" : "white",
              borderWidth: 1,
              borderColor: filter === f ? "#2E7D32" : "#E0E0E0",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: filter === f ? "white" : "#555",
              }}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
            tintColor="#2E7D32"
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            color="#2E7D32"
            size="large"
            style={{ marginTop: 60 }}
          />
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Bell size={48} color="#DDD" style={{ marginBottom: 12 }} />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_600SemiBold",
                color: "#999",
              }}
            >
              No notifications here
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {filtered.map((notif) => {
              const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
              const IconComp = config.icon;
              return (
                <TouchableOpacity
                  key={notif.id}
                  onPress={() => markRead(notif.id)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 18,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "flex-start",
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                    borderLeftWidth: notif.is_read ? 0 : 3,
                    borderLeftColor: "#2E7D32",
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      backgroundColor: config.bg,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <IconComp size={20} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: notif.is_read
                            ? "Roboto_500Medium"
                            : "Poppins_600SemiBold",
                          color: "#1A1A1A",
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      {!notif.is_read && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#2E7D32",
                            marginLeft: 8,
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Roboto_400Regular",
                        color: "#777",
                        marginTop: 4,
                        lineHeight: 18,
                      }}
                      numberOfLines={2}
                    >
                      {notif.message}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#BBB",
                        marginTop: 6,
                      }}
                    >
                      {timeAgo(notif.created_at)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
