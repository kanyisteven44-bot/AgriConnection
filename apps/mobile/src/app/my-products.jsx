import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react-native";

export default function MyProducts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!auth) {
      setLoading(false);
      return;
    }
    try {
      const headers = {};
      if (auth?.jwt) headers["Authorization"] = `Bearer ${auth.jwt}`;
      const res = await fetch("/api/products?mine=true", { headers });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDelete = (id, name) => {
    Alert.alert("Delete Product", `Remove "${name}" from the marketplace?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const headers = { "Content-Type": "application/json" };
            if (auth?.jwt) headers["Authorization"] = `Bearer ${auth.jwt}`;
            await fetch(`/api/products?id=${id}`, {
              method: "DELETE",
              headers,
            });
            setProducts((prev) => prev.filter((p) => p.id !== id));
          } catch (err) {
            Alert.alert("Error", "Could not delete product. Please try again.");
          }
        },
      },
    ]);
  };

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
        <Text style={{ fontSize: 40, marginBottom: 16 }}>📦</Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Sign in to view products
        </Text>
      </View>
    );
  }

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
            My Products
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {products.length} listing{products.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/upload")}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#FBC02D",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plus size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#2E7D32" size="large" />
        </View>
      ) : products.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
          }}
        >
          <Text style={{ fontSize: 52, marginBottom: 16 }}>🌾</Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
              textAlign: "center",
            }}
          >
            No products yet
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
            Start listing your farm produce in the marketplace!
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/upload")}
            style={{
              marginTop: 24,
              backgroundColor: "#2E7D32",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Plus size={18} color="white" />
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins_700Bold",
                fontSize: 14,
              }}
            >
              List a Product
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
          {products.map((product) => (
            <View
              key={product.id}
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
              <View style={{ flexDirection: "row", gap: 0 }}>
                {product.image_url ? (
                  <Image
                    source={{ uri: product.image_url }}
                    style={{ width: 100, height: 100 }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      backgroundColor: "#E8F5E9",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Package size={32} color="#2E7D32" />
                  </View>
                )}
                <View style={{ flex: 1, padding: 14 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        fontFamily: "Poppins_700Bold",
                        color: "#1A1A1A",
                      }}
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <View
                      style={{
                        backgroundColor: product.is_available
                          ? "#E8F5E9"
                          : "#FFF3E0",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Poppins_700Bold",
                          color: product.is_available ? "#2E7D32" : "#E65100",
                        }}
                      >
                        {product.is_available ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Roboto_400Regular",
                      color: "#888",
                      marginTop: 2,
                    }}
                  >
                    {product.category}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins_700Bold",
                        color: "#2E7D32",
                      }}
                    >
                      KSh {parseFloat(product.price).toLocaleString()}/
                      {product.unit}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      Stock: {product.quantity} {product.unit}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Actions */}
              <View
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderTopColor: "#F5F5F5",
                }}
              >
                <TouchableOpacity
                  onPress={() => handleDelete(product.id, product.name)}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 12,
                  }}
                >
                  <Trash2 size={14} color="#C62828" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_600SemiBold",
                      color: "#C62828",
                    }}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
