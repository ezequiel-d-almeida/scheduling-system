import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link className="public-brand" to="/" onClick={closeMenu}>
          <span className="public-brand-name">Clínica de Psicanálise</span>
          <span>um espaço de escuta</span>
        </Link>

        <button
          className="public-menu-button"
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`public-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação principal">
          <NavLink to="/#sobre" onClick={closeMenu}>Sobre</NavLink>
          <NavLink to="/#atendimentos" onClick={closeMenu}>Atendimentos</NavLink>
          <NavLink to="/agendar" className="public-nav-cta" onClick={closeMenu}>
            Solicitar horário
          </NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div>
          <p className="public-footer-title">Clínica de Psicanálise</p>
          <p>Este é um espaço de escuta, cuidado e respeito ao seu tempo.</p>
        </div>
        <div className="public-footer-links">
          <a href="https://api.whatsapp.com/send/?phone=5587981407336&text&type=phone_number&app_absent=0">Whatsapp</a>
          <Link to="/agendar">Solicitar horário</Link>
        </div>
        <p className="public-privacy">Suas informações são usadas somente para responder à sua solicitação de horário.</p>
      </footer>
    </div>
  );
}
