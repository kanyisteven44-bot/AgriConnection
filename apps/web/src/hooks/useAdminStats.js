import { useState, useCallback } from "react";

export function useAdminStats() {
  const [stats, setStats] = useState(null);
  const [roleBreakdown, setRoleBreakdown] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRoleBreakdown(data.roleBreakdown || []);
        setRecentOrders(data.recentOrders || []);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    roleBreakdown,
    recentOrders,
    recentUsers,
    loading,
    fetchStats,
  };
}
