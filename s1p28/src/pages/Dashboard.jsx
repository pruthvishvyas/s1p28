import { useState, useMemo } from 'react';
import { useContract } from '../hooks/shared/useContract';
import { useOutcome } from '../context/OutcomeContext';
import { useTerm } from '../components/shared/TerminologyProvider';
import { useAlerts } from '../hooks/monitor/useAlerts';
import { buildTabs } from '../utils/terminology';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { PageTitle } from '../components/shared/PageTitle';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { KPICards } from '../components/understand/KPICards';
import { ChartPanel } from '../components/understand/ChartPanel';
import { SegmentExplorer } from '../components/understand/SegmentExplorer';
import { AnomalyTable } from '../components/understand/AnomalyTable';
import { InsightCards } from '../components/decide/InsightCards';
import { RecommendationEngine } from '../components/decide/RecommendationEngine';
import { WhatIfSimulator } from '../components/decide/WhatIfSimulator';
import { GoalTracker } from '../components/decide/GoalTracker';
import { Forecaster } from '../components/monitor/Forecaster';
import { GoalProgress } from '../components/monitor/GoalProgress';
import { AlertCenter } from '../components/monitor/AlertCenter';
import { InteractiveExplorer } from '../components/explorer/InteractiveExplorer';
import { UserManual } from '../components/manual/UserManual';

function Screen({ id }) {
  switch (id) {
    case 'kpis': return <KPICards />;
    case 'charts': return <ChartPanel outcome="UNDERSTAND" />;
    case 'segments': return <SegmentExplorer />;
    case 'anomalies': return <AnomalyTable />;
    case 'insights': return (<div><InsightCards /><h3 className="section-title">Evidence charts</h3><ChartPanel outcome="DECIDE" /></div>);
    case 'recommendations': return <RecommendationEngine />;
    case 'whatif': return <WhatIfSimulator />;
    case 'goals': return <GoalTracker />;
    case 'forecast': return (<div><Forecaster /><h3 className="section-title">Trend so far</h3><ChartPanel outcome="MONITOR" /></div>);
    case 'progress': return <GoalProgress />;
    case 'alerts': return <AlertCenter />;
    case 'explorer': return <InteractiveExplorer />;
    case 'manual': return <UserManual />;
    default: return <KPICards />;
  }
}

export default function Dashboard() {
  const { contract } = useContract();
  const term = useTerm();
  const { active, setActive } = useOutcome();
  const [open, setOpen] = useState(false);
  const { data: alerts } = useAlerts();
  const tabs = useMemo(() => buildTabs(term), [contract]);
  const all = tabs.flatMap(g => g.items);
  const current = all.find(t => t.id === active) || all[0];
  const name = (contract && contract.project && contract.project.name) || 'Dashboard';
  const nAlerts = alerts && Array.isArray(alerts.alerts) ? alerts.alerts.length : 0;
  return (
    <div className="app">
      <Sidebar title={name} tabs={tabs} active={current.id} onSelect={id => { setActive(id); setOpen(false); }} open={open} badges={{ alerts: nAlerts }} />
      <div className="main">
        <Header title={name} sub={contract && contract.project && contract.project.domain} onMenu={() => setOpen(!open)} />
        <main className="content">
          <PageTitle title={current.title} sub={current.sub} />
          <ErrorBoundary key={current.id}><Screen id={current.id} /></ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
