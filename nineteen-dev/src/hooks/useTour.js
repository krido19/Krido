import { useState, useEffect, useCallback } from 'react';
import { STATUS } from 'react-joyride';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export function useTour(moduleName = null, isReady = true) {
  const queryClient = useQueryClient();
  const [runTour, setRunTour] = useState(false);

  const { data: hasCompletedGlobalTour, isLoading } = useQuery({
    queryKey: ['tourCompleted'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data, error } = await supabase
          .from('profiles')
          .select('has_completed_tour')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        return !!data?.has_completed_tour;
      } catch (err) {
        return false;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const [localCompleted, setLocalCompleted] = useState(() => {
    if (!moduleName) return false;
    return localStorage.getItem(`${moduleName}TourCompleted`) === 'true';
  });

  const tourCompleted = hasCompletedGlobalTour || localCompleted;

  const completeTourMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_tour: true })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData(['tourCompleted'], true);
    }
  });

  useEffect(() => {
    if (isLoading || !moduleName || !isReady) return;

    const isPending = sessionStorage.getItem(`${moduleName}TourPending`) === 'true';
    if (!tourCompleted || isPending) {
      const timer = setTimeout(() => {
        setRunTour(true);
        sessionStorage.removeItem(`${moduleName}TourPending`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [moduleName, tourCompleted, isReady, isLoading]);

  const handleJoyrideCallback = useCallback((data) => {
    const { status, type } = data;
    
    if (type === 'error') {
      console.error(`[Joyride ${moduleName || 'Manual'} Error]:`, data);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      if (moduleName) {
        localStorage.setItem(`${moduleName}TourCompleted`, 'true');
        setLocalCompleted(true);
      }
      completeTourMutation.mutate();
    }
  }, [moduleName, completeTourMutation]);

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
