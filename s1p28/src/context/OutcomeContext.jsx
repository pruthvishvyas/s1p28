import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OutcomeContext = createContext({ active: 'kpis', setActive: () => {} });

function initial() {
  try {
    const h = window.location.hash.replace('#', '');
    if (h) return h;
  } catch (e) { /* ignore */ }
  return 'kpis';
}

export function OutcomeProvider({ children }) {
  const [active, setActiveState] = useState(initial);
  const setActive = useCallback(id => {
    setActiveState(id);
    try { window.history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    try { window.scrollTo({ top: 0 }); } catch (e) { /* ignore */ }
  }, []);
  useEffect(() => {
    const onHash = () => setActiveState(initial());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return <OutcomeContext.Provider value={{ active, setActive }}>{children}</OutcomeContext.Provider>;
}

export function useOutcome() {
  return useContext(OutcomeContext);
}
