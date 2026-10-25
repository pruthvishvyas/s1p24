import { useLocation, Navigate } from 'react-router-dom';
import { VIEWS } from '../utils/views.js';
import { ErrorBoundary } from '../components/shared/ErrorBoundary.jsx';

export default function Dashboard() {
  const { pathname } = useLocation();
  const id = pathname.replace(/^\/+/, '');
  if (!id) return <Navigate to="/overview" replace />;
  const view = VIEWS.find((v) => v.id === id);
  if (!view) return <Navigate to="/overview" replace />;
  const View = view.component;
  return (
    <ErrorBoundary key={id}>
      <p className="page-desc">{view.desc}</p>
      <View />
    </ErrorBoundary>
  );
}
