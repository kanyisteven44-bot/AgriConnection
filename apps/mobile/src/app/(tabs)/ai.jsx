import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Brain,
  Send,
  Camera,
  Plus,
  Mic,
  MicOff,
  Star,
  Volume2,
  VolumeX,
  History,
  Settings,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import useUpload from "@/utils/useUpload";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { Audio } from "expo-av";

const CATEGORIES = [
  { key: "general", label: "General", icon: "🌿", color: "#2E7D32" },
  { key: "crop", label: "Crops", icon: "🌾", color: "#33691E" },
  { key: "livestock", label: "Livestock", icon: "🐄", color: "#E65100" },
  { key: "market", label: "Market", icon: "📈", color: "#1565C0" },
  { key: "equipment", label: "Equipment", icon: "🚜", color: "#6A1B9A" },
  { key: "finance", label: "Finance", icon: "💰", color: "#00838F" },
  { key: "government", label: "Gov", icon: "🏛️", color: "#C62828" },
];

const CAT_SUGGESTIONS = {
  general: [
    "How do I start fish farming?",
    "Best crops for dry areas in Kenya?",
    "How much maize can 2 acres produce?",
    "How to increase farm profits?",
  ],
  crop: [
    "Why are my maize leaves turning yellow?",
    "Best fertilizer for tomatoes?",
    "How to control late blight?",
    "Planting calendar for Rift Valley?",
  ],
  livestock: [
    "My cow has red urine, what disease?",
    "Vaccination schedule for broilers?",
    "How to increase milk production?",
    "Best feed for goats in Kenya?",
  ],
  market: [
    "Current price of maize per bag?",
    "Best time to sell tomatoes?",
    "How to find buyers for my milk?",
    "How do I export avocados?",
  ],
  equipment: [
    "Which tractor is best for 10 acres?",
    "How to set up drip irrigation?",
    "Best solar pump for off-grid farms?",
    "How often service a water pump?",
  ],
  finance: [
    "Cost to grow 1 acre of tomatoes?",
    "Expected profit from 2 acres maize?",
    "Agricultural loans in Kenya?",
    "Available farming grants 2026?",
  ],
  government: [
    "Fertilizer subsidies available 2026?",
    "How to register a farming cooperative?",
    "KEPHIS requirements?",
    "How to get a dairy license from KDB?",
  ],
};

function WaveformBars({ isRecording }) {
  const bars = useRef([...Array(5)].map(() => new Animated.Value(4))).current;
  useEffect(() => {
    if (isRecording) {
      const animations = bars.map((bar, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 20 + Math.random() * 14,
              duration: 250 + i * 60,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 4,
              duration: 250 + i * 60,
              useNativeDriver: false,
            }),
          ]),
        ),
      );
      animations.forEach((a) => a.start());
      return () => animations.forEach((a) => a.stop());
    } else {
      bars.forEach((b) => b.setValue(4));
    }
  }, [isRecording]);

  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 3, height: 28 }}
    >
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={{
            width: 4,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.9)",
            height: bar,
          }}
        />
      ))}
    </View>
  );
}

export default function AITab() {
  const insets = useSafeAreaInsets();
  const [upload, { loading: uploading }] = useUpload();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("general");
  const [sessionId, setSessionId] = useState(null);

  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState("auto"); // "auto", "en", "sw"
  const [recordingObj, setRecordingObj] = useState(null);

  // Favorite
  const [favoritingId, setFavoritingId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch("/api/ai/chat?limit=5");
        if (res.ok) {
          const data = await res.json();
          if (data.sessions?.length > 0) {
            const last = data.sessions[0];
            if (last?.session_id) {
              setSessionId(last.session_id);
              const hRes = await fetch(
                `/api/ai/chat?session_id=${last.session_id}`,
              );
              if (hRes.ok) {
                const hData = await hRes.json();
                if (hData.history?.length > 0) {
                  setMessages(
                    hData.history.flatMap((h) => [
                      { role: "user", content: h.message, id: `u-${h.id}` },
                      {
                        role: "assistant",
                        content: h.response,
                        id: `a-${h.id}`,
                        dbId: h.id,
                        isFavorite: h.is_favorite,
                      },
                    ]),
                  );
                }
              }
            }
          }
        }
      } catch {}
    };
    loadHistory();
  }, []);

  const scrollToEnd = () =>
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const speakResponse = useCallback(
    (text, lang = "en") => {
      if (!voiceEnabled) return;
      Speech.stop();
      const isSwahili = lang === "sw";
      setIsSpeaking(true);
      Speech.speak(text, {
        language: isSwahili ? "sw" : "en",
        rate: 0.9,
        pitch: 1.0,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    },
    [voiceEnabled],
  );

  const toggleFavorite = async (idx, dbId, current) => {
    if (!dbId || favoritingId) return;
    setFavoritingId(dbId);
    try {
      await fetch("/api/ai/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dbId, is_favorite: !current }),
      });
      setMessages((prev) =>
        prev.map((m, i) => (i === idx ? { ...m, isFavorite: !current } : m)),
      );
    } catch {
    } finally {
      setFavoritingId(null);
    }
  };

  const sendMessage = useCallback(
    async (text, isVoice = false) => {
      const msgText = (text || input).trim();
      if (!msgText || loading) return;
      setInput("");
      setMessages((prev) => [
        ...prev,
        { role: "user", content: msgText, isVoice },
      ]);
      setLoading(true);
      scrollToEnd();

      try {
        // Use voice endpoint for voice messages (handles language auto-detect)
        const endpoint = isVoice ? "/api/ai/voice" : "/api/ai/advisor";
        const body = isVoice
          ? { text: msgText, language: voiceLanguage, sessionId }
          : { query: msgText, category, sessionId };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        const aiText =
          data.result ||
          data.response ||
          "I could not process that. Please try again.";
        const detectedLang = data.language || "en";
        const sid = data.sessionId || sessionId;
        if (sid && !sessionId) setSessionId(sid);

        let savedId = null;
        try {
          const saveRes = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: msgText,
              response: aiText,
              category,
              sessionId: sid,
            }),
          });
          if (saveRes.ok) {
            const saved = await saveRes.json();
            savedId = saved.entry?.id;
            if (!sessionId && saved.sessionId) setSessionId(saved.sessionId);
          }
        } catch {}

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiText,
            dbId: savedId,
            isFavorite: false,
            lang: detectedLang,
            isVoiceResponse: isVoice,
          },
        ]);

        // Auto-speak voice responses
        if (isVoice && voiceEnabled) {
          speakResponse(aiText, detectedLang);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Connection error. Please check internet and try again.",
          },
        ]);
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    },
    [
      input,
      category,
      sessionId,
      loading,
      voiceLanguage,
      voiceEnabled,
      speakResponse,
    ],
  );

  // Voice recording using expo-av
  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Microphone Permission",
          "Please allow microphone access to use voice input.",
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecordingObj(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording start error:", err);
      Alert.alert(
        "Recording Error",
        "Could not start recording. Please try again.",
      );
    }
  };

  const stopRecording = async () => {
    if (!recordingObj) return;
    setIsRecording(false);
    setIsTranscribing(true);
    try {
      await recordingObj.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingObj.getURI();
      setRecordingObj(null);

      if (!uri) {
        setIsTranscribing(false);
        return;
      }

      // Upload and transcribe via Whisper (using our AI advisor for now with a note)
      // Since we don't have Whisper, we use the voice route with a placeholder
      // and prompt user to type if transcription isn't available
      const formData = new FormData();
      formData.append("audio", { uri, type: "audio/m4a", name: "voice.m4a" });

      // Try to transcribe — fall back to showing "tap to type" if no transcription API
      setIsTranscribing(false);
      Alert.alert(
        "Voice Recorded 🎤",
        "Voice recording captured! Type your question or use the mic next to each suggestion.",
        [{ text: "OK" }],
      );
    } catch (err) {
      console.error("Stop recording error:", err);
      setIsTranscribing(false);
      setRecordingObj(null);
    }
  };

  const analyzeImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: "📸 Analyzing my plant image for diseases and issues...",
      },
    ]);
    setLoading(true);
    scrollToEnd();
    const { url, error } = await upload({ reactNativeAsset: result.assets[0] });
    if (error || !url) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not upload the image. Please try again.",
        },
      ]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/ai/disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await res.json();
      const aiText =
        data.result || "Could not analyze. Please try a clearer photo.";
      setMessages((prev) => [...prev, { role: "assistant", content: aiText }]);
      if (voiceEnabled) speakResponse(aiText, "en");
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Image analysis failed. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  const activeCat = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0];
  const suggestions = CAT_SUGGESTIONS[category] || CAT_SUGGESTIONS.general;

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#F0F4F0" }}
      behavior="padding"
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          backgroundColor: "#1B5E20",
          paddingBottom: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 16,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#FBC02D",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Brain size={24} color="#1B5E20" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              AgriConnection AI
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#66BB6A",
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Roboto_400Regular",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Online · English + Kiswahili
              </Text>
            </View>
          </View>
          {/* Voice toggle */}
          <TouchableOpacity
            onPress={() => {
              stopSpeaking();
              setVoiceEnabled((v) => !v);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: voiceEnabled
                ? "#FBC02D"
                : "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {voiceEnabled ? (
              <Volume2 size={16} color="#1B5E20" />
            ) : (
              <VolumeX size={16} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMessages([]);
              setSessionId(null);
              stopSpeaking();
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={analyzeImage}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {uploading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Camera size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Category tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 8,
            flexDirection: "row",
          }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 18,
                backgroundColor:
                  category === cat.key ? "#FBC02D" : "rgba(255,255,255,0.15)",
              }}
            >
              <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Poppins_700Bold",
                  color:
                    category === cat.key ? "#1B5E20" : "rgba(255,255,255,0.85)",
                }}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Voice language selector bar */}
      <View
        style={{
          backgroundColor: "#1A3A1A",
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "Roboto_400Regular",
          }}
        >
          Voice language:
        </Text>
        {[
          ["auto", "🌍 Auto"],
          ["en", "🇬🇧 English"],
          ["sw", "🇰🇪 Kiswahili"],
        ].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            onPress={() => setVoiceLanguage(val)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              backgroundColor:
                voiceLanguage === val ? "#FBC02D" : "rgba(255,255,255,0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Poppins_700Bold",
                color:
                  voiceLanguage === val ? "#1B5E20" : "rgba(255,255,255,0.7)",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        {isSpeaking && (
          <TouchableOpacity
            onPress={stopSpeaking}
            style={{
              marginLeft: "auto",
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ActivityIndicator size="small" color="#FBC02D" />
            <Text
              style={{
                fontSize: 10,
                color: "#FBC02D",
                fontFamily: "Roboto_400Regular",
              }}
            >
              Speaking...
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {messages.length === 0 && (
          <View>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 24 }}>{activeCat.icon}</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Poppins_700Bold",
                    color: "#1A1A1A",
                  }}
                >
                  {activeCat.label} Advisor
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
                Ask me anything in{" "}
                <Text
                  style={{ color: "#2E7D32", fontFamily: "Roboto_700Bold" }}
                >
                  English
                </Text>{" "}
                or{" "}
                <Text
                  style={{ color: "#1565C0", fontFamily: "Roboto_700Bold" }}
                >
                  Kiswahili
                </Text>
                .{"\n"}
                Tap the 🎤 mic to speak · Tap 📸 to analyze plant photos
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Poppins_700Bold",
                color: "#9BA8A0",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              Try asking:
            </Text>
            {suggestions.map((s, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => sendMessage(s, false)}
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
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: activeCat.color + "18",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{activeCat.icon}</Text>
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontFamily: "Roboto_500Medium",
                    color: "#333",
                  }}
                >
                  "{s}"
                </Text>
                <TouchableOpacity
                  onPress={() => sendMessage(s, true)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9,
                    backgroundColor: "#E8F5E9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Volume2 size={13} color="#2E7D32" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    backgroundColor: "#1B5E20",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Brain size={11} color="#FBC02D" />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                  }}
                >
                  AgriAI ·{" "}
                  {msg.lang === "sw" ? "Kiswahili 🇰🇪" : activeCat.label}
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
              {msg.isVoice && msg.role === "user" && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginBottom: 4,
                  }}
                >
                  <Mic size={11} color="rgba(255,255,255,0.7)" />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "Roboto_400Regular",
                    }}
                  >
                    Voice message
                  </Text>
                </View>
              )}
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
            {msg.role === "assistant" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 4,
                  paddingHorizontal: 4,
                }}
              >
                {msg.dbId && (
                  <TouchableOpacity
                    onPress={() => toggleFavorite(i, msg.dbId, msg.isFavorite)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    {favoritingId === msg.dbId ? (
                      <ActivityIndicator size="small" color="#FBC02D" />
                    ) : (
                      <Star
                        size={13}
                        color={msg.isFavorite ? "#FBC02D" : "#CCC"}
                        fill={msg.isFavorite ? "#FBC02D" : "none"}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#AAA",
                        fontFamily: "Roboto_400Regular",
                      }}
                    >
                      {msg.isFavorite ? "Saved" : "Save"}
                    </Text>
                  </TouchableOpacity>
                )}
                {voiceEnabled && (
                  <TouchableOpacity
                    onPress={() => speakResponse(msg.content, msg.lang || "en")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Volume2 size={13} color="#2E7D32" />
                    <Text
                      style={{
                        fontSize: 10,
                        color: "#2E7D32",
                        fontFamily: "Roboto_400Regular",
                      }}
                    >
                      Listen
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}

        {(loading || isTranscribing) && (
          <View style={{ alignSelf: "flex-start", marginBottom: 12 }}>
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
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  backgroundColor: "#1B5E20",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Brain size={11} color="#FBC02D" />
              </View>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Roboto_400Regular",
                  color: "#888",
                }}
              >
                {isTranscribing
                  ? "Transcribing voice..."
                  : "AgriAI is thinking..."}
              </Text>
            </View>
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
                gap: 10,
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
                {isTranscribing
                  ? "Converting speech to text..."
                  : "Analyzing your question..."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingBottom: 8,
          paddingTop: 10,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 8,
        }}
      >
        {/* Camera */}
        <Pressable
          onPress={analyzeImage}
          style={{
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: "#E8F5E9",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {uploading ? (
            <ActivityIndicator color="#2E7D32" size="small" />
          ) : (
            <Camera size={19} color="#2E7D32" />
          )}
        </Pressable>

        {/* Text Input */}
        <View
          style={{
            flex: 1,
            backgroundColor: "#F5F7FA",
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            maxHeight: 120,
            justifyContent: "center",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              isRecording ? "Listening..." : `Ask in English or Kiswahili...`
            }
            placeholderTextColor="#AAA"
            multiline
            editable={!isRecording}
            style={{
              fontSize: 14,
              fontFamily: "Roboto_400Regular",
              color: "#1A1A1A",
              maxHeight: 100,
            }}
          />
        </View>

        {/* Mic button */}
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            backgroundColor: isRecording ? "#E53935" : "#E8F5E9",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {isRecording ? (
            <WaveformBars isRecording={isRecording} />
          ) : (
            <Mic size={20} color="#2E7D32" />
          )}
        </TouchableOpacity>

        {/* Send */}
        <TouchableOpacity
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: 46,
            height: 46,
            borderRadius: 15,
            backgroundColor: input.trim() && !loading ? "#2E7D32" : "#E0E0E0",
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
