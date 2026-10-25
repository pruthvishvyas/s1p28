import { useOutcomeData } from '../shared/useContract';

export function useForecast() {
  return useOutcomeData('outcomes.monitor.forecast');
}
