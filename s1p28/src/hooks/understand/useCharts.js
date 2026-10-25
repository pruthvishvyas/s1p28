import { useOutcomeData, useContract } from '../shared/useContract';
import { getPath, resolveChartPath } from '../../utils/contract';

export function useCharts() {
  const r = useOutcomeData('outcomes.understand.charts');
  const { contract } = useContract();
  const indexRel = contract ? getPath(contract, 'outcomes.understand.charts') : null;
  const chartPath = entry => resolveChartPath(indexRel, entry && entry.file);
  return { ...r, chartPath };
}
