export function VerificationsSection({ onViewUsers }) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-[#E8EEE5] shadow-sm">
      <h3 className="font-black text-xl mb-3">🪪 Identity Verifications</h3>
      <p className="text-[#9BA8A0] mb-6">
        Review and verify users who submitted National ID or Passport photos.
      </p>
      <div className="bg-[#E8F5E9] rounded-2xl p-5 mb-6">
        <p className="font-bold text-[#2E4D2E] text-sm">
          ✅ Verified users get a "Verified" badge, building trust with buyers
          and sellers.
        </p>
      </div>
      <button
        onClick={onViewUsers}
        className="bg-[#4CAF50] text-white px-8 py-3.5 rounded-2xl font-black hover:bg-[#43A047] transition-all"
      >
        View All Users & Manage Verifications →
      </button>
    </div>
  );
}
