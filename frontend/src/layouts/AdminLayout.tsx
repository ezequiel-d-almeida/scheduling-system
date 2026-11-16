
import { Outlet, useNavigate } from "react-router-dom";
import { HeartHandshake, LogOut } from "lucide-react";
import { useEffect } from "react";
import BottomNavigation from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { useScheduling } from "../context/SchedulingContext";

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const { refreshAdminData } = useScheduling();
  const navigate = useNavigate();
  useEffect(() => { void refreshAdminData(); }, []);
  async function handleLogout() { await logout(); navigate("/admin/login", { replace: true }); }
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <HeartHandshake size={22} strokeWidth={1.8} />
          </span>

          <div>
            <strong>Minha Agenda</strong>
            <small>Painel administrativo</small>
          </div>
        </div>

        <div className="profile-avatar" title={username ?? "Administradora"}>{username?.slice(0, 1).toUpperCase() ?? "A"}</div>
        <button className="icon-button" type="button" onClick={() => void handleLogout()} aria-label="Encerrar sessão"><LogOut aria-hidden="true" size={20} strokeWidth={1.8} /></button>
      </header>

      <div className="app-body">
        <BottomNavigation />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
