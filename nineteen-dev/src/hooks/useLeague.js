import { useQuery } from '@tanstack/react-query';
import { fetchFixtures, fetchStandings, fetchScorers } from '../lib/footballApi';

export function useLeagueFixtures(leagueCode) {
  return useQuery({
    queryKey: ['leagueFixtures', leagueCode],
    queryFn:  () => fetchFixtures(leagueCode),
    enabled:  !!leagueCode,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useLeagueStandings(leagueCode) {
  return useQuery({
    queryKey: ['leagueStandings', leagueCode],
    queryFn:  () => fetchStandings(leagueCode),
    enabled:  !!leagueCode,
    staleTime: 5 * 60_000,
  });
}

export function useLeagueScorers(leagueCode) {
  return useQuery({
    queryKey: ['leagueScorers', leagueCode],
    queryFn:  () => fetchScorers(leagueCode),
    enabled:  !!leagueCode,
    staleTime: 10 * 60_000,
  });
}
