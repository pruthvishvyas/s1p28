import { useOutcomeData } from '../shared/useContract';

export function useAlerts() {
  return useOutcomeData('outcomes.monitor.alerts');
}
