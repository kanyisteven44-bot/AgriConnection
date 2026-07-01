import { useState, useCallback } from "react";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(
    async (search, role, page) => {
      const s = search !== undefined ? search : userSearch;
      const r = role !== undefined ? role : userRole;
      const p = page !== undefined ? page : userPage;
      setUsersLoading(true);
      try {
        const params = new URLSearchParams({ search: s, role: r, page: p });
        const res = await fetch(`/api/admin/users?${params}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
          setUserTotal(data.total || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUsersLoading(false);
      }
    },
    [userSearch, userRole, userPage],
  );

  const handleUserAction = async (id, action, extra, onSuccess, onError) => {
    setActionLoading(`${id}-${action}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      if (res.ok) {
        onSuccess?.();
        fetchUsers(userSearch, userRole, userPage);
      } else {
        onError?.();
      }
    } catch {
      onError?.();
    } finally {
      setActionLoading(null);
    }
  };

  return {
    users,
    userSearch,
    setUserSearch,
    userRole,
    setUserRole,
    userPage,
    setUserPage,
    userTotal,
    usersLoading,
    actionLoading,
    fetchUsers,
    handleUserAction,
  };
}
