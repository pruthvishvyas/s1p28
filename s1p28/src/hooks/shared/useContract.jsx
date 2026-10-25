import { createContext, useContext } from 'react';
import { useData } from '../useData';
import { getPath, dataUrl } from '../../utils/contract';

const ContractContext = createContext({ contract: null, loading: true, error: null });

export function ContractProvider({ children }) {
  const { data, loading, error } = useData('/data/meta/contract.json');
  return <ContractContext.Provider value={{ contract: data, loading, error }}>{children}</ContractContext.Provider>;
}

export function useContract() {
  return useContext(ContractContext);
}

// Resolve a dotted contract key (e.g. "outcomes.understand.kpis") to a URL and fetch it through useData
export function useOutcomeData(dotted, options) {
  const { contract, loading: cl, error: ce } = useContract();
  const rel = contract ? getPath(contract, dotted) : null;
  const path = typeof rel === 'string' ? dataUrl(rel) : null;
  const r = useData(path, options);
  const missing = contract && !path ? 'The contract has no entry for ' + dotted : null;
  return { data: r.data, loading: Boolean(cl || r.loading), error: ce || r.error || missing, path };
}
