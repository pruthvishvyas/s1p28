import { useOutcomeData } from '../shared/useContract';

export function useSegments() {
  return useOutcomeData('outcomes.understand.segments');
}
