import { useOutcomeData } from '../shared/useContract';

export function useGoals() {
  return useOutcomeData('outcomes.decide.goals');
}
