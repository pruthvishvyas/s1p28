import { ContractProvider, useContract } from './hooks/shared/useContract';
import { TerminologyProvider } from './components/shared/TerminologyProvider';
import { OutcomeProvider } from './context/OutcomeContext';
import { SkeletonCard } from './components/shared/SkeletonCard';
import { EmptyState } from './components/shared/EmptyState';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import Dashboard from './pages/Dashboard';

function Gate() {
  const { contract, loading, error } = useContract();
  if (loading) {
    return (
      <div className="loading-screen"><div style={{ width: 360 }}><SkeletonCard height={120} count={2} /></div></div>
    );
  }
  if (error || !contract) {
    return (
      <div className="error-screen">
        <EmptyState
          message="The dashboard could not load its contract file."
          action="Run the pipeline, then python generate_react_frontend.py, then npm run build and deploy again."
        />
      </div>
    );
  }
  return (
    <TerminologyProvider>
      <OutcomeProvider>
        <ErrorBoundary><Dashboard /></ErrorBoundary>
      </OutcomeProvider>
    </TerminologyProvider>
  );
}

export default function App() {
  return (
    <ContractProvider>
      <Gate />
    </ContractProvider>
  );
}
