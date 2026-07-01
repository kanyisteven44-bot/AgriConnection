"use client";
import { useState, useRef, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import useHandleStreamResponse from "@/utils/useHandleStreamResponse";

function AdvisorPage() {
  const { data: user } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("advice"); // 'advice' or 'disease'
  const [selectedImage, setSelectedImage] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const { url, error } = await upload({ file });
    if (!error) {
      setSelectedImage(url);
      setMode("disease");
      // Automatically send a query for disease detection
      await sendMessage(
        `[Image: ${url}] Analyze this plant for diseases.`,
        "disease",
      );
    }
    setLoading(false);
  };

  const sendMessage = async (text = input, currentMode = mode) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, type: currentMode }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.result },
      ]);
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F2] flex flex-col font-sans">
      <nav className="bg-[#2E4D2E] text-white p-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <a href="/farmer/dashboard" className="flex items-center space-x-2">
            <i className="fas fa-chevron-left"></i>
            <span className="font-bold">Dashboard</span>
          </a>
          <div className="flex items-center space-x-2">
            <i className="fas fa-robot text-[#8BC34A]"></i>
            <span className="text-xl font-black">Smart AI Advisor</span>
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        {/* Chat History */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pb-24 pt-4 px-2"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
              <div className="w-24 h-24 bg-[#E8EEE5] rounded-full flex items-center justify-center">
                <i className="fas fa-seedling text-[#4CAF50] text-4xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2E4D2E]">
                  How can I help you today?
                </h2>
                <p className="text-[#6B8E6B] mt-2">
                  Ask me about planting, pest control, or upload a photo of a
                  plant to detect diseases.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <button
                  onClick={() =>
                    setInput(
                      "What are the best crops to plant in Nakuru right now?",
                    )
                  }
                  className="p-4 bg-white rounded-2xl border border-[#E8EEE5] text-left hover:border-[#4CAF50] transition-all"
                >
                  <p className="text-xs font-bold text-[#6B8E6B] uppercase mb-1">
                    Planting Advice
                  </p>
                  <p className="text-sm font-medium text-[#2E4D2E]">
                    "What are the best crops to plant right now?"
                  </p>
                </button>
                <button
                  onClick={() =>
                    setInput(
                      "How do I control aphids on my tomatoes sustainably?",
                    )
                  }
                  className="p-4 bg-white rounded-2xl border border-[#E8EEE5] text-left hover:border-[#4CAF50] transition-all"
                >
                  <p className="text-xs font-bold text-[#6B8E6B] uppercase mb-1">
                    Pest Control
                  </p>
                  <p className="text-sm font-medium text-[#2E4D2E]">
                    "Sustainable way to control aphids on tomatoes?"
                  </p>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-5 shadow-sm ${
                  msg.role === "user"
                    ? "bg-[#4CAF50] text-white rounded-tr-none"
                    : "bg-white text-[#2E4D2E] rounded-tl-none border border-[#E8EEE5]"
                }`}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-3xl rounded-tl-none p-5 border border-[#E8EEE5] flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="fixed bottom-6 left-4 right-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-[32px] p-2 shadow-2xl border border-[#E8EEE5] flex items-center space-x-2">
            <button
              onClick={() => document.getElementById("ai-image-input").click()}
              className="w-12 h-12 rounded-full bg-[#F4F7F2] text-[#4CAF50] flex items-center justify-center hover:bg-[#E8EEE5] transition-all"
            >
              <i className="fas fa-camera"></i>
            </button>
            <input
              type="file"
              id="ai-image-input"
              hidden
              onChange={handleImageUpload}
              accept="image/*"
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about your farm..."
              className="flex-1 px-4 py-3 bg-transparent outline-none text-[#2E4D2E] placeholder-[#6B8E6B]"
            />

            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdvisorPage;
