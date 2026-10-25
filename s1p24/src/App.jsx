import { ContractProvider } from './context/ContractContext.jsx';
import { useContract } from './hooks/shared/useContract.js';
import { TerminologyProvider } from './components/shared/TerminologyProvider.jsx';
import { OutcomeProvider } from './context/OutcomeContext.jsx';
import { Sidebar } from './components/shared/Sidebar.jsx';
import { Header } from './components/shared/Header.jsx';
import { SkeletonCard } from './components/shared/SkeletonCard.jsx';
import { EmptyState } from './components/shared/EmptyState.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Shell() {
  const { contract, loading, error } = useContract();
  if (loading) return <div className="boot"><SkeletonCard height={160} count={3} /></div>;
  if (error || !contract) {
    return (
      <div className="boot">
        <EmptyState message="The dashboard could not load its configuration."
          action={'Missing /data/meta/contract.json. Re-run generate_react_frontend.py, then npm run build. ' + (error || '')} />
      </div>
    );
  }
  return (
    <TerminologyProvider terms={contract.terminology}>
      <OutcomeProvider>
        <div className="app">
          <Sidebar />
          <div className="main">
            <Header />
            <main className="content"><Dashboard /></main>
          </div>
        </div>
      </OutcomeProvider>
    </TerminologyProvider>
  );
}

export default function App() {
  return <ContractProvider><Shell /></ContractProvider>;
}
