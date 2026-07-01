export function Notification({ notification }) {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-xl text-sm font-black flex items-center gap-3 animate-bounce-once ${
        notification.type === "error"
          ? "bg-red-500 text-white"
          : "bg-[#4CAF50] text-white"
      }`}
    >
      {notification.type === "error" ? "❌" : "✅"} {notification.msg}
    </div>
  );
}
