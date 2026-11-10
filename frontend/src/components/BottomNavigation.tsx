
import { ClipboardList, CalendarDays, Settings2 } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    path: "/admin/solicitacoes",
    label: "Solicitações",
    icon: ClipboardList,
  },
  {
    path: "/admin/agenda",
    label: "Agenda",
    icon: CalendarDays,
  },
  {
    path: "/admin/configuracoes",
    label: "Ajustes",
    icon: Settings2,
  },
];

export default function BottomNavigation() {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegação administrativa"
    >
      {navigation.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">
            <item.icon aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>

          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
