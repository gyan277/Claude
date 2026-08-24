import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import Forums from './pages/Forums';
import Insights from './pages/Insights';

function GovRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'assembly' && user.role !== 'minister') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/policies/:id" element={<PolicyDetail />} />
      <Route path="/forums" element={<Forums />} />
      <Route
        path="/insights"
        element={
          <GovRoute>
            <Insights />
          </GovRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
