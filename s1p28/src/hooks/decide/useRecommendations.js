import { useOutcomeData } from '../shared/useContract';

export function useRecommendations() {
  return useOutcomeData('outcomes.decide.recommendations');
}
