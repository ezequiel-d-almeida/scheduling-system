import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute() {
  const { loading, authenticated } = useAuth(); const location = useLocation();
  if (loading) return <main className="page"><p className="muted">Verificando sessão...</p></main>;
  if (!authenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
