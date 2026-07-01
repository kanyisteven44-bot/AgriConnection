import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Send,
  HelpCircle,
  Brain,
  ChevronRight,
} from "lucide-react-native";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const CUSTOMER_CARE = "0117499067";

const FAQS = [
  {
    q: "How do I list my farm produce?",
    a: "Go to the Market tab, tap the + button, fill in product details, set your price and upload a photo. Your listing goes live immediately.",
  },
  {
    q: "How do I receive M-Pesa payment?",
    a: "After a buyer places an order, they pay via M-Pesa STK Push. Funds reflect directly to your registered M-Pesa number within minutes.",
  },
  {
    q: "How do I get my account verified?",
    a: "Go to Profile → Account Settings → Request Verification. Admin reviews your profile and grants a Verified badge within 24-48 hours.",
  },
  {
    q: "How does disease detection work?",
    a: "Go to Disease Detect on the home screen. Take or upload a clear photo of the affected plant part. Our AI analyzes it and gives diagnosis + treatment.",
  },
  {
    q: "Can I change my account role?",
    a: "Yes. Go to Profile → Account Settings → Change Role. Note that some features differ between roles like Farmer, Buyer, and Expert.",
  },
  {
    q: "How do I find buyers near me?",
    a: "Use the Farmers Map feature on the home screen. Enable GPS and you'll see registered buyers and farmers in your area.",
  },
];

export default function HelpSupport() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm the AgriConnection Support AI. I can help you with any questions about the platform.\n\nYou can also call our customer care team directly at 📞 0117499067 (available Mon–Sat, 8am–6pm).\n\nWhat can I help you with today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFaqs, setShowFaqs] = useState(true);
  const scrollRef = useRef(null);

  const callSupport = () => {
    Linking.openURL(`tel:${CUSTOMER_CARE}`).catch(() =>
      Alert.alert("Cannot make call", `Please call us at ${CUSTOMER_CARE}`),
    );
  };

  const sendMessage = useCallback(
    async (text) => {
      const msgText = text || input.trim();
      if (!msgText) return;
      setShowFaqs(false);
      setMessages((prev) => [...prev, { role: "user", content: msgText }]);
      setInput("");
      setLoading(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const res = await fetch("/integrations/google-gemini-2-5-pro/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are the AgriConnection customer support AI assistant for a Kenyan agricultural platform.
AgriConnection helps farmers, buyers, suppliers, transporters and experts connect digitally.
Key features: Marketplace, AI Advisor, Disease Detection, GPS Weather, Farm Finance Tracker, Community, Farmer Map.
Payment method: M-Pesa. Location: Kenya. Customer care phone: 0117499067.
Answer support questions helpfully and clearly. If the issue is serious or technical, tell the user to call 0117499067.
Keep responses concise and friendly. Use bullet points when listing steps.`,
              },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: "user", content: msgText },
            ],
          }),
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        const reply =
          data?.choices?.[0]?.message?.content ||
          "I'm having trouble right now. Please call our support team at 0117499067.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm unable to connect right now. Please call our support team directly at 📞 0117499067.",
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
    [input, messages],
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
          backgroundColor: "#00838F",
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
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <HelpCircle size={24} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            Help & Support
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: "#80CBC4",
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.75)",
              }}
            >
              AI Support Online
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={callSupport}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#FBC02D",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 14,
          }}
        >
          <Phone size={14} color="#1A1A1A" />
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
            }}
          >
            Call Us
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {/* Call Support Banner */}
        <TouchableOpacity
          onPress={callSupport}
          style={{
            backgroundColor: "#E0F7FA",
            borderRadius: 18,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: "#00838F",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              backgroundColor: "#00838F",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Phone size={24} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Poppins_700Bold",
                color: "#00838F",
              }}
            >
              Customer Care
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_900Black",
                color: "#00527A",
              }}
            >
              {CUSTOMER_CARE}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "#00838F",
              }}
            >
              Mon–Sat · 8am–6pm
            </Text>
          </View>
          <ChevronRight size={22} color="#00838F" />
        </TouchableOpacity>

        {/* FAQs */}
        {showFaqs && (
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
                marginBottom: 10,
              }}
            >
              Frequently Asked Questions
            </Text>
            {FAQS.map((faq, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => sendMessage(faq.q)}
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: "#E0F7FA",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_700Bold",
                        color: "#00838F",
                      }}
                    >
                      ?
                    </Text>
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontFamily: "Roboto_500Medium",
                      color: "#333",
                      lineHeight: 19,
                    }}
                  >
                    {faq.q}
                  </Text>
                  <ChevronRight size={16} color="#CCC" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <View
            key={i}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "88%",
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
                    backgroundColor: "#00838F",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Brain size={12} color="white" />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                  }}
                >
                  Support AI
                </Text>
              </View>
            )}
            <View
              style={{
                backgroundColor: msg.role === "user" ? "#00838F" : "white",
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
              <ActivityIndicator color="#00838F" size="small" />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Roboto_400Regular",
                  color: "#888",
                }}
              >
                Support AI is typing...
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
        <TouchableOpacity
          onPress={callSupport}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: "#E0F7FA",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Phone size={20} color="#00838F" />
        </TouchableOpacity>
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
            placeholder="Ask anything or describe your issue..."
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
            backgroundColor: input.trim() ? "#00838F" : "#CCC",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}
