import { useOutcomeData } from '../shared/useContract';

export function useInsights() {
  return useOutcomeData('outcomes.decide.insights');
}
