import * as React from 'react';
import { useSession } from "@auth/create/react";


const useUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = React.useState(session?.user ?? null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const refetchUser = React.useCallback(async () => {
    if (!session?.user?.id) {
      setUser(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || session?.user);
      } else {
        setUser(session?.user);
      }
    } catch (err) {
      console.error('Error refetching user:', err);
      setError(err);
      setUser(session?.user);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  return {
    user,
    data: user,
    loading: status === 'loading' || loading,
    error,
    refetch: refetchUser
  };
};

export { useUser }

export default useUser;