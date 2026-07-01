import { UserSearchBar } from "@/components/AdminDashboard/UserSearchBar";
import { UserTable } from "@/components/AdminDashboard/UserTable";
import { Pagination } from "@/components/AdminDashboard/Pagination";

export function UserManagementSection({
  users,
  usersLoading,
  actionLoading,
  userSearch,
  setUserSearch,
  userRole,
  setUserRole,
  userPage,
  setUserPage,
  userTotal,
  onSearch,
  onUserAction,
  onViewDetail,
}) {
  return (
    <div>
      <UserSearchBar
        userSearch={userSearch}
        setUserSearch={setUserSearch}
        userRole={userRole}
        setUserRole={setUserRole}
        userTotal={userTotal}
        onSearch={onSearch}
      />

      <div className="bg-white rounded-3xl border border-[#E8EEE5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-[#F5F7FA]">
              <tr>
                {[
                  "User",
                  "Role",
                  "Location",
                  "ID Status",
                  "Products",
                  "Orders",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-5 text-[10px] font-black uppercase tracking-[2px] text-[#9BA8A0]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F5]">
              <UserTable
                users={users}
                usersLoading={usersLoading}
                actionLoading={actionLoading}
                onUserAction={onUserAction}
                onViewDetail={onViewDetail}
              />
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={userPage}
          total={userTotal}
          itemsPerPage={15}
          onPageChange={setUserPage}
        />
      </div>
    </div>
  );
}
