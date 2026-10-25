import { useContract } from '../shared/useContract';
import { getPath, contractFiles, dataUrl } from '../../utils/contract';

// Simulation files are listed in the contract (a folder cannot be listed from a static site)
export function useSimulations() {
  const { contract, loading, error } = useContract();
  const dir = contract ? getPath(contract, 'outcomes.decide.simulations') : null;
  const names = contract && typeof dir === 'string' ? contractFiles(contract, dir) : [];
  const items = names.map(n => ({
    id: n.split('/').pop().replace(/\.json$/, ''),
    path: dataUrl(n)
  }));
  return { items, loading, error };
}
