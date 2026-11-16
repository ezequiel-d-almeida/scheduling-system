import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { authenticated, loading, login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [submitting, setSubmitting] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? "/admin/solicitacoes";
  if (!loading && authenticated) return <Navigate to={destination} replace />;
  async function submit(event: FormEvent) { event.preventDefault(); if (submitting) return; setSubmitting(true); setError(""); try { await login(username.trim(), password); navigate(destination, { replace: true }); } catch { setError("Usuário ou senha inválidos."); } finally { setSubmitting(false); } }
  return <main className="login-page"><form className="login-card" onSubmit={submit}><LockKeyhole aria-hidden="true" size={28} strokeWidth={1.8} /><p className="eyebrow">Painel administrativo</p><h1>Entrar</h1><label>Usuário<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label><label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>{error && <p className="field-error" role="alert">{error}</p>}<button className="btn btn-primary" disabled={submitting}>{submitting ? "Entrando..." : "Entrar"}</button></form></main>;
}
