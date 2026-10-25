import { createContext, useContext, useState, useCallback } from 'react';

export const ExplorerContext = createContext({
  filters: {}, setFilter: () => {}, clearFilters: () => {}, activeFilters: 0,
  dateFrom: '', dateTo: '', setDateFrom: () => {}, setDateTo: () => {}, drill: null, setDrill: () => {}
});

export function ExplorerProvider({ children }) {
  const [filters, setFilters] = useState({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [drill, setDrill] = useState(null);

  const setFilter = useCallback((dimension, value) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value === '' || value === null || value === undefined) delete next[dimension];
      else next[dimension] = value;
      return next;
    });
  }, []);
  const clearFilters = useCallback(() => { setFilters({}); setDateFrom(''); setDateTo(''); setDrill(null); }, []);
  const activeFilters = Object.keys(filters).length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <ExplorerContext.Provider value={{ filters, setFilter, clearFilters, activeFilters, dateFrom, dateTo, setDateFrom, setDateTo, drill, setDrill }}>
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorer() {
  return useContext(ExplorerContext);
}
