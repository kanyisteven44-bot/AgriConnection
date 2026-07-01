import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Search,
  MapPin,
  UserCheck,
  Users,
} from "lucide-react-native";

const ROLE_CONFIG = {
  farmer: { color: "#2E7D32", bg: "#E8F5E9", emoji: "🌾" },
  buyer: { color: "#1565C0", bg: "#E3F2FD", emoji: "🛒" },
  supplier: { color: "#E65100", bg: "#FFF3E0", emoji: "📦" },
  transporter: { color: "#6A1B9A", bg: "#F3E5F5", emoji: "🚛" },
  expert: { color: "#00838F", bg: "#E0F7FA", emoji: "👨‍🔬" },
  consumer: { color: "#37474F", bg: "#ECEFF1", emoji: "🧑" },
  admin: { color: "#B71C1C", bg: "#FFEBEE", emoji: "🛡️" },
};

export default function UserSearch() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  const doSearch = useCallback(
    async (q, r) => {
      const searchQ = q !== undefined ? q : query;
      const searchR = r !== undefined ? r : role;
      if (!searchQ.trim() && !searchR) return;
      setLoading(true);
      setSearched(true);
      try {
        const params = new URLSearchParams({
          search: searchQ.trim(),
          role: searchR,
        });
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
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#1B5E20",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
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
          <View>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              Find Users
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Search farmers, buyers, experts & more
            </Text>
          </View>
        </View>
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 4,
            gap: 10,
          }}
        >
          <Search size={18} color="#888" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or email..."
            placeholderTextColor="#BBB"
            returnKeyType="search"
            onSubmitEditing={() => doSearch()}
            autoFocus
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: "Roboto_400Regular",
              color: "#1A1A1A",
              paddingVertical: 10,
            }}
          />
          {loading && <ActivityIndicator color="#2E7D32" size="small" />}
        </View>
      </View>

      {/* Role filter */}
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
        {roles.map((r) => {
          const cfg = ROLE_CONFIG[r];
          return (
            <TouchableOpacity
              key={r || "all"}
              onPress={() => {
                setRole(r);
                doSearch(query, r);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: role === r ? "#2E7D32" : "#F5F5F5",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
            >
              {cfg && <Text style={{ fontSize: 12 }}>{cfg.emoji}</Text>}
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_600SemiBold",
                  color: role === r ? "white" : "#555",
                  textTransform: "capitalize",
                }}
              >
                {r || "All Roles"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!searched && !loading && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 28,
                backgroundColor: "#E8F5E9",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Users size={36} color="#2E7D32" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
                textAlign: "center",
              }}
            >
              Find AgriConnection Users
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Roboto_400Regular",
                color: "#888",
                textAlign: "center",
                marginTop: 8,
                lineHeight: 21,
              }}
            >
              Search for farmers, buyers, suppliers,{"\n"}transporters, and
              agricultural experts.
            </Text>
          </View>
        )}

        {searched && !loading && results.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              No users found
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Roboto_400Regular",
                color: "#888",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Try a different name, email, or role filter.
            </Text>
          </View>
        )}

        {results.map((user) => {
          const cfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.consumer;
          return (
            <View
              key={user.id}
              style={{
                backgroundColor: "white",
                borderRadius: 18,
                padding: 16,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              {user.profile_photo ? (
                <Image
                  source={{ uri: user.profile_photo }}
                  style={{ width: 52, height: 52, borderRadius: 16 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: cfg.bg,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{cfg.emoji}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins_700Bold",
                      color: "#1A1A1A",
                    }}
                  >
                    {user.name}
                  </Text>
                  {user.is_verified && <UserCheck size={14} color="#2E7D32" />}
                </View>
                {user.location && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 3,
                    }}
                  >
                    <MapPin size={11} color="#888" />
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      {user.location}
                    </Text>
                  </View>
                )}
                <View style={{ marginTop: 6 }}>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: cfg.bg,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Poppins_700Bold",
                        color: cfg.color,
                        textTransform: "capitalize",
                      }}
                    >
                      {user.role}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {}}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: "#E8F5E9",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16 }}>💬</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
