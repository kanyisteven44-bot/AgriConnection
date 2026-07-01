import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Pressable,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MapPin,
  Star,
  ShoppingCart,
  Heart,
  Phone,
  CheckCircle,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Grains",
  "Livestock",
  "Dairy",
  "Poultry",
  "Seeds",
];

function ProductCard({
  product,
  onBuy,
  isSaved,
  onSave,
  ordering,
  orderSuccess,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 6,
      }}
    >
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{
          backgroundColor: "white",
          borderRadius: 26,
          overflow: "hidden",
        }}
      >
        {/* Image */}
        <View style={{ height: 210, position: "relative" }}>
          <Image
            source={{
              uri:
                product.image_url ||
                `https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&q=70`,
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
          {/* Category blur badge */}
          <View style={{ position: "absolute", top: 14, left: 14 }}>
            <BlurView
              intensity={70}
              tint="dark"
              style={{ borderRadius: 10, overflow: "hidden" }}
            >
              <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Poppins_700Bold",
                    color: "white",
                    letterSpacing: 0.5,
                  }}
                >
                  {(product.category || "Produce").toUpperCase()}
                </Text>
              </View>
            </BlurView>
          </View>
          {/* Save button */}
          <TouchableOpacity
            onPress={onSave}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: "rgba(255,255,255,0.92)",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Heart
              size={18}
              color={isSaved ? "#E53935" : "#CCC"}
              fill={isSaved ? "#E53935" : "transparent"}
            />
          </TouchableOpacity>
          {/* Rating */}
          <View style={{ position: "absolute", bottom: 14, left: 14 }}>
            <BlurView
              intensity={80}
              tint="light"
              style={{ borderRadius: 12, overflow: "hidden" }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                }}
              >
                <Star size={11} color="#FBC02D" fill="#FBC02D" />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                  }}
                >
                  4.8
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Roboto_400Regular",
                    color: "#777",
                  }}
                >
                  (124)
                </Text>
              </View>
            </BlurView>
          </View>
          {/* Stock */}
          <View
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              backgroundColor: product.quantity > 50 ? "#E8F5E9" : "#FFF8E1",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_600SemiBold",
                color: product.quantity > 50 ? "#2E7D32" : "#E65100",
              }}
            >
              {product.quantity} {product.unit}s left
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={{ padding: 18 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                }}
              >
                {product.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Roboto_400Regular",
                  color: "#2E7D32",
                  marginTop: 3,
                }}
              >
                by {product.seller_name || "Local Farmer"} ✓
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <MapPin size={11} color="#FBC02D" />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                  }}
                >
                  {product.location || "Kenya"}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Poppins_700Bold",
                  color: "#2E7D32",
                }}
              >
                KSh {product.price}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Roboto_400Regular",
                  color: "#AAA",
                }}
              >
                per {product.unit}
              </Text>
            </View>
          </View>

          {product.description ? (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Roboto_400Regular",
                color: "#777",
                lineHeight: 18,
                marginBottom: 14,
              }}
              numberOfLines={2}
            >
              {product.description}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={() => onBuy(product)}
            disabled={ordering}
            style={{
              backgroundColor: orderSuccess ? "#4CAF50" : "#2E7D32",
              padding: 16,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              shadowColor: "#2E7D32",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {ordering ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <ShoppingCart size={18} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Poppins_700Bold",
                    fontSize: 15,
                  }}
                >
                  {orderSuccess ? "Order Placed ✓" : "Buy Now"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MobileMarket() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [ordering, setOrdering] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [saved, setSaved] = useState({});

  // M-Pesa state
  const [mpesaModal, setMpesaModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [phone, setPhone] = useState("");
  const [mpesaLoading, setMpesaLoading] = useState(false);
  const [mpesaSuccess, setMpesaSuccess] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/products?`;
      if (search) url += `query=${encodeURIComponent(search)}&`;
      if (selectedCat !== "All")
        url += `category=${encodeURIComponent(selectedCat)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCat, search]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCat]);

  const handleOrder = async (product) => {
    setOrdering(product.id);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
          payment_method: "mobile_money",
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const data = await res.json();
      setOrderSuccess(product.id);
      setSelectedProduct(product);
      setCreatedOrderId(data.order?.id || null);
      setMpesaModal(true);
      setTimeout(() => setOrderSuccess(null), 2500);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not place order. Please try again.");
    } finally {
      setOrdering(null);
    }
  };

  const handleMpesaPay = async () => {
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) {
      Alert.alert(
        "Invalid phone",
        "Enter a valid Safaricom phone number (e.g. 0712 345 678)",
      );
      return;
    }
    setMpesaLoading(true);
    try {
      const res = await fetch("/api/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: selectedProduct?.price || 100,
          order_id: createdOrderId,
          account_ref: "AgriConnection",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMpesaSuccess(true);
        setTimeout(() => {
          setMpesaModal(false);
          setMpesaSuccess(false);
          setPhone("");
        }, 3000);
      } else {
        Alert.alert(
          "Payment Failed",
          data.error || "M-Pesa request failed. Please try again.",
        );
      }
    } catch {
      Alert.alert("Error", "Network error. Please retry.");
    } finally {
      setMpesaLoading(false);
    }
  };

  const toggleSave = (id) => setSaved((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      {/* ── M-PESA PAYMENT MODAL ── */}
      <Modal
        visible={mpesaModal}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 28,
              paddingBottom: insets.bottom + 28,
            }}
          >
            {mpesaSuccess ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#E8F5E9",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <CheckCircle size={40} color="#2E7D32" />
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                    marginBottom: 8,
                  }}
                >
                  STK Push Sent!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Roboto_400Regular",
                    color: "#666",
                    textAlign: "center",
                    lineHeight: 22,
                  }}
                >
                  Check your phone for the M-Pesa prompt.{"\n"}Enter your PIN to
                  complete payment.
                </Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: "#E8F5E9",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>📱</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 17,
                        fontFamily: "Poppins_700Bold",
                        color: "#1A1A1A",
                      }}
                    >
                      Pay with M-Pesa
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      Secure · Instant · Trusted
                    </Text>
                  </View>
                </View>

                {/* Product summary */}
                <View
                  style={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Poppins_600SemiBold",
                      color: "#888",
                      marginBottom: 6,
                    }}
                  >
                    ORDER SUMMARY
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins_700Bold",
                      color: "#1A1A1A",
                    }}
                    numberOfLines={1}
                  >
                    {selectedProduct?.name || "Product"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      fontFamily: "Poppins_700Bold",
                      color: "#2E7D32",
                      marginTop: 6,
                    }}
                  >
                    KSh {selectedProduct?.price || 0}
                  </Text>
                </View>

                {/* Phone input */}
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                    marginBottom: 8,
                  }}
                >
                  Safaricom Phone Number
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F5F5F5",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    marginBottom: 8,
                    borderWidth: 1.5,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Phone size={16} color="#4CAF50" />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="0712 345 678"
                    placeholderTextColor="#BBB"
                    keyboardType="phone-pad"
                    style={{
                      flex: 1,
                      height: 52,
                      fontSize: 16,
                      fontFamily: "Roboto_400Regular",
                      color: "#1A1A1A",
                      marginLeft: 10,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                    marginBottom: 24,
                    lineHeight: 17,
                  }}
                >
                  An M-Pesa STK push will be sent to this number. Enter your PIN
                  to confirm payment.
                </Text>

                {/* Buttons */}
                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleMpesaPay}
                    disabled={mpesaLoading}
                    style={{
                      backgroundColor: "#4CAF50",
                      padding: 18,
                      borderRadius: 18,
                      alignItems: "center",
                      shadowColor: "#4CAF50",
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    {mpesaLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Poppins_700Bold",
                          fontSize: 16,
                        }}
                      >
                        💳 Pay KSh {selectedProduct?.price || 0} via M-Pesa
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setMpesaModal(false);
                      setPhone("");
                    }}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      alignItems: "center",
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <Text
                      style={{
                        color: "#555",
                        fontFamily: "Poppins_600SemiBold",
                        fontSize: 15,
                      }}
                    >
                      Pay Later / Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </BlurView>
      </Modal>

      {/* Premium header */}
      <View
        style={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 20,
          backgroundColor: "#1B5E20",
          paddingBottom: 22,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: "#1B5E20",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.32,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              Marketplace
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.6)",
                marginTop: 2,
              }}
            >
              {products.length > 0
                ? `${products.length} fresh listings`
                : "Connecting farms to tables 🌾"}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "#FBC02D",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 14,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              🟢 LIVE
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.13)",
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            height: 48,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Search size={17} color="rgba(255,255,255,0.6)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => fetchProducts()}
            placeholder="Search tomatoes, maize, dairy..."
            placeholderTextColor="rgba(255,255,255,0.42)"
            returnKeyType="search"
            style={{
              flex: 1,
              height: 48,
              color: "white",
              marginLeft: 10,
              fontSize: 14,
              fontFamily: "Roboto_400Regular",
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                fetchProducts();
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 20 }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCat(cat)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: selectedCat === cat ? "#2E7D32" : "white",
              borderWidth: 1.5,
              borderColor: selectedCat === cat ? "#2E7D32" : "#DDD",
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 1,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: selectedCat === cat ? "white" : "#555",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProducts();
            }}
            tintColor="#2E7D32"
          />
        }
      >
        {loading ? (
          <View style={{ gap: 20 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "white",
                  borderRadius: 26,
                  overflow: "hidden",
                }}
              >
                <Skeleton
                  colorMode="light"
                  width="100%"
                  height={210}
                  radius={0}
                />
                <View style={{ padding: 18, gap: 10 }}>
                  <Skeleton
                    colorMode="light"
                    width="65%"
                    height={22}
                    radius={8}
                  />
                  <Skeleton
                    colorMode="light"
                    width="40%"
                    height={15}
                    radius={8}
                  />
                  <Skeleton
                    colorMode="light"
                    width="100%"
                    height={50}
                    radius={14}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ alignItems: "center", marginTop: 80 }}
          >
            <Text style={{ fontSize: 56, marginBottom: 14 }}>🌾</Text>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_700Bold",
                color: "#555",
              }}
            >
              No products found
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Roboto_400Regular",
                color: "#888",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Try a different category{"\n"}or search term
            </Text>
          </MotiView>
        ) : (
          products.map((product, i) => (
            <MotiView
              key={product.id}
              from={{ opacity: 0, translateY: 28 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400, delay: i * 60 }}
            >
              <ProductCard
                product={product}
                onBuy={handleOrder}
                isSaved={!!saved[product.id]}
                onSave={() => toggleSave(product.id)}
                ordering={ordering === product.id}
                orderSuccess={orderSuccess === product.id}
              />
            </MotiView>
          ))
        )}
      </ScrollView>
    </View>
  );
}
