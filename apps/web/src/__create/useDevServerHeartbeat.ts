import { useEffect, useRef } from 'react';

export function useDevServerHeartbeat() {
  const lastCall = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAction = () => {
      const now = Date.now();
      // Throttle to once every 3 minutes (180,000 ms)
      if (now - lastCall.current > 180_000) {
        lastCall.current = now;
        fetch('/', {
          method: 'GET',
        }).catch((error) => {
          // this is a no-op, we just want to keep the dev server alive
        });
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((event) => window.addEventListener(event, handleAction));

    // Run once initially
    handleAction();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleAction));
    };
  }, []);
}
