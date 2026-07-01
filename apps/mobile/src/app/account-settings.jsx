import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  ChevronRight,
  Bell,
  Globe,
  Settings,
  CheckCircle,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const ROLE_LABELS = {
  farmer: "🌾 Farmer",
  buyer: "🛒 Buyer",
  supplier: "📦 Supplier",
  transporter: "🚚 Transporter",
  expert: "🔬 Expert",
  consumer: "👤 Consumer",
  admin: "⚙️ Admin",
};

const TABS = [
  { key: "profile", icon: "👤", label: "Profile" },
  { key: "notifications", icon: "🔔", label: "Alerts" },
  { key: "appearance", icon: "🎨", label: "Display" },
  { key: "activity", icon: "📋", label: "Activity" },
];

export default function AccountSettings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [upload, { loading: uploading }] = useUpload();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [email, setEmail] = useState("");

  // Notification toggles
  const [pushOrders, setPushOrders] = useState(true);
  const [pushWeather, setPushWeather] = useState(true);
  const [pushNews, setPushNews] = useState(false);
  const [pushPayments, setPushPayments] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  // Appearance
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          const u = data.user || {};
          setName(u.name || "");
          setEmail(u.email || "");
          setPhone(u.phone || "");
          setLocation(u.location || "");
          setBio(u.bio || "");
          setRole(u.role || "");
          setProfilePhoto(u.profile_photo || u.image || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      const { url, error: err } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (!err && url) setProfilePhoto(url);
      else Alert.alert("Upload failed", "Could not upload photo. Try again.");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      const { url, error: err } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (!err && url) setProfilePhoto(url);
      else Alert.alert("Upload failed", "Could not upload photo. Try again.");
    }
  };

  const showPhotoOptions = () => {
    Alert.alert("Change Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const saveProfile = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          location,
          profile_photo: profilePhoto,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  function ToggleRow({ label, sub, value, onChange, iconColor = "#2E7D32" }) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: "#E8F5E9",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Bell size={16} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Roboto_500Medium",
              color: "#1A1A1A",
            }}
          >
            {label}
          </Text>
          {sub && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "#9BA8A0",
                marginTop: 2,
              }}
            >
              {sub}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: "#E0E0E0", true: "#81C784" }}
          thumbColor={value ? "#2E7D32" : "#AAA"}
        />
      </View>
    );
  }

  if (loading)
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

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#F5F7FA" }}
      behavior="padding"
    >
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
            backgroundColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
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
          Account Settings
        </Text>
        {activeTab === "profile" && (
          <TouchableOpacity
            onPress={saveProfile}
            disabled={saving}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#FBC02D",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 14,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#1A1A1A" size="small" />
            ) : (
              <Save size={16} color="#1A1A1A" />
            )}
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              Save
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#E8EEE5",
          paddingHorizontal: 8,
          paddingTop: 8,
        }}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingBottom: 10,
              borderBottomWidth: 2.5,
              borderBottomColor:
                activeTab === t.key ? "#2E7D32" : "transparent",
            }}
          >
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_700Bold",
                color: activeTab === t.key ? "#2E7D32" : "#BDBDBD",
                marginTop: 3,
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            {success && (
              <View
                style={{
                  backgroundColor: "#E8F5E9",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  borderWidth: 1.5,
                  borderColor: "#C8E6C9",
                }}
              >
                <CheckCircle size={18} color="#2E7D32" />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#2E7D32",
                  }}
                >
                  Profile saved successfully!
                </Text>
              </View>
            )}
            {error && (
              <View
                style={{
                  backgroundColor: "#FFEBEE",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1.5,
                  borderColor: "#FFCDD2",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Roboto_400Regular",
                    color: "#C62828",
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Profile Photo */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <TouchableOpacity
                onPress={showPhotoOptions}
                style={{ position: "relative", marginBottom: 12 }}
              >
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 28,
                    overflow: "hidden",
                    borderWidth: 3,
                    borderColor: "#2E7D32",
                  }}
                >
                  {profilePhoto ? (
                    <Image
                      source={{ uri: profilePhoto }}
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
                          fontSize: 40,
                          fontFamily: "Poppins_700Bold",
                          color: "white",
                        }}
                      >
                        {(name || "A")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "#FBC02D",
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "white",
                  }}
                >
                  {uploading ? (
                    <ActivityIndicator color="#1A1A1A" size="small" />
                  ) : (
                    <Camera size={16} color="#1A1A1A" />
                  )}
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                }}
              >
                {name || "Your Name"}
              </Text>
              {role && (
                <View
                  style={{
                    backgroundColor: "#E8F5E9",
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_600SemiBold",
                      color: "#2E7D32",
                    }}
                  >
                    {ROLE_LABELS[role] || role}
                  </Text>
                </View>
              )}
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Roboto_400Regular",
                  color: "#9BA8A0",
                  marginTop: 8,
                }}
              >
                Tap photo to change
              </Text>
            </View>

            {/* Personal Info */}
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_700Bold",
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 16,
                }}
              >
                Personal Information
              </Text>
              {[
                {
                  label: "Full Name",
                  value: name,
                  onChange: setName,
                  icon: User,
                  placeholder: "Enter your full name",
                },
                {
                  label: "Phone Number",
                  value: phone,
                  onChange: setPhone,
                  icon: Phone,
                  placeholder: "+254 7XX XXX XXX",
                  keyboard: "phone-pad",
                },
                {
                  label: "Location / County",
                  value: location,
                  onChange: setLocation,
                  icon: MapPin,
                  placeholder: "e.g. Nakuru, Nairobi...",
                },
              ].map((field, i) => {
                const IconComp = field.icon;
                return (
                  <View key={i} style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#555",
                        marginBottom: 8,
                      }}
                    >
                      {field.label}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#F5F7FA",
                        borderRadius: 16,
                        paddingHorizontal: 14,
                        paddingVertical: 4,
                        borderWidth: 1.5,
                        borderColor: "#E8EEE5",
                      }}
                    >
                      <IconComp
                        size={16}
                        color="#2E7D32"
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder={field.placeholder}
                        placeholderTextColor="#AAA"
                        keyboardType={field.keyboard || "default"}
                        style={{
                          flex: 1,
                          fontSize: 14,
                          fontFamily: "Roboto_400Regular",
                          color: "#1A1A1A",
                          paddingVertical: 12,
                        }}
                      />
                    </View>
                  </View>
                );
              })}

              {/* Bio */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  Bio / About
                </Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others about yourself or your farm..."
                  placeholderTextColor="#AAA"
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: "#F5F7FA",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    fontFamily: "Roboto_400Regular",
                    color: "#1A1A1A",
                    borderWidth: 1.5,
                    borderColor: "#E8EEE5",
                    height: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>

              {/* Email read-only */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  Email Address
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#F0F4F0",
                    borderRadius: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 16,
                    borderWidth: 1.5,
                    borderColor: "#E8EEE5",
                  }}
                >
                  <Mail size={16} color="#AAA" style={{ marginRight: 10 }} />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontFamily: "Roboto_400Regular",
                      color: "#888",
                    }}
                  >
                    {email}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#E8EEE5",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Poppins_700Bold",
                        color: "#888",
                      }}
                    >
                      LOCKED
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Account Actions */}
            <View
              style={{
                backgroundColor: "#FFF5F5",
                borderRadius: 24,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1.5,
                borderColor: "#FFCDD2",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_700Bold",
                  color: "#C62828",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 14,
                }}
              >
                Account Actions
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Change Password",
                    "A password reset link will be sent to your email.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Send Link", onPress: () => {} },
                    ],
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#FFCDD2",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Roboto_500Medium",
                    color: "#C62828",
                  }}
                >
                  Change Password
                </Text>
                <ChevronRight size={18} color="#C62828" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Delete Account",
                    "Are you sure? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {},
                      },
                    ],
                  )
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Roboto_500Medium",
                    color: "#C62828",
                  }}
                >
                  Delete Account
                </Text>
                <ChevronRight size={18} color="#C62828" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === "notifications" && (
          <>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_700Bold",
                color: "#9BA8A0",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Push Notifications
            </Text>
            <ToggleRow
              label="New Orders"
              sub="When someone buys your product"
              value={pushOrders}
              onChange={setPushOrders}
            />
            <ToggleRow
              label="Weather Alerts"
              sub="Severe weather warnings for your area"
              value={pushWeather}
              onChange={setPushWeather}
              iconColor="#1565C0"
            />
            <ToggleRow
              label="Farming News"
              sub="Tips, market prices and updates"
              value={pushNews}
              onChange={setPushNews}
              iconColor="#E65100"
            />
            <ToggleRow
              label="Payment Notifications"
              sub="M-Pesa and order payment alerts"
              value={pushPayments}
              onChange={setPushPayments}
              iconColor="#6A1B9A"
            />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_700Bold",
                color: "#9BA8A0",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 8,
                marginBottom: 12,
              }}
            >
              Email & SMS
            </Text>
            <ToggleRow
              label="Email Notifications"
              sub="Updates delivered to your inbox"
              value={emailNotifs}
              onChange={setEmailNotifs}
              iconColor="#1565C0"
            />
            <ToggleRow
              label="SMS Notifications"
              sub="Critical alerts via text message"
              value={smsNotifs}
              onChange={setSmsNotifs}
              iconColor="#6A1B9A"
            />
          </>
        )}

        {/* ── APPEARANCE TAB ── */}
        {activeTab === "appearance" && (
          <>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_700Bold",
                color: "#9BA8A0",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Language
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 16,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              {["English", "Kiswahili"].map((lang, i) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: i === 0 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Roboto_500Medium",
                        color: "#1A1A1A",
                      }}
                    >
                      {lang}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#9BA8A0",
                      }}
                    >
                      {lang === "English"
                        ? "Default language"
                        : "Lugha ya Kiswahili"}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2.5,
                      borderColor: language === lang ? "#2E7D32" : "#E0E0E0",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {language === lang && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#2E7D32",
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                backgroundColor: "#E8F5E9",
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_700Bold",
                  color: "#2E4D2E",
                  marginBottom: 6,
                }}
              >
                🌙 Dark Mode Coming Soon
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Roboto_400Regular",
                  color: "#2E4D2E",
                }}
              >
                We're building a beautiful dark mode experience. Stay tuned for
                our next update!
              </Text>
            </View>
          </>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === "activity" && (
          <>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_700Bold",
                color: "#9BA8A0",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Your Activity
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
              }}
            >
              {[
                {
                  icon: "🛒",
                  label: "Order History",
                  sub: "All your past purchases",
                  route: "/my-orders",
                },
                {
                  icon: "📦",
                  label: "My Products",
                  sub: "Your marketplace listings",
                  route: "/my-products",
                },
                {
                  icon: "🔔",
                  label: "Notifications",
                  sub: "All system notifications",
                  route: "/(tabs)/notifications",
                },
                {
                  icon: "🤖",
                  label: "AI Chat History",
                  sub: "Previous AI advisor conversations",
                  route: "/advisor",
                },
                {
                  icon: "🔒",
                  label: "Privacy & Security",
                  sub: "Account security settings",
                  route: "/privacy-security",
                },
              ].map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => router.push(item.route)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderBottomWidth: i < 4 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      backgroundColor: "#E8F5E9",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Roboto_500Medium",
                        color: "#1A1A1A",
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#9BA8A0",
                      }}
                    >
                      {item.sub}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#2E7D32" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}
