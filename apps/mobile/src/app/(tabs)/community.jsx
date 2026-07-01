"use client";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Animated,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useState, useEffect, useCallback, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import useUpload from "@/utils/useUpload";
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  X,
  Image as ImageIcon,
  Bookmark,
  BookmarkCheck,
  Flag,
  ChevronRight,
  Send,
  MoreHorizontal,
  Leaf,
  TrendingUp,
  ShoppingBag,
} from "lucide-react-native";

const CATEGORIES = [
  { key: "all", label: "🌍 All" },
  { key: "crop-farming", label: "🌾 Crops" },
  { key: "livestock", label: "🐄 Livestock" },
  { key: "pest-disease", label: "🦠 Pests" },
  { key: "market-tips", label: "📈 Market" },
  { key: "weather", label: "⛅ Weather" },
  { key: "ads", label: "🛒 Ads" },
  { key: "general", label: "💬 General" },
];

const POST_TYPES = [
  { key: "general", label: "💬 General Update", icon: "💬" },
  { key: "ad", label: "🛒 Product Advertisement", icon: "🛒" },
  { key: "tip", label: "🌱 Farming Tip", icon: "🌱" },
  { key: "question", label: "❓ Question", icon: "❓" },
  { key: "success", label: "🏆 Success Story", icon: "🏆" },
  { key: "alert", label: "⚠️ Alert / Warning", icon: "⚠️" },
];

const ROLE_COLORS = {
  farmer: "#2E7D32",
  buyer: "#1565C0",
  supplier: "#E65100",
  transporter: "#6A1B9A",
  expert: "#00838F",
  admin: "#333",
  consumer: "#888",
};

const DEMO_POSTS = [
  {
    id: "d1",
    content:
      "🌱 Just harvested 500kg of organic tomatoes! The raised-bed method combined with drip irrigation gave me 40% more yield than last season. Happy to share my technique with anyone interested. #OrganicFarming #AgriKE",
    category: "crop-farming",
    post_type: "success",
    likes_count: 47,
    comments_count: 12,
    shares_count: 5,
    is_liked: false,
    is_saved: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    author_name: "James Kamau",
    author_role: "farmer",
    author_verified: true,
  },
  {
    id: "d2",
    content:
      "⚠️ Warning to all maize farmers in Rift Valley: Fall Armyworm spotted in large numbers near Nakuru. Spray with chlorpyrifos or spinosad immediately. Early morning or evening spraying is most effective!",
    category: "pest-disease",
    post_type: "alert",
    likes_count: 89,
    comments_count: 31,
    shares_count: 44,
    is_liked: false,
    is_saved: false,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    author_name: "Dr. Mary Wanjiku",
    author_role: "expert",
    author_verified: true,
  },
  {
    id: "d3",
    content:
      "📈 Fresh tomatoes available — KSh 85/kg at Dagoretti market. Bulk buyers get better rates. WhatsApp 0712345678 for orders above 50kg. Free delivery within Nairobi for orders above 200kg! 🚚",
    category: "market-tips",
    post_type: "ad",
    likes_count: 134,
    comments_count: 44,
    shares_count: 22,
    is_liked: false,
    is_saved: false,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    author_name: "Peter Ouma",
    author_role: "buyer",
    author_verified: false,
  },
];

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommentRow({ comment }) {
  const initials = (comment.author_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const roleColor = ROLE_COLORS[comment.author_role] || "#888";
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
      {comment.author_photo || comment.author_image ? (
        <ExpoImage
          source={{ uri: comment.author_photo || comment.author_image }}
          style={{ width: 34, height: 34, borderRadius: 10 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: roleColor + "22",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_700Bold",
              color: roleColor,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      <View
        style={{
          flex: 1,
          backgroundColor: "#F5F7FA",
          borderRadius: 14,
          padding: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginBottom: 3,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_700Bold",
              color: "#1A1A1A",
            }}
          >
            {comment.author_name || "Farmer"}
          </Text>
          {comment.author_verified && <Text style={{ fontSize: 9 }}>✅</Text>}
          <Text style={{ fontSize: 10, color: "#AAA", marginLeft: "auto" }}>
            {timeAgo(comment.created_at)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "Roboto_400Regular",
            color: "#333",
            lineHeight: 20,
          }}
        >
          {comment.content}
        </Text>
      </View>
    </View>
  );
}

function PostCard({ post, onLike, onSave, onComment, auth }) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const roleColor = ROLE_COLORS[post.author_role] || "#888";
  const initials = (post.author_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 30,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
      }),
    ]).start();
    onLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(post.id);
  };

  const loadComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/community/comments?post_id=${post.id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      setShowComments(true);
      if (typeof post.id === "string" && post.id.startsWith("d")) return; // demo posts
      loadComments();
    } else {
      setShowComments(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || postingComment) return;
    if (!auth) {
      onComment();
      return;
    }
    setPostingComment(true);
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id, content: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
    } finally {
      setPostingComment(false);
    }
  };

  const typeEmoji =
    POST_TYPES.find((t) => t.key === post.post_type)?.icon || "💬";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350 }}
      style={{
        backgroundColor: "white",
        borderRadius: 22,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden",
      }}
    >
      {/* Ad badge */}
      {post.post_type === "ad" && (
        <View
          style={{
            backgroundColor: "#FFF3E0",
            paddingHorizontal: 12,
            paddingVertical: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ShoppingBag size={11} color="#E65100" />
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins_700Bold",
              color: "#E65100",
            }}
          >
            SPONSORED · PRODUCT AD
          </Text>
        </View>
      )}

      {/* Author Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          paddingBottom: 12,
        }}
      >
        {post.author_photo || post.author_image ? (
          <ExpoImage
            source={{ uri: post.author_photo || post.author_image }}
            style={{ width: 44, height: 44, borderRadius: 14 }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: roleColor + "22",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_700Bold",
                color: roleColor,
              }}
            >
              {initials}
            </Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              {post.author_name || "Farmer"}
            </Text>
            {post.author_verified && <Text style={{ fontSize: 10 }}>✅</Text>}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                backgroundColor: roleColor + "22",
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: "Poppins_700Bold",
                  color: roleColor,
                  textTransform: "capitalize",
                }}
              >
                {post.author_role || "Farmer"}
              </Text>
            </View>
            <Text style={{ fontSize: 10 }}>{typeEmoji}</Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "Roboto_400Regular",
                color: "#AAA",
              }}
            >
              {timeAgo(post.created_at)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setMenuOpen(!menuOpen)}
          style={{ padding: 4 }}
        >
          <MoreHorizontal size={18} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Context menu */}
      {menuOpen && (
        <View
          style={{
            backgroundColor: "#F9FBF9",
            marginHorizontal: 16,
            borderRadius: 14,
            padding: 8,
            marginBottom: 10,
          }}
        >
          {[
            {
              icon: "🔗",
              label: "Share post",
              action: () => {
                setMenuOpen(false);
                Alert.alert("Shared!", "Post link copied.");
              },
            },
            {
              icon: "🚩",
              label: "Report post",
              action: () => {
                setMenuOpen(false);
                Alert.alert(
                  "Reported",
                  "Thank you for your report. We'll review it shortly.",
                );
              },
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto_500Medium",
                  color: "#333",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setMenuOpen(false)}
            style={{ paddingVertical: 8, alignItems: "center" }}
          >
            <Text style={{ fontSize: 12, color: "#AAA" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "Roboto_400Regular",
          color: "#333",
          lineHeight: 22,
          paddingHorizontal: 16,
          paddingBottom: 12,
        }}
      >
        {post.content}
      </Text>

      {/* Image */}
      {(post.image_url || post.media_url) && (
        <ExpoImage
          source={{ uri: post.image_url || post.media_url }}
          style={{ width: "100%", height: 220 }}
          contentFit="cover"
        />
      )}

      {/* Action Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5",
          gap: 18,
        }}
      >
        {/* Like */}
        <Pressable
          onPress={handleLike}
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={20}
              color={post.is_liked ? "#E53935" : "#AAA"}
              fill={post.is_liked ? "#E53935" : "transparent"}
            />
          </Animated.View>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_600SemiBold",
              color: post.is_liked ? "#E53935" : "#888",
            }}
          >
            {post.likes_count}
          </Text>
        </Pressable>

        {/* Comment */}
        <Pressable
          onPress={toggleComments}
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <MessageCircle size={20} color={showComments ? "#2E7D32" : "#AAA"} />
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Poppins_600SemiBold",
              color: showComments ? "#2E7D32" : "#888",
            }}
          >
            {post.comments_count}
          </Text>
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={() => Alert.alert("Share", "Link copied to clipboard!")}
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <Share2 size={18} color="#AAA" />
          {post.shares_count > 0 && (
            <Text style={{ fontSize: 12, color: "#AAA" }}>
              {post.shares_count}
            </Text>
          )}
        </Pressable>

        <View style={{ flex: 1 }} />

        {/* Save/Bookmark */}
        <Pressable onPress={handleSave}>
          {post.is_saved ? (
            <BookmarkCheck size={20} color="#2E7D32" />
          ) : (
            <Bookmark size={20} color="#AAA" />
          )}
        </Pressable>
      </View>

      {/* Comments section */}
      {showComments && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: "#F5F5F5",
          }}
        >
          <View style={{ marginTop: 12 }}>
            {loadingComments ? (
              <ActivityIndicator
                color="#2E7D32"
                size="small"
                style={{ marginVertical: 8 }}
              />
            ) : comments.length > 0 ? (
              comments
                .slice(0, 5)
                .map((c, i) => <CommentRow key={i} comment={c} />)
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  color: "#AAA",
                  fontFamily: "Roboto_400Regular",
                  textAlign: "center",
                  paddingVertical: 8,
                }}
              >
                No comments yet. Be the first! 💬
              </Text>
            )}
          </View>
          {/* Comment input */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor="#BBB"
              style={{
                flex: 1,
                backgroundColor: "#F5F7FA",
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 13,
                fontFamily: "Roboto_400Regular",
                color: "#1A1A1A",
              }}
            />
            <TouchableOpacity
              onPress={submitComment}
              disabled={!commentText.trim() || postingComment}
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: commentText.trim() ? "#2E7D32" : "#DDD",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {postingComment ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Send size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </MotiView>
  );
}

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { auth, signIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("all");
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("crop-farming");
  const [newPostType, setNewPostType] = useState("general");
  const [newImage, setNewImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const [upload, { loading: uploading }] = useUpload();

  const fetchPosts = useCallback(
    async (cat = category) => {
      try {
        const url = `/api/community?category=${cat}&page=1`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const fetched = (data.posts || []).map((p) => ({
            ...p,
            is_saved: false,
          }));
          setPosts(fetched.length > 0 ? fetched : DEMO_POSTS);
        } else {
          setPosts(DEMO_POSTS);
        }
      } catch {
        setPosts(DEMO_POSTS);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [category],
  );

  useEffect(() => {
    fetchPosts(category);
  }, [category]);

  const handleLike = async (postId) => {
    if (!auth) {
      signIn();
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p,
      ),
    );
    try {
      await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch {}
  };

  const handleSave = async (postId) => {
    if (!auth) {
      signIn();
      return;
    }
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_saved: !p.is_saved } : p)),
    );
    try {
      await fetch("/api/community/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
    } catch {}
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to share images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setNewImage(result.assets[0].uri);
  };

  const handlePost = async () => {
    if (!newContent.trim()) {
      Alert.alert("Empty post", "Write something first!");
      return;
    }
    if (!auth) {
      signIn();
      return;
    }
    setPosting(true);
    try {
      let imageUrl = null;
      if (newImage) {
        const { url } = await upload({
          reactNativeAsset: { uri: newImage, type: "image/jpeg" },
        });
        imageUrl = url || null;
      }
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          image_url: imageUrl,
          category: newCategory,
          post_type: newPostType,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newPost = {
          ...data.post,
          author_name: auth?.user?.name || "You",
          author_role: "farmer",
          author_verified: false,
          is_liked: false,
          is_saved: false,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
        };
        setPosts((prev) => [newPost, ...prev]);
        setNewContent("");
        setNewImage(null);
        setShowCompose(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", "Could not post. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Could not post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const onlineCount = Math.floor(Math.random() * 50) + 120;

  return (
    <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 20,
          backgroundColor: "#1B5E20",
          paddingBottom: 18,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 22,
                fontFamily: "Poppins_700Bold",
                color: "white",
              }}
            >
              Community
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
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
                  fontSize: 11,
                  fontFamily: "Roboto_400Regular",
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {onlineCount} farmers online · {posts.length} posts
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => (auth ? setShowCompose(true) : signIn())}
            style={{
              backgroundColor: "#FBC02D",
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 16,
            }}
          >
            <Plus size={16} color="#1A1A1A" />
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_700Bold",
                color: "#1A1A1A",
              }}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginTop: 14 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            onPress={() => setCategory(cat.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: category === cat.key ? "#2E7D32" : "white",
              borderWidth: 1.5,
              borderColor: category === cat.key ? "#2E7D32" : "#DDD",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: category === cat.key ? "white" : "#555",
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPosts(category);
            }}
            tintColor="#2E7D32"
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            color="#2E7D32"
            size="large"
            style={{ marginTop: 60 }}
          />
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={signIn}
              auth={auth}
            />
          ))
        )}
      </ScrollView>

      {/* Compose Modal */}
      <Modal
        visible={showCompose}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={{ flex: 1, backgroundColor: "#F0F4F0" }}>
            {/* Modal Header */}
            <View
              style={{
                backgroundColor: "white",
                paddingTop: 16,
                paddingHorizontal: 20,
                paddingBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#F0F0F0",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setShowCompose(false);
                  setNewContent("");
                  setNewImage(null);
                }}
                style={{ marginRight: 14 }}
              >
                <X size={22} color="#333" />
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontFamily: "Poppins_700Bold",
                  color: "#1A1A1A",
                }}
              >
                New Post
              </Text>
              <TouchableOpacity
                onPress={handlePost}
                disabled={posting || !newContent.trim()}
                style={{
                  backgroundColor:
                    posting || !newContent.trim() ? "#CCC" : "#2E7D32",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 14,
                }}
              >
                {posting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Poppins_700Bold",
                      fontSize: 14,
                    }}
                  >
                    Post
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 20, gap: 14 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Post Type */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "#555",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Post Type
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {POST_TYPES.map((pt) => (
                    <TouchableOpacity
                      key={pt.key}
                      onPress={() => setNewPostType(pt.key)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor:
                          newPostType === pt.key ? "#1B5E20" : "white",
                        borderWidth: 1.5,
                        borderColor:
                          newPostType === pt.key ? "#1B5E20" : "#DDD",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Poppins_600SemiBold",
                          color: newPostType === pt.key ? "white" : "#555",
                        }}
                      >
                        {pt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Content */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <TextInput
                  value={newContent}
                  onChangeText={setNewContent}
                  placeholder={
                    newPostType === "ad"
                      ? "Describe your product, price, and how to order..."
                      : newPostType === "question"
                        ? "What would you like to ask the community?"
                        : newPostType === "alert"
                          ? "Describe the pest, disease, or warning..."
                          : "Share a farming tip, success story, or update..."
                  }
                  placeholderTextColor="#BBB"
                  multiline
                  style={{
                    fontSize: 15,
                    fontFamily: "Roboto_400Regular",
                    color: "#1A1A1A",
                    minHeight: 120,
                    lineHeight: 24,
                  }}
                  autoFocus
                />
              </View>

              {/* Image preview */}
              {newImage && (
                <View
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <ExpoImage
                    source={{ uri: newImage }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    onPress={() => setNewImage(null)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Category */}
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Poppins_700Bold",
                    color: "#555",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {CATEGORIES.slice(1).map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => setNewCategory(cat.key)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor:
                          newCategory === cat.key ? "#2E7D32" : "white",
                        borderWidth: 1.5,
                        borderColor:
                          newCategory === cat.key ? "#2E7D32" : "#DDD",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Poppins_600SemiBold",
                          color: newCategory === cat.key ? "white" : "#555",
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Add Photo */}
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1.5,
                  borderColor: "#E0E0E0",
                  borderStyle: "dashed",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "#E8F5E9",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ImageIcon size={20} color="#2E7D32" />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Poppins_600SemiBold",
                    color: "#444",
                  }}
                >
                  {uploading
                    ? "Uploading..."
                    : newImage
                      ? "Change Photo"
                      : "Add a Photo"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
