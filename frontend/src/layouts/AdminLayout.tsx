
import { Outlet } from "react-router-dom";
import { HeartHandshake } from "lucide-react";
import BottomNavigation from "../components/BottomNavigation";

export default function AdminLayout() {
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

        <div className="profile-avatar">
          A
        </div>
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
