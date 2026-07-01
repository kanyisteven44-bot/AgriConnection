import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Play,
  Clock,
  Star,
  ChevronRight,
} from "lucide-react-native";

const CATEGORIES = [
  { label: "Crop Farming", emoji: "🌱", color: "#2E7D32", bg: "#E8F5E9" },
  { label: "Livestock", emoji: "🐄", color: "#E65100", bg: "#FFF3E0" },
  { label: "Agribusiness", emoji: "📈", color: "#1565C0", bg: "#E3F2FD" },
  { label: "Finance", emoji: "💰", color: "#6A1B9A", bg: "#F3E5F5" },
  { label: "Smart Farming", emoji: "🤖", color: "#00838F", bg: "#E0F7FA" },
  { label: "Poultry", emoji: "🐔", color: "#F9A825", bg: "#FFF8E1" },
];

const FEATURED = [
  {
    title: "Soil Preparation & pH Management",
    category: "Crop Farming",
    duration: "12 min",
    rating: 4.9,
    lessons: 8,
    color: "#2E7D32",
    emoji: "🌱",
  },
  {
    title: "Organic Pest Control Methods",
    category: "Crop Farming",
    duration: "18 min",
    rating: 4.7,
    lessons: 10,
    color: "#E65100",
    emoji: "🐛",
  },
  {
    title: "Profitable Dairy Farming Basics",
    category: "Livestock",
    duration: "25 min",
    rating: 4.8,
    lessons: 14,
    color: "#1565C0",
    emoji: "🐄",
  },
  {
    title: "Smart Irrigation Techniques",
    category: "Smart Farming",
    duration: "15 min",
    rating: 4.6,
    lessons: 6,
    color: "#00838F",
    emoji: "💧",
  },
  {
    title: "Selling on AgriConnection",
    category: "Agribusiness",
    duration: "10 min",
    rating: 4.9,
    lessons: 5,
    color: "#6A1B9A",
    emoji: "📲",
  },
  {
    title: "Managing Farm Finances",
    category: "Finance",
    duration: "20 min",
    rating: 4.7,
    lessons: 9,
    color: "#F9A825",
    emoji: "💰",
  },
];

const TIPS = [
  {
    tip: "Test your soil pH before planting — the ideal range for most crops is 6.0–7.0.",
    emoji: "🧪",
  },
  {
    tip: "Rotate crops each season to prevent nutrient depletion and reduce pests.",
    emoji: "🔄",
  },
  {
    tip: "Apply mulch to conserve water and suppress weeds naturally.",
    emoji: "🍂",
  },
  {
    tip: "Early morning is the best time for irrigation to reduce evaporation.",
    emoji: "🌅",
  },
];

export default function Learning() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#1565C0",
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
          <BookOpen size={24} color="white" />
        </View>
        <View>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            Learning Center
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {FEATURED.length} courses · Expert guides
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 4 }}
        >
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            Browse Topics
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {CATEGORIES.map((cat, i) => (
              <TouchableOpacity
                key={i}
                style={{
                  width: "30%",
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 14,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: cat.bg,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#444",
                    textAlign: "center",
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Courses */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              Featured Courses
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#1565C0",
                }}
              >
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {FEATURED.map((course, i) => (
            <TouchableOpacity
              key={i}
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                padding: 16,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  backgroundColor: course.color + "18",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 28 }}>{course.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#1A1A1A",
                    lineHeight: 18,
                  }}
                >
                  {course.title}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Roboto_400Regular",
                    color: "#888",
                    marginTop: 3,
                  }}
                >
                  {course.category}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 6,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Clock size={10} color="#888" />
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      {course.duration}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <BookOpen size={10} color="#888" />
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                      }}
                    >
                      {course.lessons} lessons
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Star size={10} color="#FBC02D" fill="#FBC02D" />
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#888",
                      }}
                    >
                      {course.rating}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: course.color,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Play size={16} color="white" fill="white" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Tips */}
        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            💡 Quick Farming Tips
          </Text>
          {TIPS.map((item, i) => (
            <View
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? "#E8F5E9" : "#FFF8E1",
                borderRadius: 16,
                padding: 14,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: "Roboto_400Regular",
                  color: "#444",
                  lineHeight: 20,
                }}
              >
                {item.tip}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
