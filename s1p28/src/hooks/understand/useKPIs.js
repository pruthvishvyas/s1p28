import { useOutcomeData } from '../shared/useContract';

export function useKPIs() {
  return useOutcomeData('outcomes.understand.kpis');
}
