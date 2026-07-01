import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Bell,
  MapPin,
  Database,
  ChevronRight,
  Phone,
  Globe,
  Smartphone,
  LogOut,
  AlertTriangle,
  CheckCircle,
} from "lucide-react-native";

export default function PrivacySecurity() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [locationSharing, setLocationSharing] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [hideEmail, setHideEmail] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [emailVerif, setEmailVerif] = useState(true);
  const [phoneVerif, setPhoneVerif] = useState(false);
  const [dataAnalytics, setDataAnalytics] = useState(true);

  const securityScore = (() => {
    let s = 30;
    if (twoFactor) s += 25;
    if (loginAlerts) s += 15;
    if (emailVerif) s += 20;
    if (phoneVerif) s += 10;
    return Math.min(s, 100);
  })();
  const scoreColor =
    securityScore >= 70
      ? "#2E7D32"
      : securityScore >= 50
        ? "#F9A825"
        : "#E53935";

  const Section = ({ title, children }) => (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Poppins_700Bold",
          color: "#888",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 22,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {children}
      </View>
    </View>
  );

  const Row = ({
    label,
    sub,
    icon: Icon,
    iconColor,
    iconBg,
    toggle,
    value,
    onToggle,
    onPress,
    last,
    danger,
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: "#F5F5F5",
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: iconBg || "#E8F5E9",
          justifyContent: "center",
          alignItems: "center",
          marginRight: 14,
        }}
      >
        <Icon size={18} color={iconColor || "#2E7D32"} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Roboto_500Medium",
            color: danger ? "#C62828" : "#1A1A1A",
          }}
        >
          {label}
        </Text>
        {sub && (
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Roboto_400Regular",
              color: "#888",
              marginTop: 2,
            }}
          >
            {sub}
          </Text>
        )}
      </View>
      {toggle ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E0E0E0", true: "#81C784" }}
          thumbColor={value ? "#2E7D32" : "#AAA"}
        />
      ) : onPress ? (
        <ChevronRight size={18} color={danger ? "#C62828" : "#CCC"} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: "#6A1B9A",
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
          <Shield size={24} color="white" />
        </View>
        <View>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_700Bold",
              color: "white",
            }}
          >
            Privacy & Security
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Control your data and account safety
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Score */}
        <View
          style={{
            backgroundColor: "#6A1B9A",
            borderRadius: 22,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Poppins_700Bold",
                  color: "rgba(255,255,255,0.75)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Security Score
              </Text>
              <Text
                style={{
                  fontSize: 36,
                  fontFamily: "Poppins_900Black",
                  color: "white",
                }}
              >
                {securityScore}
                <Text style={{ fontSize: 18 }}>/100</Text>
              </Text>
            </View>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 5,
                borderColor: scoreColor,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Shield size={28} color={scoreColor} />
            </View>
          </View>
          {/* Score bar */}
          <View
            style={{
              height: 6,
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 3,
              overflow: "hidden",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: `${securityScore}%`,
                height: "100%",
                backgroundColor: scoreColor,
                borderRadius: 3,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Roboto_400Regular",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            {securityScore >= 70
              ? "✅ Your account is well protected."
              : "⚠️ Enable 2-Factor Authentication to improve your security score."}
          </Text>
        </View>

        <Section title="Account Security">
          <Row
            label="Two-Factor Authentication"
            sub="Require OTP code on login"
            icon={Lock}
            iconColor="#6A1B9A"
            iconBg="#F3E5F5"
            toggle
            value={twoFactor}
            onToggle={(val) => {
              if (val)
                Alert.alert(
                  "Enable 2FA",
                  "You'll receive an OTP on your phone each time you login.",
                  [
                    { text: "Enable", onPress: () => setTwoFactor(true) },
                    { text: "Cancel", style: "cancel" },
                  ],
                );
              else setTwoFactor(false);
            }}
          />
          <Row
            label="Login Alerts"
            sub="Get notified of new device logins"
            icon={Bell}
            iconColor="#E65100"
            iconBg="#FFF3E0"
            toggle
            value={loginAlerts}
            onToggle={setLoginAlerts}
          />
          <Row
            label="Email Verification"
            sub="Verify sign-in via email OTP"
            icon={Globe}
            iconColor="#2E7D32"
            iconBg="#E8F5E9"
            toggle
            value={emailVerif}
            onToggle={setEmailVerif}
          />
          <Row
            label="Phone Verification"
            sub="Verify sign-in via SMS OTP"
            icon={Phone}
            iconColor="#1565C0"
            iconBg="#E3F2FD"
            toggle
            value={phoneVerif}
            onToggle={setPhoneVerif}
          />
          <Row
            label="Change Password"
            sub="Update your account password"
            icon={Lock}
            iconColor="#1565C0"
            iconBg="#E3F2FD"
            onPress={() =>
              Alert.alert(
                "Change Password",
                "A password reset code will be sent to your email.",
                [
                  {
                    text: "Send Code",
                    onPress: () => router.push("/account/signin"),
                  },
                  { text: "Cancel", style: "cancel" },
                ],
              )
            }
            last
          />
        </Section>

        <Section title="Privacy Settings">
          <Row
            label="Public Profile"
            sub="Let others see your profile and farm details"
            icon={Eye}
            iconColor="#2E7D32"
            iconBg="#E8F5E9"
            toggle
            value={profilePublic}
            onToggle={setProfilePublic}
          />
          <Row
            label="Show Phone Number"
            sub="Allow verified users to see your contact"
            icon={Bell}
            iconColor="#00838F"
            iconBg="#E0F7FA"
            toggle
            value={phoneVisible}
            onToggle={setPhoneVisible}
          />
          <Row
            label="Hide Email Address"
            sub="Keep your email private"
            icon={Globe}
            iconColor="#6A1B9A"
            iconBg="#F3E5F5"
            toggle
            value={hideEmail}
            onToggle={setHideEmail}
          />
          <Row
            label="Location Sharing"
            sub="Show your region on the farmer map"
            icon={MapPin}
            iconColor="#E65100"
            iconBg="#FFF3E0"
            toggle
            value={locationSharing}
            onToggle={setLocationSharing}
            last
          />
        </Section>

        <Section title="Active Sessions">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#F5F5F5",
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: "#E8F5E9",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Smartphone size={18} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_500Medium",
                  color: "#1A1A1A",
                }}
              >
                This Device
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Roboto_400Regular",
                  color: "#888",
                  marginTop: 2,
                }}
              >
                Current session · Active now
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#E8F5E9",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Poppins_700Bold",
                  color: "#2E7D32",
                }}
              >
                ACTIVE
              </Text>
            </View>
          </View>
          <Row
            label="Logout All Devices"
            sub="Sign out from all other devices"
            icon={LogOut}
            iconColor="#C62828"
            iconBg="#FFEBEE"
            danger
            onPress={() =>
              Alert.alert(
                "Logout All Devices",
                "You will be signed out from all devices. You'll need to sign in again.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Logout All",
                    style: "destructive",
                    onPress: () =>
                      Alert.alert("✅ Done", "Logged out from all devices."),
                  },
                ],
              )
            }
            last
          />
        </Section>

        <Section title="Data & Analytics">
          <Row
            label="Usage Analytics"
            sub="Help improve AgriConnection by sharing usage data"
            icon={Database}
            iconColor="#555"
            iconBg="#F5F5F5"
            toggle
            value={dataAnalytics}
            onToggle={setDataAnalytics}
          />
          <Row
            label="Download My Data"
            sub="Get a copy of all your AgriConnection data"
            icon={Database}
            iconColor="#1565C0"
            iconBg="#E3F2FD"
            onPress={() =>
              Alert.alert(
                "Data Download",
                "Your data will be compiled and sent to your registered email within 48 hours.",
                [
                  { text: "Request Download" },
                  { text: "Cancel", style: "cancel" },
                ],
              )
            }
            last
          />
        </Section>

        <Section title="Account Management">
          <Row
            label="Block List"
            sub="Manage users you've blocked"
            icon={EyeOff}
            iconColor="#E65100"
            iconBg="#FFF3E0"
            onPress={() =>
              Alert.alert("Block List", "You have not blocked any users.")
            }
          />
          <Row
            label="Delete Account"
            sub="Permanently remove your account and all data"
            icon={EyeOff}
            iconColor="#C62828"
            iconBg="#FFEBEE"
            onPress={() =>
              Alert.alert(
                "⚠️ Delete Account",
                "This action is permanent and cannot be undone. All your products, orders and farm records will be deleted.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: () => {},
                  },
                ],
              )
            }
            last
          />
        </Section>

        <View
          style={{
            backgroundColor: "#F3E5F5",
            borderRadius: 18,
            padding: 16,
            borderWidth: 1.5,
            borderColor: "#CE93D8",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_700Bold",
              color: "#6A1B9A",
              marginBottom: 6,
            }}
          >
            🔐 How we protect your data
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Roboto_400Regular",
              color: "#6A1B9A",
              lineHeight: 18,
            }}
          >
            Your personal information is encrypted at rest and in transit. We
            never sell your data to third parties. All transactions are secured
            with bank-grade SSL encryption. Your farm location is only shared as
            a general county/region, never exact GPS coordinates.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
