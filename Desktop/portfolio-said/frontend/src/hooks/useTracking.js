import { useEffect, useRef } from 'react';
import { trackVisit, trackLeave } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

// Installe uuid : npm install uuid
export const useTracking = () => {
  const sessionId = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    // Générer un ID de session unique
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', uuidv4());
    }
    sessionId.current = sessionStorage.getItem('sessionId');
    startTime.current = Date.now();

    // Enregistrer la visite
    trackVisit(sessionId.current, window.location.pathname).catch(console.error);

    // Enregistrer le départ
    const handleLeave = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/leave`,
        JSON.stringify({ sessionId: sessionId.current, timeSpent })
      );
    };

    window.addEventListener('beforeunload', handleLeave);
    return () => window.removeEventListener('beforeunload', handleLeave);
  }, []);
};