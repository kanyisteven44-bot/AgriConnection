import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  ArrowLeft,
  Search,
  Phone,
  Navigation,
  Truck,
  Leaf,
  ShoppingBag,
  FlaskConical,
  Package,
  Star,
  X,
  MapPin,
  RefreshCw,
} from "lucide-react-native";

const { width: SW, height: SH } = Dimensions.get("window");

const ROLE_CONFIG = {
  farmer: { color: "#2E7D32", bg: "#E8F5E9", emoji: "🌾", label: "Farmer" },
  buyer: { color: "#1565C0", bg: "#E3F2FD", emoji: "🛒", label: "Buyer" },
  supplier: { color: "#E65100", bg: "#FFF3E0", emoji: "📦", label: "Supplier" },
  expert: { color: "#00838F", bg: "#E0F7FA", emoji: "🔬", label: "Expert" },
  transporter: {
    color: "#6A1B9A",
    bg: "#F3E5F5",
    emoji: "🚚",
    label: "Driver",
  },
};

const FILTERS = [
  { key: "all", label: "🌍 All", color: "#555" },
  { key: "transporter", label: "🚚 Drivers", color: "#6A1B9A" },
  { key: "farmer", label: "🌾 Farmers", color: "#2E7D32" },
  { key: "buyer", label: "🛒 Buyers", color: "#1565C0" },
  { key: "supplier", label: "📦 Suppliers", color: "#E65100" },
  { key: "expert", label: "🔬 Experts", color: "#00838F" },
];

function RoleMarker({ role, isDriver, isAvailable, size = 44 }) {
  const conf = ROLE_CONFIG[role] || ROLE_CONFIG.farmer;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: isDriver ? size / 2 : 14,
        backgroundColor: conf.color,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2.5,
        borderColor: "white",
        shadowColor: conf.color,
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text style={{ fontSize: size * 0.42 }}>{conf.emoji}</Text>
      {isDriver && (
        <View
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 14,
            height: 14,
            borderRadius: 7,
            backgroundColor: isAvailable ? "#4CAF50" : "#F44336",
            borderWidth: 2,
            borderColor: "white",
          }}
        />
      )}
    </View>
  );
}

function UserCard({ item, isDriver, onClose, onCall }) {
  const conf = ROLE_CONFIG[item.role] || ROLE_CONFIG.farmer;
  const slideAnim = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 20,
        left: 12,
        right: 12,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 28,
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 20,
          elevation: 12,
          overflow: "hidden",
        }}
      >
        {/* Colored top strip */}
        <View style={{ height: 6, backgroundColor: conf.color }} />
        <View style={{ padding: 18 }}>
          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 30,
              height: 30,
              borderRadius: 10,
              backgroundColor: "#F5F5F5",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <X size={15} color="#666" />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 20,
                overflow: "hidden",
                borderWidth: 2.5,
                borderColor: conf.color,
              }}
            >
              {item.profile_photo ? (
                <Image
                  source={{ uri: item.profile_photo }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: conf.bg,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{conf.emoji}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                  }}
                >
                  {item.name}
                </Text>
                {item.is_verified && <Text style={{ fontSize: 13 }}>✅</Text>}
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <View
                  style={{
                    backgroundColor: conf.bg,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Poppins_700Bold",
                      color: conf.color,
                    }}
                  >
                    {conf.emoji} {conf.label}
                  </Text>
                </View>
                {isDriver && (
                  <View
                    style={{
                      backgroundColor:
                        item.is_available !== false ? "#E8F5E9" : "#FFEBEE",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Poppins_700Bold",
                        color:
                          item.is_available !== false ? "#2E7D32" : "#C62828",
                      }}
                    >
                      {item.is_available !== false ? "🟢 Available" : "🔴 Busy"}
                    </Text>
                  </View>
                )}
              </View>
              {item.location && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <MapPin size={11} color="#9BA8A0" />
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Roboto_400Regular",
                      color: "#9BA8A0",
                    }}
                  >
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Driver info */}
          {isDriver && item.vehicle_type && (
            <View
              style={{
                backgroundColor: "#F3E5F5",
                borderRadius: 14,
                padding: 12,
                flexDirection: "row",
                gap: 16,
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Roboto_400Regular",
                    color: "#9BA8A0",
                  }}
                >
                  Vehicle
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Poppins_700Bold",
                    color: "#6A1B9A",
                  }}
                >
                  {item.vehicle_type}
                </Text>
              </View>
              {item.capacity && (
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Roboto_400Regular",
                      color: "#9BA8A0",
                    }}
                  >
                    Capacity
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Poppins_700Bold",
                      color: "#6A1B9A",
                    }}
                  >
                    {item.capacity}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Farmer/Supplier info */}
          {!isDriver && item.crops_grown && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {item.crops_grown
                .split(",")
                .slice(0, 4)
                .map((crop, i) => (
                  <View
                    key={i}
                    style={{
                      backgroundColor: "#E8F5E9",
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#2E7D32",
                      }}
                    >
                      {crop.trim()}
                    </Text>
                  </View>
                ))}
              {item.active_products > 0 && (
                <View
                  style={{
                    backgroundColor: "#E3F2FD",
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: "Poppins_600SemiBold",
                      color: "#1565C0",
                    }}
                  >
                    📦 {item.active_products} products
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action buttons */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={() => onCall(item.phone)}
              style={{
                flex: 1,
                backgroundColor: isDriver ? "#6A1B9A" : conf.color,
                borderRadius: 16,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Phone size={16} color="white" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_700Bold",
                  color: "white",
                }}
              >
                {item.phone ? `Call` : "No number"}
              </Text>
            </TouchableOpacity>
            {isDriver && item.is_available !== false && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#E8F5E9",
                  borderRadius: 16,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 2,
                  borderColor: "#2E7D32",
                }}
              >
                <Truck size={16} color="#2E7D32" />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Poppins_700Bold",
                    color: "#2E7D32",
                  }}
                >
                  Book Driver
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function FarmersMap() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef(null);
  const [allItems, setAllItems] = useState([]); // farmers + buyers etc
  const [drivers, setDrivers] = useState([]); // transporters
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [myLocation, setMyLocation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState("map");
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshInterval = useRef(null);

  const fetchMapData = useCallback(async (lat, lng, showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (lat) params.set("lat", lat.toString());
      if (lng) params.set("lng", lng.toString());
      const res = await fetch(`/api/transporters?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.transporters || []);
        setAllItems(data.farmers || []);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("fetchMapData error", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        let lat = -1.2921,
          lng = 36.8219;
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setMyLocation({ latitude: lat, longitude: lng });
        }
        await fetchMapData(lat, lng);
      } catch {
        await fetchMapData(-1.2921, 36.8219);
      }
    };
    init();

    // Live refresh every 30 seconds (like Bolt/Uber driver positions)
    refreshInterval.current = setInterval(() => {
      const lat = myLocation?.latitude || -1.2921;
      const lng = myLocation?.longitude || 36.8219;
      fetchMapData(lat, lng);
    }, 30000);
    return () => clearInterval(refreshInterval.current);
  }, []);

  const manualRefresh = () => {
    const lat = myLocation?.latitude || -1.2921;
    const lng = myLocation?.longitude || 36.8219;
    fetchMapData(lat, lng, true);
  };

  const callUser = (phone) => {
    if (!phone) {
      Alert.alert("No number", "This user has not added a phone number.");
      return;
    }
    const cleaned = phone.replace(/\D/g, "");
    const withCode = cleaned.startsWith("254")
      ? cleaned
      : cleaned.startsWith("0")
        ? `254${cleaned.slice(1)}`
        : `254${cleaned}`;
    Linking.openURL(`tel:+${withCode}`).catch(() =>
      Alert.alert("Cannot call", `Call: ${phone}`),
    );
  };

  const focusUser = (item) => {
    setSelected(item);
    if (item.latitude && item.longitude && view === "map") {
      mapRef.current?.animateToRegion(
        {
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        },
        600,
      );
    }
  };

  // Filter combined items
  const combinedItems = [
    ...drivers.map((d) => ({ ...d, role: "transporter", _isDriver: true })),
    ...allItems,
  ];

  const filtered =
    filter === "all"
      ? combinedItems
      : filter === "transporter"
        ? combinedItems.filter((i) => i.role === "transporter")
        : combinedItems.filter((i) => i.role === filter);

  const withCoords = filtered.filter((i) => i.latitude && i.longitude);
  const listItems = filtered;

  const availableDrivers = drivers.filter(
    (d) => d.is_available !== false,
  ).length;
  const initialRegion = myLocation
    ? {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        latitudeDelta: 0.4,
        longitudeDelta: 0.4,
      }
    : {
        latitude: -1.2921,
        longitude: 36.8219,
        latitudeDelta: 2.5,
        longitudeDelta: 2.5,
      };

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: "#1A1A1A",
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
            backgroundColor: "rgba(255,255,255,0.12)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            AgriMap Live
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#4CAF50",
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {availableDrivers} drivers available · {allItems.length} farms
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={manualRefresh}
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: "rgba(255,255,255,0.12)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {refreshing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <RefreshCw size={16} color="white" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setView((v) => (v === "map" ? "list" : "map"))}
          style={{
            backgroundColor: "#2E7D32",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            {view === "map" ? "📋 List" : "🗺️ Map"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View
        style={{
          backgroundColor: "#1A1A1A",
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 16,
            paddingHorizontal: 14,
            alignItems: "center",
            height: 44,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Search size={15} color="rgba(255,255,255,0.5)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, location, crop..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: "Roboto_400Regular",
              color: "white",
              marginLeft: 10,
            }}
          />
        </View>
      </View>

      {/* Filter tabs */}
      <View
        style={{
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: filter === f.key ? "#1A1A1A" : "#F5F7FA",
                borderWidth: 1.5,
                borderColor: filter === f.key ? "#1A1A1A" : "#E8EEE5",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_700Bold",
                  color: filter === f.key ? "white" : "#555",
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
          }}
        >
          <ActivityIndicator color="#2E7D32" size="large" />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Roboto_400Regular",
              color: "#888",
            }}
          >
            Loading live map...
          </Text>
        </View>
      ) : view === "map" ? (
        /* ─── MAP VIEW ─── */
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            showsUserLocation={!!myLocation}
            showsMyLocationButton={false}
            showsCompass
            showsScale
          >
            {/* User radius circle */}
            {myLocation && (
              <Circle
                center={myLocation}
                radius={5000}
                fillColor="rgba(46,125,50,0.06)"
                strokeColor="rgba(46,125,50,0.2)"
                strokeWidth={1.5}
              />
            )}

            {/* All filtered markers */}
            {withCoords
              .filter(
                (item) =>
                  !search ||
                  item.name?.toLowerCase().includes(search.toLowerCase()) ||
                  item.location?.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item, i) => {
                const isDriver = item.role === "transporter" || item._isDriver;
                const conf = ROLE_CONFIG[item.role] || ROLE_CONFIG.farmer;
                return (
                  <Marker
                    key={`${item.role}-${item.id}-${i}`}
                    coordinate={{
                      latitude: parseFloat(item.latitude),
                      longitude: parseFloat(item.longitude),
                    }}
                    onPress={() => focusUser(item)}
                    anchor={isDriver ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 1 }}
                    tracksViewChanges={false}
                  >
                    <RoleMarker
                      role={item.role}
                      isDriver={isDriver}
                      isAvailable={item.is_available}
                      size={isDriver ? 48 : 42}
                    />
                  </Marker>
                );
              })}
          </MapView>

          {/* Live indicator */}
          <View
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              backgroundColor: "rgba(0,0,0,0.75)",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 7,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#4CAF50",
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              LIVE
            </Text>
          </View>

          {/* Center button */}
          {myLocation && (
            <TouchableOpacity
              onPress={() =>
                mapRef.current?.animateToRegion(
                  { ...myLocation, latitudeDelta: 0.2, longitudeDelta: 0.2 },
                  500,
                )
              }
              style={{
                position: "absolute",
                bottom: selected ? 220 : 20,
                right: 12,
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Navigation size={20} color="#1A1A1A" />
            </TouchableOpacity>
          )}

          {/* Stats bar */}
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "white",
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Poppins_700Bold",
                color: "#2E7D32",
              }}
            >
              🌾 {allItems.length}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Poppins_700Bold",
                color: "#6A1B9A",
              }}
            >
              🚚 {availableDrivers}
            </Text>
          </View>

          {/* Selected card */}
          {selected && (
            <UserCard
              item={selected}
              isDriver={selected.role === "transporter" || selected._isDriver}
              onClose={() => setSelected(null)}
              onCall={callUser}
            />
          )}
        </View>
      ) : (
        /* ─── LIST VIEW ─── */
        <ScrollView
          contentContainerStyle={{
            padding: 14,
            paddingBottom: insets.bottom + 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Driver section */}
          {(filter === "all" || filter === "transporter") &&
            drivers.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                    marginBottom: 10,
                  }}
                >
                  🚚 Drivers Near You ({drivers.length})
                </Text>
                {drivers
                  .filter(
                    (d) =>
                      !search ||
                      d.name?.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((driver) => (
                    <TouchableOpacity
                      key={driver.id}
                      onPress={() => focusUser(driver)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 14,
                        marginBottom: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        shadowColor: "#6A1B9A",
                        shadowOpacity: 0.08,
                        shadowRadius: 10,
                        elevation: 3,
                        borderLeftWidth: 4,
                        borderLeftColor:
                          driver.is_available !== false ? "#4CAF50" : "#F44336",
                      }}
                    >
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          overflow: "hidden",
                          borderWidth: 2,
                          borderColor: "#6A1B9A",
                        }}
                      >
                        {driver.profile_photo ? (
                          <Image
                            source={{ uri: driver.profile_photo }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: "#F3E5F5",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 24 }}>🚚</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: "Poppins_700Bold",
                            color: "#1A1A1A",
                          }}
                        >
                          {driver.name}
                        </Text>
                        {driver.vehicle_type && (
                          <Text
                            style={{
                              fontSize: 12,
                              fontFamily: "Roboto_400Regular",
                              color: "#6A1B9A",
                            }}
                          >
                            {driver.vehicle_type} · {driver.capacity || "—"}
                          </Text>
                        )}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 3,
                          }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor:
                                driver.is_available !== false
                                  ? "#4CAF50"
                                  : "#F44336",
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "Roboto_400Regular",
                              color:
                                driver.is_available !== false
                                  ? "#2E7D32"
                                  : "#C62828",
                            }}
                          >
                            {driver.is_available !== false
                              ? "Available"
                              : "Busy"}
                          </Text>
                          {driver.location && (
                            <Text style={{ fontSize: 11, color: "#9BA8A0" }}>
                              · {driver.location}
                            </Text>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => callUser(driver.phone)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          backgroundColor: driver.phone ? "#F3E5F5" : "#F5F5F5",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Phone
                          size={18}
                          color={driver.phone ? "#6A1B9A" : "#CCC"}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

          {/* Farms / other users */}
          {(filter === "all" || filter !== "transporter") && (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                  marginBottom: 10,
                }}
              >
                🌾 Farms & Users (
                {listItems.filter((i) => i.role !== "transporter").length})
              </Text>
              {listItems
                .filter(
                  (i) =>
                    i.role !== "transporter" &&
                    (!search ||
                      i.name?.toLowerCase().includes(search.toLowerCase()) ||
                      i.location?.toLowerCase().includes(search.toLowerCase())),
                )
                .map((item) => {
                  const conf = ROLE_CONFIG[item.role] || ROLE_CONFIG.farmer;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => focusUser(item)}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 20,
                        padding: 14,
                        marginBottom: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        shadowColor: "#000",
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          overflow: "hidden",
                          borderWidth: 2,
                          borderColor: conf.color,
                        }}
                      >
                        {item.profile_photo ? (
                          <Image
                            source={{ uri: item.profile_photo }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                          />
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: conf.bg,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Text style={{ fontSize: 24 }}>{conf.emoji}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: "Poppins_700Bold",
                              color: "#1A1A1A",
                            }}
                          >
                            {item.name}
                          </Text>
                          {item.is_verified && (
                            <Text style={{ fontSize: 11 }}>✅</Text>
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "Roboto_400Regular",
                            color: conf.color,
                          }}
                        >
                          {conf.emoji} {conf.label}
                        </Text>
                        {item.location && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#9BA8A0",
                              marginTop: 2,
                            }}
                          >
                            📍 {item.location}
                          </Text>
                        )}
                        {item.crops_grown && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: "#2E7D32",
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            🌱 {item.crops_grown}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => callUser(item.phone)}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 13,
                          backgroundColor: item.phone ? conf.bg : "#F5F5F5",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Phone
                          size={17}
                          color={item.phone ? conf.color : "#CCC"}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}

          {listItems.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ fontSize: 60 }}>🗺️</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                No results found
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  color: "#9BA8A0",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Try adjusting your search or filter
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
