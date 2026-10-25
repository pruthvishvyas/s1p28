import { useOutcomeData } from '../shared/useContract';

export function useGoalProgress() {
  return useOutcomeData('outcomes.monitor.goal_progress');
}
