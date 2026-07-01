import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  Brain,
  Send,
  Camera,
  ArrowLeft,
  Sparkles,
  Leaf,
  Bug,
  Droplets,
  Sun,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const SUGGESTIONS = [
  { icon: Leaf, text: "Why are my maize leaves yellow?", color: "#2E7D32" },
  { icon: Bug, text: "How to control aphids on tomatoes?", color: "#E65100" },
  {
    icon: Droplets,
    text: "Best irrigation schedule for dry season?",
    color: "#1565C0",
  },
  { icon: Sun, text: "Best crops to plant in June?", color: "#F9A825" },
];

export default function AIAdvisor() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [upload, { loading: uploading }] = useUpload();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      const { url, error } = await upload({
        reactNativeAsset: result.assets[0],
      });
      if (!error && url) {
        sendMessage(
          "I've uploaded a plant image. Please analyze it for diseases, pests, or nutritional issues.",
          "disease",
        );
      }
    }
  };

  const sendMessage = useCallback(
    async (text, type = "advice") => {
      const msgText = text || input.trim();
      if (!msgText) return;
      setMessages((prev) => [...prev, { role: "user", content: msgText }]);
      setInput("");
      setLoading(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const res = await fetch("/api/ai/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: msgText, type }),
        });
        if (!res.ok) throw new Error("AI request failed");
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.result ||
              data.response ||
              "I could not process that request. Please try again.",
          },
        ]);
      } catch (err) {
        console.error(err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Please check your connection and try again.",
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          100,
        );
      }
    },
    [input],
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
          backgroundColor: "#1B5E20",
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
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "#2E7D32",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Brain size={24} color="#FBC02D" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            Agri AI Advisor
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: "#66BB6A",
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Powered by AI · Online
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={pickImage}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#FBC02D",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {uploading ? (
            <ActivityIndicator color="#2E7D32" size="small" />
          ) : (
            <Camera size={20} color="#2E7D32" />
          )}
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {messages.length === 0 && (
          <View>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 24,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Sparkles size={22} color="#FBC02D" />
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                  }}
                >
                  Hello, Farmer! 👋
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto_400Regular",
                  color: "#666",
                  lineHeight: 21,
                }}
              >
                I'm your AI farming assistant. Ask me anything about crops,
                pests, weather, fertilizers, market prices, or upload a photo to
                detect plant diseases instantly.
              </Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                fontFamily: "Poppins_600SemiBold",
                color: "#888",
                marginBottom: 10,
                paddingLeft: 4,
              }}
            >
              Try asking:
            </Text>
            {SUGGESTIONS.map((s, i) => {
              const IconComp = s.icon;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => sendMessage(s.text)}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
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
                      borderRadius: 10,
                      backgroundColor: s.color + "18",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconComp size={18} color={s.color} />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontFamily: "Roboto_500Medium",
                      color: "#333",
                    }}
                  >
                    "{s.text}"
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {messages.map((msg, i) => (
          <View
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              marginBottom: 12,
            }}
          >
            {msg.role === "assistant" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    backgroundColor: "#2E7D32",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Brain size={12} color="#FBC02D" />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                  }}
                >
                  AI Advisor
                </Text>
              </View>
            )}
            <View
              style={{
                backgroundColor: msg.role === "user" ? "#2E7D32" : "white",
                padding: 14,
                borderRadius: 18,
                borderTopRightRadius: msg.role === "user" ? 4 : 18,
                borderTopLeftRadius: msg.role === "user" ? 18 : 4,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: msg.role === "user" ? "white" : "#1A1A1A",
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  lineHeight: 22,
                }}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={{ alignSelf: "flex-start", marginBottom: 12 }}>
            <View
              style={{
                backgroundColor: "white",
                padding: 16,
                borderRadius: 18,
                borderTopLeftRadius: 4,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ActivityIndicator color="#2E7D32" size="small" />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto_400Regular",
                  color: "#888",
                }}
              >
                Analyzing...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 12,
          paddingTop: 12,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F5F7FA",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxHeight: 120,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your crops..."
            placeholderTextColor="#AAA"
            multiline
            style={{
              fontSize: 14,
              fontFamily: "Roboto_400Regular",
              color: "#1A1A1A",
              maxHeight: 100,
            }}
          />
        </View>
        <TouchableOpacity
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: input.trim() ? "#2E7D32" : "#CCC",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#2E7D32",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: input.trim() ? 0.3 : 0,
            shadowRadius: 6,
            elevation: input.trim() ? 4 : 0,
          }}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
