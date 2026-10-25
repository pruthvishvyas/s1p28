import { useOutcomeData } from './useContract';
export function useRunLog() {
  return useOutcomeData('meta.run_log');
}
export function useSummary() {
  return useOutcomeData('meta.summary');
}
