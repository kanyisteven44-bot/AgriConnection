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
  ArrowLeft,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react-native";

const STATUS_CONFIG = {
  pending: { color: "#F9A825", bg: "#FFF8E1", icon: Clock, label: "Pending" },
  paid: { color: "#1565C0", bg: "#E3F2FD", icon: Package, label: "Paid" },
  confirmed: {
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: CheckCircle,
    label: "Confirmed",
  },
  shipped: { color: "#6A1B9A", bg: "#F3E5F5", icon: Truck, label: "Shipped" },
  delivered: {
    color: "#1B5E20",
    bg: "#C8E6C9",
    icon: CheckCircle,
    label: "Delivered",
  },
  cancelled: {
    color: "#C62828",
    bg: "#FFEBEE",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function MyOrders() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (auth) fetchOrders();
    else setLoading(false);
  }, [auth, fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

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
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🛒</Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Sign in to view orders
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Roboto_400Regular",
            color: "#888",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Your order history will appear here.
        </Text>
      </View>
    );
  }

  const filters = [
    "all",
    "pending",
    "paid",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#2E7D32",
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
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
              fontSize: 18,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            My Orders
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.15)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ShoppingBag size={20} color="white" />
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
        }}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              backgroundColor: filter === f ? "#2E7D32" : "#F5F5F5",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: filter === f ? "white" : "#555",
                textTransform: "capitalize",
              }}
            >
              {f === "all"
                ? `All (${orders.length})`
                : `${f} (${orders.filter((o) => o.status === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#2E7D32" size="large" />
          <Text
            style={{
              marginTop: 12,
              fontFamily: "Roboto_400Regular",
              color: "#888",
            }}
          >
            Loading your orders...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 52, marginBottom: 16 }}>📦</Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
              textAlign: "center",
            }}
          >
            No orders yet
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Roboto_400Regular",
              color: "#888",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {filter === "all"
              ? "Start shopping in the marketplace!"
              : `No ${filter} orders found.`}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/market")}
            style={{
              marginTop: 24,
              backgroundColor: "#2E7D32",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins_700Bold",
                fontSize: 14,
              }}
            >
              Browse Marketplace
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2E7D32"
            />
          }
        >
          {filtered.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  marginBottom: 12,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {/* Order header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      Order #{order.id}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#AAA",
                        marginTop: 2,
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: cfg.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                    }}
                  >
                    <StatusIcon size={12} color={cfg.color} />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Poppins_700Bold",
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </Text>
                  </View>
                </View>

                {/* Product info */}
                <View
                  style={{
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      backgroundColor: "#E8F5E9",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Package size={24} color="#2E7D32" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#1A1A1A",
                      }}
                      numberOfLines={1}
                    >
                      {order.product_name || "Product"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                        marginTop: 3,
                      }}
                    >
                      Qty: {order.quantity} ·{" "}
                      {order.payment_method || "Mobile Money"}
                    </Text>
                    {order.seller_name && (
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Roboto_400Regular",
                          color: "#AAA",
                          marginTop: 2,
                        }}
                      >
                        Seller: {order.seller_name}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins_700Bold",
                        color: "#2E7D32",
                      }}
                    >
                      KSh {parseFloat(order.total_price || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
