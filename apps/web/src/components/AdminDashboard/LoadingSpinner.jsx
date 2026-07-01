export function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F7FA]">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-black text-[#2E4D2E] text-lg">
          Loading Admin Dashboard...
        </p>
      </div>
    </div>
  );
}
