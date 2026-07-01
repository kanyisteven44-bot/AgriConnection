import { Tabs } from "expo-router";
import { Hop as Home, ShoppingBag, Users, User, Brain } from "lucide-react-native";
import { View, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          paddingTop: 6,
          height: 60 + (Platform.OS === "ios" ? insets.bottom : 8),
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 24,
          elevation: 20,
        },
        tabBarActiveTintColor: "#2E7D32",
        tabBarInactiveTintColor: "#BDBDBD",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: focused ? "#1B5E20" : "#2E7D32",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: Platform.OS === "ios" ? 16 : 22,
                shadowColor: "#2E7D32",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 14,
                elevation: 12,
              }}
            >
              <Brain size={26} color="white" />
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 8,
                  fontWeight: "700",
                  marginTop: 1,
                }}
              >
                AI
              </Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
      {/* Hidden screens - accessible via navigation but not shown as tabs */}
      <Tabs.Screen name="upload" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
