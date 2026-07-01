import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import {
  Camera,
  Package,
  MapPin,
  DollarSign,
  Tag,
  FileText,
  ChevronDown,
  CheckCircle,
} from "lucide-react-native";

const CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Livestock",
  "Dairy",
  "Poultry",
  "Seeds",
  "Fertilizers",
  "Equipment",
];
const UNITS = ["kg", "g", "ton", "litre", "piece", "bag", "bunch", "crate"];

export default function UploadProduct() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const [upload, { loading: uploading }] = useUpload();

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    quantity: "",
    description: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const pickImage = async (source = "library") => {
    let result;
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera permission needed",
          "Please allow camera access in settings.",
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Allow access to photos to upload product images.",
        );
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });
    }
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
      const { url, error } = await upload({ reactNativeAsset: asset });
      if (!error && url) {
        setImageUrl(url);
      } else {
        Alert.alert(
          "Upload failed",
          "Could not upload image. Please try again.",
        );
        setImage(null);
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!auth) {
      signIn();
      return;
    }
    if (!form.name || !form.price || !form.quantity) {
      Alert.alert(
        "Missing fields",
        "Please fill in product name, price, and quantity.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (auth?.jwt) headers["Authorization"] = `Bearer ${auth.jwt}`;

      const res = await fetch("/api/products", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          price: parseFloat(form.price),
          unit: form.unit,
          quantity: parseFloat(form.quantity),
          description: form.description,
          image_url: imageUrl,
          location: form.location,
        }),
      });
      if (!res.ok) throw new Error("Failed to list product");
      setSuccess(true);
      setForm({
        name: "",
        category: "Vegetables",
        price: "",
        unit: "kg",
        quantity: "",
        description: "",
        location: "",
      });
      setImage(null);
      setImageUrl(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not list your product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [form, imageUrl, auth]);

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
          Sign in to List Products
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
          Create an account as a Farmer or Supplier to start selling.
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

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F7FA",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: "#E8F5E9",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <CheckCircle size={56} color="#2E7D32" />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
          }}
        >
          Product Listed!
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Roboto_400Regular",
            color: "#888",
            marginTop: 8,
          }}
        >
          Your product is now visible in the marketplace.
        </Text>
      </View>
    );
  }

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    icon,
    multiline,
  }) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "Poppins_600SemiBold",
          color: "#444",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          backgroundColor: "white",
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: "#E0E0E0",
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
        }}
      >
        {icon && (
          <View style={{ marginRight: 10, paddingTop: multiline ? 2 : 0 }}>
            {icon}
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BBB"
          keyboardType={keyboardType || "default"}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          style={{
            flex: 1,
            fontSize: 14,
            fontFamily: "Roboto_400Regular",
            color: "#1A1A1A",
            height: multiline ? 80 : 50,
            textAlignVertical: multiline ? "top" : "center",
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
          }}
        >
          List a Product
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Roboto_400Regular",
            color: "#888",
            marginTop: 4,
          }}
        >
          Add your produce to the AgriConnection marketplace
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Upload */}
        {image ? (
          <View
            style={{
              height: 180,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 12,
              borderWidth: 2,
              borderColor: "#2E7D32",
            }}
          >
            <Image
              source={{ uri: image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        ) : (
          <View
            style={{
              height: 140,
              backgroundColor: "white",
              borderRadius: 20,
              borderWidth: 2,
              borderColor: "#E0E0E0",
              borderStyle: "dashed",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            {uploading ? (
              <ActivityIndicator color="#2E7D32" size="large" />
            ) : (
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    backgroundColor: "#E8F5E9",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Camera size={26} color="#2E7D32" />
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#2E7D32",
                  }}
                >
                  Add Product Photo
                </Text>
              </View>
            )}
          </View>
        )}
        {/* Photo picker buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => pickImage("camera")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#2E7D32",
              paddingVertical: 12,
              borderRadius: 14,
            }}
          >
            <Camera size={16} color="white" />
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins_600SemiBold",
                fontSize: 13,
              }}
            >
              Take Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickImage("library")}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "white",
              paddingVertical: 12,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: "#2E7D32",
            }}
          >
            <Package size={16} color="#2E7D32" />
            <Text
              style={{
                color: "#2E7D32",
                fontFamily: "Poppins_600SemiBold",
                fontSize: 13,
              }}
            >
              From Gallery
            </Text>
          </TouchableOpacity>
        </View>

        <InputField
          label="Product Name *"
          value={form.name}
          onChangeText={(v) => setForm({ ...form, name: v })}
          placeholder="e.g. Fresh Tomatoes"
          icon={<Package size={18} color="#888" />}
        />

        {/* Category Selector */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_600SemiBold",
              color: "#444",
              marginBottom: 6,
            }}
          >
            Category
          </Text>
          <TouchableOpacity
            onPress={() => setShowCatPicker(!showCatPicker)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "white",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: "#E0E0E0",
              paddingHorizontal: 14,
              height: 50,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Tag size={18} color="#888" />
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  color: "#1A1A1A",
                }}
              >
                {form.category}
              </Text>
            </View>
            <ChevronDown size={18} color="#888" />
          </TouchableOpacity>
          {showCatPicker && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "#E0E0E0",
                marginTop: 4,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setForm({ ...form, category: cat });
                    setShowCatPicker(false);
                  }}
                  style={{
                    padding: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F5F5F5",
                    backgroundColor:
                      form.category === cat ? "#E8F5E9" : "white",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily:
                        form.category === cat
                          ? "Poppins_600SemiBold"
                          : "Roboto_400Regular",
                      color: form.category === cat ? "#2E7D32" : "#1A1A1A",
                    }}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <InputField
              label="Price (KSh) *"
              value={form.price}
              onChangeText={(v) => setForm({ ...form, price: v })}
              placeholder="e.g. 80"
              keyboardType="numeric"
              icon={<DollarSign size={18} color="#888" />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label="Quantity *"
              value={form.quantity}
              onChangeText={(v) => setForm({ ...form, quantity: v })}
              placeholder="e.g. 300"
              keyboardType="numeric"
              icon={<Package size={18} color="#888" />}
            />
          </View>
        </View>

        {/* Unit Selector */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_600SemiBold",
              color: "#444",
              marginBottom: 6,
            }}
          >
            Unit
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setForm({ ...form, unit: u })}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: form.unit === u ? "#2E7D32" : "white",
                  borderWidth: 1.5,
                  borderColor: form.unit === u ? "#2E7D32" : "#E0E0E0",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Poppins_600SemiBold",
                    color: form.unit === u ? "white" : "#555",
                  }}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <InputField
          label="Location"
          value={form.location}
          onChangeText={(v) => setForm({ ...form, location: v })}
          placeholder="e.g. Nakuru, Kenya"
          icon={<MapPin size={18} color="#888" />}
        />

        <InputField
          label="Description"
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          placeholder="Describe quality, harvest date, growing conditions..."
          icon={<FileText size={18} color="#888" />}
          multiline
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || uploading}
          style={{
            backgroundColor: submitting ? "#66BB6A" : "#2E7D32",
            paddingVertical: 18,
            borderRadius: 18,
            alignItems: "center",
            shadowColor: "#2E7D32",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                color: "white",
                fontFamily: "Poppins_700Bold",
                fontSize: 16,
              }}
            >
              List Product in Marketplace
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
