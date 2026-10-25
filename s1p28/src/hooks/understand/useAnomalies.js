import { useOutcomeData } from '../shared/useContract';

export function useAnomalies() {
  return useOutcomeData('outcomes.understand.anomalies');
}
