import { useContext, useMemo } from 'react';
import { TerminologyContext } from '../../context/TerminologyContext';
import { useContract } from '../../hooks/shared/useContract';

export function TerminologyProvider({ children }) {
  const { contract } = useContract();
  const terminology = (contract && contract.terminology) || {};
  const value = useMemo(() => ({ terminology }), [contract]);
  return <TerminologyContext.Provider value={value}>{children}</TerminologyContext.Provider>;
}

// term('revenue') -> client's word; term('transaction', true) -> plural
export function useTerm() {
  const { terminology } = useContext(TerminologyContext);
  return (key, plural = false) => {
    const w = terminology[key] || key;
    if (!plural) return w;
    if (/(s|x|ch|sh)$/i.test(w)) return w + 'es';
    if (/[^aeiou]y$/i.test(w)) return w.slice(0, -1) + 'ies';
    return w + 's';
  };
}
