import { useState, useEffect, useCallback } from 'react';
import { STATUS } from 'react-joyride';

export function useTour(moduleName = null, isReady = true) {
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(() => {
    if (!moduleName) return false;
    return localStorage.getItem(`${moduleName}TourCompleted`) === 'true';
  });

  useEffect(() => {
    if (!moduleName || !isReady) return;

    const isPending = sessionStorage.getItem(`${moduleName}TourPending`) === 'true';
    if (!tourCompleted || isPending) {
      const timer = setTimeout(() => {
        setRunTour(true);
        sessionStorage.removeItem(`${moduleName}TourPending`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [moduleName, tourCompleted, isReady]);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type } = data;
    
    if (type === 'error') {
      console.error(`[Joyride ${moduleName || 'Manual'} Error]:`, data);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      if (moduleName) {
        localStorage.setItem(`${moduleName}TourCompleted`, 'true');
        setTourCompleted(true);
      }
    }
  }, [moduleName]);

  const startTour = useCallback(() => {
    setRunTour(true);
  }, []);

  return {
    runTour,
    tourCompleted,
    handleJoyrideCallback,
    startTour,
    setRunTour // sometimes needed manually
  };
}
