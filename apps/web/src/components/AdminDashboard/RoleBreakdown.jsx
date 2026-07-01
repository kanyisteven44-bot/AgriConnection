export function RoleBreakdown({ roleBreakdown }) {
  if (roleBreakdown.length === 0) {
    return <p className="text-[#9BA8A0] text-sm">No user data yet.</p>;
  }

  const total =
    roleBreakdown.reduce((s, x) => s + parseInt(x.count || 0), 0) || 1;

  return (
    <div className="space-y-4">
      {roleBreakdown.map((r) => {
        const pct = Math.round((parseInt(r.count || 0) / total) * 100);
        return (
          <div key={r.role}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-bold capitalize text-[#333]">
                {r.role}
              </span>
              <span className="text-sm font-black text-[#2E7D32]">
                {r.count} ({pct}%)
              </span>
            </div>
            <div className="h-2.5 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4CAF50] to-[#81C784] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
