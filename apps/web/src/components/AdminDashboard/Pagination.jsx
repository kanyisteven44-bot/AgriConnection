export function Pagination({ currentPage, total, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(total / itemsPerPage);
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, total);
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="px-6 py-5 bg-[#F5F7FA] flex items-center justify-between border-t border-[#E8EEE5]">
      <p className="text-xs font-bold text-[#9BA8A0]">
        Showing {startItem}–{endItem} of {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8EEE5] text-sm font-black text-[#555] hover:bg-[#E8F5E9] disabled:opacity-40 transition-all"
        >
          ← Prev
        </button>
        <span className="px-4 py-2 font-black text-sm text-[#555]">
          Page {currentPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8EEE5] text-sm font-black text-[#555] hover:bg-[#E8F5E9] disabled:opacity-40 transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
