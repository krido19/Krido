import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function useWorldCupFixtures() {
  const previousFixturesRef = useRef([]);

  const { data: fixtures, isLoading, error } = useQuery({
    queryKey: ['worldCupFixtures'],
    queryFn: async () => {
      const response = await fetch('https://worldcup26.ir/get/games');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      return data.games || [];
    },
    refetchInterval: 60000, // auto refresh every 60s
  });

  useEffect(() => {
    if (fixtures && fixtures.length > 0) {
      if (previousFixturesRef.current.length > 0) {
        // Compare with previous to find new goals
        fixtures.forEach(match => {
          const prevMatch = previousFixturesRef.current.find(m => m.id === match.id);
          if (prevMatch) {
            const isLive = match.time_elapsed !== 'notstarted' && match.finished !== 'TRUE' && match.finished !== true;
            if (isLive) {
              const currentHome = parseInt(match.home_score || '0', 10);
              const prevHome = parseInt(prevMatch.home_score || '0', 10);
              const currentAway = parseInt(match.away_score || '0', 10);
              const prevAway = parseInt(prevMatch.away_score || '0', 10);

              if (currentHome > prevHome) {
                toast.success(`⚽ GOL! ${match.home_team_name_en} ${currentHome} - ${currentAway} ${match.away_team_name_en}`, {
                  duration: 6000,
                  icon: '🔥',
                });
              } else if (currentAway > prevAway) {
                toast.success(`⚽ GOL! ${match.home_team_name_en} ${currentHome} - ${currentAway} ${match.away_team_name_en}`, {
                  duration: 6000,
                  icon: '🔥',
                });
              }
            }
          }
        });
      }
      previousFixturesRef.current = fixtures;
    }
  }, [fixtures]);

  return { fixtures: fixtures || [], loading: isLoading, error: error ? error.message : null };
}
