import { useEffect, useRef } from 'react';

export const useTracking = () => {
  const sessionId = useRef(null);
  const startTime = useRef(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId',
        Math.random().toString(36).substring(2) + Date.now().toString(36)
      );
    }

    sessionId.current = sessionStorage.getItem('sessionId');
    startTime.current = Date.now();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    fetch(`${apiUrl}/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId.current,
        page: window.location.pathname
      })
    }).catch(() => {});

    const handleLeave = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon(
        `${apiUrl}/analytics/leave`,
        JSON.stringify({ sessionId: sessionId.current, timeSpent })
      );
    };

    window.addEventListener('beforeunload', handleLeave);
    return () => window.removeEventListener('beforeunload', handleLeave);
  }, []);
};