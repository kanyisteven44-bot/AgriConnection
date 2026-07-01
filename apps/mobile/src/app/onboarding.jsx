import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import useUpload from "@/utils/useUpload";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/utils/auth/useAuth";

const ROLES = [
  { value: "farmer", emoji: "🌾", label: "Farmer", desc: "Grow & sell farm produce" },
  { value: "buyer", emoji: "🛒", label: "Buyer", desc: "Purchase farm products" },
  { value: "supplier", emoji: "📦", label: "Supplier", desc: "Supply farm inputs" },
  { value: "transporter", emoji: "🚚", label: "Transporter", desc: "Deliver goods" },
  { value: "expert", emoji: "🔬", label: "Expert", desc: "Provide professional advice" },
  { value: "consumer", emoji: "👤", label: "Consumer", desc: "Buy fresh produce" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth } = useAuth();
  const [upload, { loading: uploading }] = useUpload();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("farmer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [farmSize, setFarmSize] = useState("");
  const [cropsGrown, setCropsGrown] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) {
      const { url, error } = await upload({ reactNativeAsset: result.assets[0] });
      if (!error && url) setProfilePhoto(url);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        role,
        phone,
        location,
        profile_photo: profilePhoto,
        farm: role === "farmer" ? { size: farmSize, crops_grown: cropsGrown, location } : undefined,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.replace("/(tabs)");
      } else {
        // Still navigate even on error since profile update is optional
        router.replace("/(tabs)");
      }
    } catch {
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const skip = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🌾</Text>
          </View>
          <Text style={styles.logoText}>AgriConnection</Text>
        </View>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {[1, 2].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              { backgroundColor: s <= step ? "#2E7D32" : "#E0E0E0" },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {step === 1 && (
            <>
              <Text style={styles.title}>Welcome to AgriConnection!</Text>
              <Text style={styles.subtitle}>
                Tell us about yourself to personalize your experience.
              </Text>

              {/* Profile Photo */}
              <TouchableOpacity onPress={pickPhoto} style={styles.photoPickerContainer}>
                {profilePhoto ? (
                  <Image
                    source={{ uri: profilePhoto }}
                    style={styles.profilePhoto}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderEmoji}>📷</Text>
                    <Text style={styles.photoPlaceholderText}>
                      {uploading ? "Uploading..." : "Add Photo"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefix}>
                    <Text style={styles.phonePrefixText}>+254</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="712 345 678"
                    placeholderTextColor="#BBB"
                    keyboardType="phone-pad"
                    style={styles.phoneInput}
                  />
                </View>
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Location / County</Text>
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Nakuru, Nairobi"
                  placeholderTextColor="#BBB"
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                onPress={() => {
                  fadeAnim.setValue(0);
                  setStep(2);
                }}
                style={styles.nextBtn}
              >
                <Text style={styles.nextBtnText}>Next Step →</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.title}>Choose Your Role</Text>
              <Text style={styles.subtitle}>
                Your role determines what features you see on AgriConnection.
              </Text>

              <View style={styles.rolesGrid}>
                {ROLES.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    style={[
                      styles.roleCard,
                      role === r.value && styles.roleCardSelected,
                    ]}
                  >
                    <Text style={styles.roleEmoji}>{r.emoji}</Text>
                    <Text
                      style={[
                        styles.roleLabel,
                        role === r.value && styles.roleLabelSelected,
                      ]}
                    >
                      {r.label}
                    </Text>
                    <Text
                      style={[
                        styles.roleDesc,
                        role === r.value && styles.roleDescSelected,
                      ]}
                    >
                      {r.desc}
                    </Text>
                    {role === r.value && (
                      <View style={styles.roleCheck}>
                        <Text style={{ color: "white", fontSize: 10 }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {role === "farmer" && (
                <View style={styles.farmSection}>
                  <Text style={styles.farmSectionTitle}>Farm Details (Optional)</Text>
                  <TextInput
                    value={farmSize}
                    onChangeText={setFarmSize}
                    placeholder="Farm size (e.g. 5 acres)"
                    placeholderTextColor="#BBB"
                    style={[styles.input, { marginBottom: 10 }]}
                  />
                  <TextInput
                    value={cropsGrown}
                    onChangeText={setCropsGrown}
                    placeholder="Crops grown (e.g. Maize, Tomatoes)"
                    placeholderTextColor="#BBB"
                    style={styles.input}
                  />
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => {
                    fadeAnim.setValue(0);
                    setStep(1);
                  }}
                  style={styles.backBtn}
                >
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.finishBtn, loading && styles.finishBtnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.finishBtnText}>🎉 Get Started!</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1B5E20",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FBC02D",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 18 },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "white",
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  skipText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: "#1B5E20",
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
  },
  photoPickerContainer: {
    alignSelf: "center",
    marginBottom: 24,
  },
  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#2E7D32",
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderEmoji: { fontSize: 24, marginBottom: 4 },
  photoPlaceholderText: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "700",
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1A1A1A",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phonePrefix: {
    backgroundColor: "#E8EEE5",
    borderWidth: 1.5,
    borderRightWidth: 0,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: "#1A1A1A",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  nextBtn: {
    backgroundColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  rolesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  roleCardSelected: {
    borderColor: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  roleEmoji: { fontSize: 24, marginBottom: 6 },
  roleLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  roleLabelSelected: { color: "#2E7D32" },
  roleDesc: { fontSize: 11, color: "#888" },
  roleDescSelected: { color: "#2E7D32" },
  roleCheck: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  farmSection: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
  },
  farmSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  backBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  backBtnText: { color: "#555", fontWeight: "700", fontSize: 15 },
  finishBtn: {
    flex: 2,
    backgroundColor: "#2E7D32",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishBtnDisabled: { opacity: 0.6 },
  finishBtnText: { color: "white", fontWeight: "900", fontSize: 16 },
});
