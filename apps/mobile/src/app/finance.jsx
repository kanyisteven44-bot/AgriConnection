import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  DollarSign,
  ChevronRight,
  CheckCircle,
} from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");

const INCOME_CATS = [
  "Crop Sales",
  "Livestock Sales",
  "Milk Sales",
  "Egg Sales",
  "Consulting",
  "Other",
];
const EXPENSE_CATS = [
  "Seeds",
  "Fertilizers",
  "Pesticides",
  "Labour",
  "Equipment",
  "Transport",
  "Water",
  "Other",
];

function MiniBar({ month, income, expense, maxVal }) {
  const incH = maxVal > 0 ? Math.max(4, (income / maxVal) * 80) : 4;
  const expH = maxVal > 0 ? Math.max(4, (expense / maxVal) * 80) : 4;
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 3,
          height: 84,
        }}
      >
        <View
          style={{
            width: 10,
            height: incH,
            backgroundColor: "#2E7D32",
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: 10,
            height: expH,
            backgroundColor: "#E53935",
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        style={{
          fontSize: 9,
          fontFamily: "Roboto_400Regular",
          color: "#888",
          marginTop: 4,
        }}
      >
        {month}
      </Text>
    </View>
  );
}

export default function FinanceTracker() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auth, signIn } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: "income",
    category: "Crop Sales",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("overview");

  const fetchData = useCallback(async () => {
    if (!auth) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/farm-records");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/farm-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setShowAdd(false);
      setForm({
        type: "income",
        category: "Crop Sales",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (err) {
      Alert.alert("Error", "Could not save record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F0F4F0",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          paddingTop: insets.top,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💰</Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Poppins_700Bold",
            color: "#1A1A1A",
            textAlign: "center",
          }}
        >
          Sign in to Track Finances
        </Text>
        <TouchableOpacity
          onPress={() => signIn()}
          style={{
            backgroundColor: "#2E7D32",
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 16,
            marginTop: 24,
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

  const income = parseFloat(data?.summary?.total_income || 0);
  const expense = parseFloat(data?.summary?.total_expense || 0);
  const profit = income - expense;
  const monthly = data?.monthly || [];
  const maxVal = Math.max(
    ...monthly.map((m) =>
      Math.max(parseFloat(m.income || 0), parseFloat(m.expense || 0)),
    ),
    1,
  );
  const records = data?.records || [];

  const DEMO_RECORDS =
    records.length === 0
      ? [
          {
            id: "d1",
            type: "income",
            category: "Crop Sales",
            amount: "12000",
            date: "2026-06-10",
            description: "Tomatoes sold to market",
          },
          {
            id: "d2",
            type: "expense",
            category: "Fertilizers",
            amount: "3500",
            date: "2026-06-08",
            description: "DAP fertilizer 50kg",
          },
          {
            id: "d3",
            type: "income",
            category: "Livestock Sales",
            amount: "8000",
            date: "2026-06-05",
            description: "2 goats sold",
          },
          {
            id: "d4",
            type: "expense",
            category: "Labour",
            amount: "2000",
            date: "2026-06-03",
            description: "Weeding labour",
          },
        ]
      : records;

  const DEMO_MONTHLY =
    monthly.length === 0
      ? [
          { month: "Jan", income: 18000, expense: 9000 },
          { month: "Feb", income: 22000, expense: 11000 },
          { month: "Mar", income: 15000, expense: 8000 },
          { month: "Apr", income: 27000, expense: 13000 },
          { month: "May", income: 19000, expense: 10000 },
          { month: "Jun", income: 20000, expense: 5500 },
        ]
      : monthly;

  const displayMaxVal = Math.max(
    ...DEMO_MONTHLY.map((m) =>
      Math.max(parseFloat(m.income || 0), parseFloat(m.expense || 0)),
    ),
    1,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 18,
          backgroundColor: "#6A1B9A",
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              Farm Finance
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Roboto_400Regular",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Income · Expenses · Profit
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: "#FBC02D",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Plus size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            color="#6A1B9A"
            size="large"
            style={{ marginTop: 60 }}
          />
        ) : (
          <>
            {/* Summary Cards */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              {[
                {
                  label: "Total Income",
                  value: `KSh ${(records.length > 0 ? income : 45000).toLocaleString()}`,
                  icon: <TrendingUp size={20} color="#2E7D32" />,
                  bg: "#E8F5E9",
                  color: "#2E7D32",
                },
                {
                  label: "Total Expense",
                  value: `KSh ${(records.length > 0 ? expense : 15500).toLocaleString()}`,
                  icon: <TrendingDown size={20} color="#E53935" />,
                  bg: "#FFEBEE",
                  color: "#E53935",
                },
              ].map((s, i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0, translateY: 16 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 400, delay: i * 80 }}
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 20,
                      padding: 16,
                      shadowColor: "#000",
                      shadowOpacity: 0.07,
                      shadowRadius: 10,
                      elevation: 3,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: s.bg,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      {s.icon}
                    </View>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Poppins_700Bold",
                        color: "#1A1A1A",
                      }}
                    >
                      {s.value}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                        marginTop: 2,
                      }}
                    >
                      {s.label}
                    </Text>
                  </View>
                </MotiView>
              ))}
            </View>

            {/* Profit Card */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 180 }}
            >
              <View
                style={{
                  backgroundColor: profit >= 0 ? "#1B5E20" : "#B71C1C",
                  borderRadius: 22,
                  padding: 22,
                  marginBottom: 20,
                  shadowColor: profit >= 0 ? "#1B5E20" : "#B71C1C",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.28,
                  shadowRadius: 14,
                  elevation: 7,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_600SemiBold",
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 6,
                  }}
                >
                  NET PROFIT / LOSS
                </Text>
                <Text
                  style={{
                    fontSize: 36,
                    fontFamily: "Poppins_700Bold",
                    color: "white",
                  }}
                >
                  {profit >= 0 ? "+" : "-"} KSh{" "}
                  {Math.abs(
                    records.length > 0 ? profit : 29500,
                  ).toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Roboto_400Regular",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 6,
                  }}
                >
                  {profit >= 0
                    ? "✅ Your farm is profitable"
                    : "⚠️ Expenses exceed income"}
                </Text>
              </View>
            </MotiView>

            {/* Monthly Chart */}
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 500, delay: 240 }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 22,
                  padding: 20,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOpacity: 0.07,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Poppins_700Bold",
                      color: "#1A1A1A",
                    }}
                  >
                    Monthly Performance
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: "#2E7D32",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Roboto_400Regular",
                          color: "#888",
                        }}
                      >
                        Income
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          backgroundColor: "#E53935",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Roboto_400Regular",
                          color: "#888",
                        }}
                      >
                        Expense
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                  {DEMO_MONTHLY.map((m, i) => (
                    <MiniBar
                      key={i}
                      month={m.month}
                      income={parseFloat(m.income || 0)}
                      expense={parseFloat(m.expense || 0)}
                      maxVal={displayMaxVal}
                    />
                  ))}
                </View>
              </View>
            </MotiView>

            {/* Recent Records */}
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
                marginBottom: 12,
              }}
            >
              Recent Records
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 22,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOpacity: 0.07,
                shadowRadius: 10,
                elevation: 3,
              }}
            >
              {DEMO_RECORDS.slice(0, 8).map((rec, i) => (
                <View
                  key={rec.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                    borderBottomWidth:
                      i < Math.min(DEMO_RECORDS.length, 8) - 1 ? 1 : 0,
                    borderBottomColor: "#F5F5F5",
                  }}
                >
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor:
                        rec.type === "income" ? "#E8F5E9" : "#FFEBEE",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    {rec.type === "income" ? (
                      <TrendingUp size={18} color="#2E7D32" />
                    ) : (
                      <TrendingDown size={18} color="#E53935" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Poppins_600SemiBold",
                        color: "#1A1A1A",
                      }}
                    >
                      {rec.category}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto_400Regular",
                        color: "#888",
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {rec.description || "—"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_700Bold",
                        color: rec.type === "income" ? "#2E7D32" : "#E53935",
                      }}
                    >
                      {rec.type === "income" ? "+" : "-"}KSh{" "}
                      {parseFloat(rec.amount).toLocaleString()}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontFamily: "Roboto_400Regular",
                        color: "#AAA",
                        marginTop: 2,
                      }}
                    >
                      {rec.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Record Modal */}
      <Modal
        visible={showAdd}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
                marginBottom: 4,
              }}
            >
              Add Record
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Roboto_400Regular",
                color: "#888",
                marginBottom: 20,
              }}
            >
              Track your farm income and expenses
            </Text>

            {/* Type toggle */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {["income", "expense"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() =>
                    setForm({
                      ...form,
                      type: t,
                      category: t === "income" ? "Crop Sales" : "Seeds",
                    })
                  }
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor:
                      form.type === t
                        ? t === "income"
                          ? "#E8F5E9"
                          : "#FFEBEE"
                        : "#F5F5F5",
                    borderWidth: 1.5,
                    borderColor:
                      form.type === t
                        ? t === "income"
                          ? "#2E7D32"
                          : "#E53935"
                        : "transparent",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      fontSize: 14,
                      color:
                        form.type === t
                          ? t === "income"
                            ? "#2E7D32"
                            : "#E53935"
                          : "#888",
                    }}
                  >
                    {t === "income" ? "💰 Income" : "💸 Expense"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category chips */}
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: "#555",
                marginBottom: 8,
              }}
            >
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginBottom: 14 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {(form.type === "income" ? INCOME_CATS : EXPENSE_CATS).map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setForm({ ...form, category: cat })}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 16,
                      backgroundColor:
                        form.category === cat ? "#6A1B9A" : "#F5F5F5",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_600SemiBold",
                        color: form.category === cat ? "white" : "#555",
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </ScrollView>

            {/* Amount */}
            <View
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_600SemiBold",
                  color: "#888",
                  marginRight: 8,
                }}
              >
                KSh
              </Text>
              <TextInput
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#CCC"
                style={{
                  flex: 1,
                  height: 52,
                  fontSize: 20,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                }}
              />
            </View>

            {/* Description */}
            <View
              style={{
                backgroundColor: "#F5F5F5",
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 20,
              }}
            >
              <TextInput
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
                placeholder="Description (optional)"
                placeholderTextColor="#CCC"
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_400Regular",
                  color: "#1A1A1A",
                  minHeight: 42,
                }}
                multiline
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowAdd(false)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#F5F5F5",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    color: "#555",
                    fontSize: 15,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: "#6A1B9A",
                  alignItems: "center",
                }}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    style={{
                      fontFamily: "Poppins_700Bold",
                      color: "white",
                      fontSize: 15,
                    }}
                  >
                    Save Record
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}
